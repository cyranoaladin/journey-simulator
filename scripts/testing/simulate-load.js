/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/* Load test simulation script (no real high-load infrastructure) */
const { orchestrateVerticalSlice } = require('../../mf-back/orchestration/zynoVerticalSlice');
const metricsStore = require('../../mf-back/orchestration/metricsStore');
const alertingEngine = require('../../mf-back/orchestration/alertingEngine');

const SCENARIOS = {
  progressive: {
    name: 'Progressive Ramp-Up (1 → 100 RPS)',
    duration: 5 * 60 * 1000, // 5 minutes
    rampUp: true,
    startRps: 1,
    endRps: 100,
  },
  burst: {
    name: 'Burst Load',
    duration: 30 * 1000, // 30 seconds
    burst: true,
    normalRps: 10,
    burstRps: 20,
    burstDuration: 10 * 1000, // 10 seconds
  },
  tenants: {
    name: 'Concurrent Tenants',
    duration: 5 * 60 * 1000, // 5 minutes
    tenants: 10,
    rpsPerTenant: 10,
  },
  presets: {
    name: 'Heavy Presets',
    duration: 3 * 60 * 1000, // 3 minutes
    rps: 20,
    presets: ['audit-dao', 'product-onboarding', 'investor-diligence'],
  },
  cache: {
    name: 'Cache Hot vs Cold',
    duration: 2 * 60 * 1000, // 2 minutes
    uniqueRequests: 50,
    repeatRequests: 50,
  },
  quota: {
    name: 'Quota Exhaustion',
    duration: 2 * 60 * 1000, // 2 minutes
    tenantId: 'test-quota-tenant',
    requests: 100,
  },
  cost: {
    name: 'Cost Budget Exceeded',
    duration: 3 * 60 * 1000, // 3 minutes
    rps: 15,
    heavyPresets: true,
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
      latency: response.metrics?.durationMs || duration,
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

async function runProgressive(scenario) {
  const results = [];
  const startTime = Date.now();
  const { startRps, endRps, duration } = scenario;
  let requestId = 0;
  const interval = duration / ((startRps + endRps) / 2 * duration / 1000);

  while (Date.now() - startTime < duration) {
    const elapsed = (Date.now() - startTime) / duration;
    const currentRps = startRps + (endRps - startRps) * elapsed;
    const delay = 1000 / currentRps;

    const promises = [];
    for (let i = 0; i < Math.ceil(currentRps); i++) {
      promises.push(
        makeRequest({
          traceId: `load-progressive-${requestId}`,
          runId: `load-progressive-${requestId}`,
          intent: 'security.audit',
          input: `progressive load test ${requestId}`,
        }, requestId++)
      );
    }

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    await sleep(delay);
  }

  return results;
}

async function runBurst(scenario) {
  const results = [];
  const { normalRps, burstRps, burstDuration, duration } = scenario;
  let requestId = 0;
  const normalDelay = 1000 / normalRps;
  const burstDelay = 1000 / burstRps;
  let inBurst = false;
  const burstStart = duration / 3;
  const burstEnd = burstStart + burstDuration;

  for (let elapsed = 0; elapsed < duration; elapsed += 100) {
    const isBurst = elapsed >= burstStart && elapsed < burstEnd;
    if (isBurst !== inBurst) {
      inBurst = isBurst;
    }

    const currentRps = inBurst ? burstRps : normalRps;
    const delay = inBurst ? burstDelay : normalDelay;
    const batchSize = Math.ceil(currentRps / 10);

    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      promises.push(
        makeRequest({
          traceId: `load-burst-${requestId}`,
          runId: `load-burst-${requestId}`,
          intent: 'security.audit',
          input: `burst load test ${requestId}`,
        }, requestId++)
      );
    }

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    await sleep(delay);
  }

  return results;
}

async function runTenants(scenario) {
  const results = [];
  const { tenants, rpsPerTenant, duration } = scenario;
  const startTime = Date.now();
  let requestId = 0;
  const delay = 1000 / (tenants * rpsPerTenant);

  while (Date.now() - startTime < duration) {
    const promises = [];
    for (let t = 0; t < tenants; t++) {
      const tenantId = `tenant-${t}`;
      for (let i = 0; i < rpsPerTenant; i++) {
        promises.push(
          makeRequest({
            traceId: `load-tenant-${tenantId}-${requestId}`,
            runId: `load-tenant-${tenantId}-${requestId}`,
            tenantId,
            intent: 'security.audit',
            input: `tenant load test ${requestId}`,
          }, requestId++)
        );
      }
    }

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    await sleep(delay);
  }

  return results;
}

async function runPresets(scenario) {
  const results = [];
  const { rps, presets, duration } = scenario;
  const startTime = Date.now();
  let requestId = 0;
  const delay = 1000 / rps;

  while (Date.now() - startTime < duration) {
    const preset = presets[requestId % presets.length];
    const result = await makeRequest({
      traceId: `load-preset-${requestId}`,
      runId: `load-preset-${requestId}`,
      preset,
      input: `preset load test ${requestId}`,
    }, requestId++);

    results.push(result);
    await sleep(delay);
  }

  return results;
}

async function runCache(scenario) {
  const results = [];
  const { uniqueRequests, repeatRequests } = scenario;
  let requestId = 0;

  // Cold: unique requests
  const coldResults = [];
  for (let i = 0; i < uniqueRequests; i++) {
    const result = await makeRequest({
      traceId: `load-cache-cold-${i}`,
      runId: `load-cache-cold-${i}`,
      intent: `unique-intent-${i}`,
      input: `cold cache test ${i}`,
    }, requestId++);
    coldResults.push(result);
    await sleep(100);
  }

  // Hot: repeat same requests
  const hotResults = [];
  for (let i = 0; i < repeatRequests; i++) {
    const idx = i % uniqueRequests;
    const result = await makeRequest({
      traceId: `load-cache-hot-${idx}`,
      runId: `load-cache-hot-${idx}`,
      intent: `unique-intent-${idx}`,
      input: `hot cache test ${idx}`,
    }, requestId++);
    hotResults.push(result);
    await sleep(100);
  }

  return { cold: coldResults, hot: hotResults };
}

async function runQuota(scenario) {
  const results = [];
  const { tenantId, requests } = scenario;

  for (let i = 0; i < requests; i++) {
    const result = await makeRequest({
      traceId: `load-quota-${i}`,
      runId: `load-quota-${i}`,
      tenantId,
      intent: 'security.audit',
      input: `quota test ${i}`,
    }, i);
    results.push(result);
    await sleep(100);
  }

  return results;
}

async function runCost(scenario) {
  const results = [];
  const { rps, duration } = scenario;
  const startTime = Date.now();
  let requestId = 0;
  const delay = 1000 / rps;
  const heavyPresets = ['audit-dao', 'product-onboarding', 'investor-diligence'];

  while (Date.now() - startTime < duration) {
    const preset = heavyPresets[requestId % heavyPresets.length];
    const result = await makeRequest({
      traceId: `load-cost-${requestId}`,
      runId: `load-cost-${requestId}`,
      preset,
      input: `cost test ${requestId}`,
    }, requestId++);

    results.push(result);
    await sleep(delay);
  }

  return results;
}

function aggregateResults(results) {
  const total = results.length;
  const success = results.filter((r) => r.success && r.status !== 'FAIL').length;
  const warn = results.filter((r) => r.status === 'WARN').length;
  const fail = results.filter((r) => !r.success || r.status === 'FAIL').length;
  const timeout = results.filter((r) => r.status === 'TIMEOUT').length;

  const latencies = results.map((r) => r.latency || r.duration).filter(Boolean).sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  const allFallbacks = results.flatMap((r) => r.fallbacks || []);
  const fallbackCounts = allFallbacks.reduce((acc, fb) => {
    acc[fb] = (acc[fb] || 0) + 1;
    return acc;
  }, {});

  const blocked = results.filter((r) => r.blocked).length;

  return {
    total,
    success,
    warn,
    fail,
    timeout,
    latency: { p95, p99 },
    errorRate: (fail + timeout) / total,
    fallbacks: fallbackCounts,
    blocked,
  };
}

async function main() {
  const scenarioName = process.argv.find((arg) => arg.startsWith('--scenario='))?.split('=')[1] || 'progressive';
  const scenario = SCENARIOS[scenarioName];

  if (!scenario) {
    console.error(`Unknown scenario: ${scenarioName}`);
    console.error(`Available: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  console.error(`Running scenario: ${scenario.name}`);
  const startTime = Date.now();

  let results;
  switch (scenarioName) {
    case 'progressive':
      results = await runProgressive(scenario);
      break;
    case 'burst':
      results = await runBurst(scenario);
      break;
    case 'tenants':
      results = await runTenants(scenario);
      break;
    case 'presets':
      results = await runPresets(scenario);
      break;
    case 'cache':
      results = await runCache(scenario);
      break;
    case 'quota':
      results = await runQuota(scenario);
      break;
    case 'cost':
      results = await runCost(scenario);
      break;
    default:
      throw new Error(`Unknown scenario: ${scenarioName}`);
  }

  const duration = Date.now() - startTime;
  const metricsSummary = metricsStore.summary();
  const alerts = alertingEngine.recentAlerts(10);

  let aggregated;
  if (scenarioName === 'cache') {
    aggregated = {
      cold: aggregateResults(results.cold),
      hot: aggregateResults(results.hot),
    };
  } else {
    aggregated = aggregateResults(Array.isArray(results) ? results : []);
  }

  const report = {
    scenario: scenarioName,
    name: scenario.name,
    duration,
    requests: aggregated.cold ? { cold: aggregated.cold.total, hot: aggregated.hot.total } : aggregated.total,
    metrics: aggregated.cold ? {
      cold: { latency: aggregated.cold.latency, errorRate: aggregated.cold.errorRate },
      hot: { latency: aggregated.hot.latency, errorRate: aggregated.hot.errorRate },
    } : {
      latency: aggregated.latency,
      errorRate: aggregated.errorRate,
      fallbacks: aggregated.fallbacks,
      blocked: aggregated.blocked,
    },
    systemMetrics: {
      window: metricsSummary.window,
      latency: metricsSummary.latency,
      rates: metricsSummary.rates,
    },
    alerts: alerts.map((a) => ({
      level: a.level,
      sloId: a.sloId,
      message: a.message,
    })),
    status: aggregated.cold ? 'PASS' : (aggregated.fail === 0 && aggregated.timeout === 0 ? 'PASS' : 'WARN'),
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error('Load test simulation failed:', error);
  process.exit(1);
});
