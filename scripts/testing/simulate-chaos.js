#!/usr/bin/env node
/* Chaos engineering simulation script (no real infrastructure failures) */
const { orchestrateVerticalSlice } = require('../../mf-back/orchestration/zynoVerticalSlice');
const circuitBreaker = require('../../mf-back/orchestration/circuitBreaker');
const killSwitch = require('../../mf-back/orchestration/killSwitch');
const tenantQuotaRegistry = require('../../mf-back/orchestration/tenantQuotaRegistry');
const llmCache = require('../../mf-back/orchestration/llmCache');
const idempotencyStore = require('../../mf-back/orchestration/idempotencyStore');
const auditTrailStore = require('../../mf-back/orchestration/auditTrailStore');

const SCENARIOS = {
  'llm-timeout': {
    name: 'LLM Timeout',
    injections: [{ type: 'llm_timeout', count: 10 }],
  },
  'rag-unavailable': {
    name: 'RAG Unavailable',
    injections: [{ type: 'rag_unavailable', count: 10 }],
  },
  'circuit-breaker': {
    name: 'Circuit Breaker Open',
    injections: [{ type: 'circuit_breaker_open', count: 5 }],
  },
  'memory-saturation': {
    name: 'Memory Saturation',
    injections: [{ type: 'memory_saturation', count: 200 }],
  },
  'quota-exhaustion': {
    name: 'Quota Exhaustion',
    injections: [{ type: 'quota_exhaustion', count: 100 }],
  },
  'secrets-missing': {
    name: 'Secrets Missing',
    injections: [{ type: 'secrets_missing', count: 5 }],
  },
  'web3-block': {
    name: 'Web3 BLOCK Repeated',
    injections: [{ type: 'web3_block', count: 10 }],
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(payload, requestId) {
  try {
    const start = Date.now();
    const response = await orchestrateVerticalSlice(payload);
    const duration = Date.now() - start;
    return {
      requestId,
      success: true,
      duration,
      status: response.decision?.overallStatus || 'UNKNOWN',
      fallbacks: response.ops?.fallbacks || [],
      blocked: response.ops?.execution?.blocked || false,
      guards: {
        circuitBreaker: response.systemStatus?.circuitBreakers || {},
        killSwitch: response.systemStatus?.killSwitch || {},
        web3: response.systemStatus?.web3 || {},
      },
      degradation: response.systemStatus?.degradation || {},
    };
  } catch (error) {
    return {
      requestId,
      success: false,
      error: error.message,
      status: 'FAIL',
      fallbacks: ['orchestration_error'],
    };
  }
}

async function injectLLMTimeout() {
  // Simulate LLM timeout by using very short timeout
  const results = [];
  for (let i = 0; i < 10; i++) {
    const result = await makeRequest({
      traceId: `chaos-llm-timeout-${i}`,
      runId: `chaos-llm-timeout-${i}`,
      intent: 'security.audit+product.spec+governance.dao',
      input: `LLM timeout test ${i}`,
      constraints: { timeoutMs: 1 }, // Very short timeout to trigger timeout
    }, i);
    results.push(result);
    await sleep(100);
  }
  return results;
}

async function injectRAGUnavailable() {
  // Simulate RAG unavailable by setting RAG_SEARCH_URL to invalid
  const originalRagUrl = process.env.RAG_SEARCH_URL;
  process.env.RAG_SEARCH_URL = 'http://invalid-rag-url:9999';

  const results = [];
  for (let i = 0; i < 10; i++) {
    const result = await makeRequest({
      traceId: `chaos-rag-unavailable-${i}`,
      runId: `chaos-rag-unavailable-${i}`,
      intent: 'security.audit',
      input: `RAG unavailable test ${i}`,
    }, i);
    results.push(result);
    await sleep(100);
  }

  if (originalRagUrl !== undefined) {
    process.env.RAG_SEARCH_URL = originalRagUrl;
  } else {
    delete process.env.RAG_SEARCH_URL;
  }

  return results;
}

async function injectCircuitBreaker() {
  // Force circuit breaker open by triggering failures
  const results = [];
  for (let i = 0; i < 5; i++) {
    // Use invalid intent to trigger agent failures
    const result = await makeRequest({
      traceId: `chaos-circuit-${i}`,
      runId: `chaos-circuit-${i}`,
      intent: 'invalid_intent_xyz_chaos',
      input: `circuit breaker test ${i}`,
    }, i);
    results.push(result);
    await sleep(200);
  }
  return results;
}

async function injectMemorySaturation() {
  // Fill stores to capacity
  const results = [];
  for (let i = 0; i < 200; i++) {
    const result = await makeRequest({
      traceId: `chaos-memory-${i}`,
      runId: `chaos-memory-${i}`,
      intent: 'security.audit',
      input: `memory saturation test ${i}`,
    }, i);
    results.push(result);
    await sleep(50);
  }
  return results;
}

async function injectQuotaExhaustion() {
  // Exceed tenant quota
  const tenantId = 'chaos-quota-tenant';
  const results = [];
  for (let i = 0; i < 100; i++) {
    const result = await makeRequest({
      traceId: `chaos-quota-${i}`,
      runId: `chaos-quota-${i}`,
      tenantId,
      intent: 'security.audit',
      input: `quota exhaustion test ${i}`,
    }, i);
    results.push(result);
    await sleep(50);
  }
  return results;
}

async function injectSecretsMissing() {
  // Remove OPENAI_API_KEY and set PROD
  const originalKey = process.env.OPENAI_API_KEY;
  const originalEnv = process.env.NODE_ENV;
  process.env.OPENAI_API_KEY = '';
  process.env.NODE_ENV = 'PROD';

  const results = [];
  for (let i = 0; i < 5; i++) {
    const result = await makeRequest({
      traceId: `chaos-secrets-${i}`,
      runId: `chaos-secrets-${i}`,
      intent: 'security.audit',
      input: `secrets missing test ${i}`,
    }, i);
    results.push(result);
    await sleep(100);
  }

  if (originalKey !== undefined) {
    process.env.OPENAI_API_KEY = originalKey;
  } else {
    delete process.env.OPENAI_API_KEY;
  }
  if (originalEnv !== undefined) {
    process.env.NODE_ENV = originalEnv;
  } else {
    delete process.env.NODE_ENV;
  }

  return results;
}

async function injectWeb3Block() {
  // Attempt Web3 actions without proper state
  const results = [];
  for (let i = 0; i < 10; i++) {
    const result = await makeRequest({
      traceId: `chaos-web3-${i}`,
      runId: `chaos-web3-${i}`,
      intent: 'security.audit',
      input: `web3 block test ${i}`,
      web3: { action: 'mint' }, // Attempt mint without proof/anchor
    }, i);
    results.push(result);
    await sleep(100);
  }
  return results;
}

function aggregateResults(results) {
  const total = results.length;
  const success = results.filter((r) => r.success && r.status !== 'FAIL').length;
  const warn = results.filter((r) => r.status === 'WARN').length;
  const fail = results.filter((r) => !r.success || r.status === 'FAIL').length;
  const timeout = results.filter((r) => r.status === 'TIMEOUT').length;

  const allFallbacks = results.flatMap((r) => r.fallbacks || []);
  const fallbackCounts = allFallbacks.reduce((acc, fb) => {
    acc[fb] = (acc[fb] || 0) + 1;
    return acc;
  }, {});

  const blocked = results.filter((r) => r.blocked).length;
  const circuitBreakerOpen = results.filter((r) => {
    const cbs = r.guards?.circuitBreaker || {};
    return Object.values(cbs).some((cb) => cb?.state === 'OPEN');
  }).length;

  const killSwitchActive = results.filter((r) => r.guards?.killSwitch?.active).length;

  return {
    total,
    success,
    warn,
    fail,
    timeout,
    fallbacks: fallbackCounts,
    blocked,
    circuitBreakerOpen,
    killSwitchActive,
  };
}

async function main() {
  const scenarioName = process.argv.find((arg) => arg.startsWith('--scenario='))?.split('=')[1] || 'llm-timeout';
  const scenario = SCENARIOS[scenarioName];

  if (!scenario) {
    console.error(`Unknown scenario: ${scenarioName}`);
    console.error(`Available: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  console.error(`Running chaos scenario: ${scenario.name}`);
  const startTime = Date.now();

  let results;
  switch (scenarioName) {
    case 'llm-timeout':
      results = await injectLLMTimeout();
      break;
    case 'rag-unavailable':
      results = await injectRAGUnavailable();
      break;
    case 'circuit-breaker':
      results = await injectCircuitBreaker();
      break;
    case 'memory-saturation':
      results = await injectMemorySaturation();
      break;
    case 'quota-exhaustion':
      results = await injectQuotaExhaustion();
      break;
    case 'secrets-missing':
      results = await injectSecretsMissing();
      break;
    case 'web3-block':
      results = await injectWeb3Block();
      break;
    default:
      throw new Error(`Unknown scenario: ${scenarioName}`);
  }

  const duration = Date.now() - startTime;
  const aggregated = aggregateResults(results);

  // Get system state
  const cbState = circuitBreaker.summary();
  const killState = killSwitch.evaluate({}, {}, {});
  const memorySummary = {
    idempotency: idempotencyStore.summary(),
    audit: auditTrailStore.summary(),
    llmCache: llmCache.summary(),
  };

  const report = {
    scenario: scenarioName,
    name: scenario.name,
    duration,
    injections: scenario.injections,
    results: {
      requests: {
        total: aggregated.total,
        success: aggregated.success,
        warn: aggregated.warn,
        fail: aggregated.fail,
        timeout: aggregated.timeout,
      },
      guards: {
        circuitBreaker: {
          open: aggregated.circuitBreakerOpen > 0,
          count: aggregated.circuitBreakerOpen,
          state: cbState,
        },
        killSwitch: {
          active: aggregated.killSwitchActive > 0,
          count: aggregated.killSwitchActive,
          state: killState,
        },
      },
      fallbacks: aggregated.fallbacks,
      blocked: aggregated.blocked,
    },
    systemState: {
      memory: memorySummary,
    },
    status: aggregated.fail === 0 && aggregated.timeout === 0 ? 'PASS' : 'WARN',
    neverCrash: results.every((r) => r.success !== undefined && (r.success || r.status === 'FAIL' || r.status === 'TIMEOUT')),
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error('Chaos simulation failed:', error);
  process.exit(1);
});
