const { normalizeRequest } = require('./agentProtocol');
const { RAGClient } = require('./ragClient');
const { routeIntent } = require('./intentRouter');
const registry = require('../agents/registry');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;
const memoryStore = require('./memoryStore');
const executionGate = require('./executionGate');
const fs = require('fs');
const path = require('path');
const toolsRegistry = require('./toolsRegistry');
const executionEngine = require('./executionEngine');
const workflowMap = require('./workflowMap');
const { applyRagPolicy } = require('./ragPolicy');
const productionGuards = require('./productionGuards');
const auditTrailStore = require('./auditTrailStore');
const { validateRequest, sanitizeAgentResponse } = require('./vsliceSchema');
const metricsStore = require('./metricsStore');
const alertingEngine = require('./alertingEngine');
const llmCache = require('./llmCache');
const costModel = require('./costModel');
const tenantQuotaRegistry = require('./tenantQuotaRegistry');
const circuitBreaker = require('./circuitBreaker');
const concurrencyManager = require('./concurrencyManager');
const secretsPolicy = require('./secretsPolicy');
const idempotencyStore = require('./idempotencyStore');
const crypto = require('crypto');
const web3Guards = require('./web3Guards');
const web3Pipeline = require('./web3Pipeline');
const killSwitch = require('./killSwitch');
const telemetryAdapter = require('./telemetryAdapter');
const degradationPolicy = require('./degradationPolicy');
const artifactStore = require('./artifactStore');
const actionToolMapper = require('./actionToolMapper');

const ragClient = new RAGClient();
const logger = createLogger(__filename);

const buildAgentsPool = () => {
  const pool = {};
  registry.forEach((meta) => {
    try {
      const AgentClass = require(`../agents/${meta.agentId}`);
      pool[meta.agentId] = new AgentClass();
    } catch (err) {
      logger.warn('Agent module load failed', { agentId: meta.agentId, error: err.message });
    }
  });
  return pool;
};

const agentsPool = buildAgentsPool();

const registryIndex = registry.reduce((acc, agent) => {
  acc[agent.agentId] = agent;
  return acc;
}, {});

const BUDGETS = {
  DEV: { maxTokens: 800, timeoutMs: 6000, maxAgents: 20 },
  STAGING: { maxTokens: 700, timeoutMs: 5500, maxAgents: 10 },
  PROD: { maxTokens: 600, timeoutMs: 5000, maxAgents: 8 },
};

const envAgentEnabled = (agentId) => {
  const key = `AGENT_${agentId.toUpperCase()}_ENABLED`;
  if (process.env[key] === 'true') return true;
  if (process.env[key] === 'false') return false;
  return undefined;
};

const isAgentEnabled = (agentId) => {
  const override = envAgentEnabled(agentId);
  if (override !== undefined) return override;
  const meta = registryIndex[agentId];
  return meta?.enabled !== false;
};

const envBudget = () => {
  const name = (process.env.RUNTIME_ENV || process.env.NODE_ENV || 'DEV').toUpperCase();
  return BUDGETS[name] || BUDGETS.DEV;
};

const loadPresets = () => {
  const dir = path.join(__dirname, 'presets');
  const map = {};
  if (!fs.existsSync(dir)) return map;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  files.forEach((file) => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (content?.name) map[content.name] = content;
    } catch (err) {
      // ignore bad preset files
    }
  });
  return map;
};

const PRESETS = loadPresets();

const getAgentIdForIntent = (intent) => {
  const match = registry.find((a) => isAgentEnabled(a.agentId) && a.intents.includes(intent));
  return match ? match.agentId : null;
};

const resolveWorkflowIntents = (journey = null) => {
  if (!journey?.journeyType || !journey?.phaseId) return [];
  const journeyDef = workflowMap[journey.journeyType];
  if (!journeyDef?.phases) return [];
  const intents = journeyDef.phases[journey.phaseId] || [];
  return Array.isArray(intents) ? intents : [];
};

const dedupeAndOrderIntents = (intents = []) => {
  const unique = new Map();
  intents.forEach((i) => {
    if (i === null || i === undefined) return;
    const raw = Array.isArray(i) ? i.join('+') : i;
    const parts = String(raw || '')
      .toLowerCase()
      .replace(/\./g, '_')
      .split('+')
      .filter(Boolean);
    parts.forEach((key) => {
      if (key) unique.set(key, key);
    });
  });
  return Array.from(unique.values()).sort((a, b) => {
    const pa = registryIndex[getAgentIdForIntent(a)]?.priority || 0;
    const pb = registryIndex[getAgentIdForIntent(b)]?.priority || 0;
    if (pb !== pa) return pb - pa;
    return a.localeCompare(b);
  });
};

const normalizeTenantId = (val) => {
  if (!val) return 'default';
  const str = String(val || '').trim().toLowerCase();
  if (!str) return 'default';
  const sanitized = str.replace(/[^a-z0-9_-]/g, '-').slice(0, 32);
  return sanitized || 'default';
};

const resolveTenantId = (payload = {}) => {
  const headerTenant = payload.headers?.['x-tenant-id'] || payload.headers?.['x-tenant'] || payload.headers?.['tenant-id'];
  const ctxTenant = payload.context?.tenantId;
  return normalizeTenantId(headerTenant || ctxTenant || 'default');
};

const STATUS_BASE_SCORE = {
  OK: 80,
  WARN: 55,
  FAIL: 20,
  TIMEOUT: 10,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const computeScores = (agentResult, meta, effectiveWeight) => {
  const base = STATUS_BASE_SCORE[agentResult.status] ?? STATUS_BASE_SCORE.FAIL;
  const hasActions = Array.isArray(agentResult.actions) && agentResult.actions.length > 0;
  const hasErrors = Array.isArray(agentResult.errors) && agentResult.errors.length > 0;
  let raw = base;
  if (hasActions) raw += 10;
  if (hasErrors) raw -= 10;
  raw = clamp(raw, 0, 100);
  const weight = typeof effectiveWeight === 'number' ? effectiveWeight : typeof meta?.confidenceWeight === 'number' ? meta.confidenceWeight : 1;
  const weighted = clamp(Math.round(raw * weight), 0, 100);
  return { raw, weighted };
};

const OPPOSITES = [
  ['allow', 'deny'],
  ['enable', 'disable'],
  ['add', 'remove'],
  ['permit', 'block'],
];

const tokenize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 3 && !['allow', 'deny', 'enable', 'disable', 'add', 'remove', 'permit', 'block'].includes(t)
    );

const detectOppositePair = (a, b) => {
  const aText = (typeof a === 'string' ? a : JSON.stringify(a || '')).toLowerCase();
  const bText = (typeof b === 'string' ? b : JSON.stringify(b || '')).toLowerCase();
  for (const [pos, neg] of OPPOSITES) {
    const hasPos = aText.includes(pos) || bText.includes(pos);
    const hasNeg = aText.includes(neg) || bText.includes(neg);
    if (hasPos && hasNeg) {
      const tokensA = tokenize(aText);
      const tokensB = tokenize(bText);
      const topic = tokensA.find((t) => tokensB.includes(t));
      if (topic) {
        return { pos, neg, topic };
      }
    }
  }
  const hasMust = aText.includes('must ') || bText.includes('must ');
  const hasMustNot = aText.includes('must not') || bText.includes('must not') || aText.includes("mustn't") || bText.includes("mustn't");
  if (hasMust && hasMustNot) {
    const tokensA = tokenize(aText);
    const tokensB = tokenize(bText);
    const topic = tokensA.find((t) => tokensB.includes(t));
    if (topic) return { pos: 'must', neg: 'must_not', topic };
  }
  return null;
};

const detectContradictions = (runs) => {
  const contradictions = [];
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i];
      const b = runs[j];
      const actionsA = Array.isArray(a.actions) ? a.actions : [];
      const actionsB = Array.isArray(b.actions) ? b.actions : [];
      let found = false;
      for (const actA of actionsA) {
        for (const actB of actionsB) {
          const opp = detectOppositePair(actA, actB);
          if (opp) {
            contradictions.push({
              agents: [a.agentId, b.agentId],
              reason: `Opposite actions (${opp.pos} vs ${opp.neg}) on topic "${opp.topic}"`,
            });
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) continue;
      const oppSummary = detectOppositePair(a.summary || '', b.summary || '');
      if (oppSummary) {
        contradictions.push({
          agents: [a.agentId, b.agentId],
          reason: `Opposite summaries (${oppSummary.pos} vs ${oppSummary.neg}) on topic "${oppSummary.topic}"`,
        });
      }
    }
  }
  return contradictions;
};

const computeLearningScores = (selected, registryIndex, memoryEntries) => {
  const history = Array.isArray(memoryEntries) ? memoryEntries : [];
  const result = {};
  const WINDOW = 5;

  selected.forEach((sel) => {
    const meta = registryIndex[sel.agentId] || {};
    const base = typeof meta.confidenceWeight === 'number' ? meta.confidenceWeight : 1;
    const perAgent = history
      .filter((entry) => entry?.data?.agents?.some((a) => a.agentId === sel.agentId))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, WINDOW);

    let okCount = 0;
    let failCount = 0;
    let timeoutCount = 0;
    let contradictionCount = 0;

    perAgent.forEach((entry) => {
      const agentRes = (entry.data.agents || []).find((a) => a.agentId === sel.agentId);
      if (agentRes?.status === 'OK') okCount += 1;
      if (agentRes?.status === 'FAIL') failCount += 1;
      if (agentRes?.status === 'TIMEOUT') timeoutCount += 1;
      const contras = entry.data.contradictions || [];
      if (contras.some((c) => Array.isArray(c.agents) && c.agents.includes(sel.agentId))) {
        contradictionCount += 1;
      } else if (contras.length > 0) {
        // if contradictions are present but agents list not explicit, apply a small penalty
        contradictionCount += 1;
      }
    });

    const successBonus = okCount * 0.03 * base;
    const failurePenalty = failCount * 0.06 * base;
    const timeoutPenalty = timeoutCount * 0.08 * base;
    const contradictionPenalty = contradictionCount * 0.08 * base;
    let learningScore = base + successBonus - failurePenalty - timeoutPenalty - contradictionPenalty;
    learningScore = clamp(learningScore, 0.1, base * 1.5);
    const delta = learningScore - base;

    result[sel.agentId] = {
      agentId: sel.agentId,
      baseConfidence: base,
      learningScore,
      delta,
    };
  });

  return result;
};

// Legacy mapActionToTool kept for backward compatibility, but actionToolMapper is preferred
const mapActionToTool = (action) => {
  const mapped = actionToolMapper.mapActionToTool(action);
  return mapped.tool || null;
};

const timeoutGuard = (promise, ms, agentId, traceId) => {
  return Promise.race([
    promise,
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            agentId,
            status: 'TIMEOUT',
            summary: 'Agent execution timed out',
            actions: [],
            citations: [],
            metrics: { latencyMs: ms },
            errors: ['timeout'],
            mock: false,
            traceId,
          }),
        ms
      )
    ),
  ]);
};

async function orchestrateVerticalSlice(payload) {
  const startedAll = Date.now();
  let aggregated = null;
  let slot = null;
  let acquiredSlot = false;
  let lastWeb3Guard = {
    level: 'OK',
    allowed: true,
    reasons: [],
    diagnostics: { proof: {}, anchor: {}, mint: {} },
  };
  let idempotentReplays = 0;
  const demoMode = process.env.DEMO_MODE === 'true';
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const tenantId = resolveTenantId(payload || {});
  const coldStart = !global.__ZYNO_COLD_STARTED__;
  if (coldStart) {
    circuitBreaker.coldReset();
    concurrencyManager.reset();
    global.__ZYNO_COLD_STARTED__ = true;
  }

  const addUnique = (arr, value) => {
    if (!value) return;
    if (!arr.includes(value)) arr.push(value);
  };

  // Helper to safely get traceId from req or payload
  const getTraceId = (reqObj, payloadObj) => {
    return reqObj?.traceId || payloadObj?.traceId || 'unknown';
  };

  const resolveJourneyName = (req, preset) => {
    if (preset?.journey) return preset.journey;
    if (req.context?.journey?.journeyType && workflowMap[req.context.journey.journeyType]) {
      return req.context.journey.journeyType;
    }
    const intents =
      Array.isArray(req.intent) ? req.intent : typeof req.intent === 'string' ? req.intent.split('+') : [];
    const normalized = intents.map((i) => (i || '').toLowerCase().replace(/\./g, '_'));
    if (normalized.some((i) => i.includes('governance') || i.includes('compliance') || i.includes('risk_fraud'))) return 'dao_readiness';
    if (normalized.some((i) => i.includes('investor'))) return 'investor_fundraise';
    if (normalized.some((i) => i.includes('product_spec') || i.includes('ux_writing'))) return 'product_launch';
    return 'generic';
  };

  const resolvePhaseSequence = (journeyName) => {
    const phases = workflowMap[journeyName]?.phases || {};
    return Object.keys(phases);
  };

  const validation = validateRequest(payload);
  let validationWarnings = validation.warnings || [];

  try {
    let req = validation.req;
    const ops = {
      warnings: [],
      disabledAgents: [],
      fallbacks: [],
      timeouts: [],
      failures: [],
      rag: { mode: 'disabled', domain: null, hits: 0 },
      llm: {
        mode: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
        provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
        model: 'gpt-4o',
        calls: 0,
        cacheHits: 0,
        deduplicatedCalls: 0,
      },
      execution: { mode: 'DRY_RUN', attempted: false, blocked: false, blockReasons: [] },
      retries: { attempted: false, count: 0, reason: null },
      concurrency: { queued: 0, running: 0, max: 0, shed: false },
    };
    ops.warnings.push(...validation.warnings);


    const presetName = payload?.preset;
    const preset = presetName ? PRESETS[presetName] : null;
    if (preset) {
      const originalIntent = payload?.intent;
      const usePresetIntents = originalIntent == null || originalIntent === 'default' || (typeof originalIntent === 'string' && originalIntent.trim() === 'default');
      req = {
        ...req,
        intent: usePresetIntents ? (preset.intents || req.intent) : req.intent,
        input: req.input || preset.sampleInput || payload?.input,
        context: {
          ...(req.context || {}),
          journey: preset.journey || req.context?.journey,
        },
      };
      ops.warnings = ops.warnings.filter((w) => w !== 'invalid_input_schema');
      addUnique(ops.warnings, 'preset_applied');
    }

    const journeyName = resolveJourneyName(req, preset);
    const phaseSequence = resolvePhaseSequence(journeyName);
    const runKey = req?.runId || req?.traceId || payload?.runId || payload?.traceId || 'unknown';
    const completedPhases = artifactStore.phasesCompleted({ tenantId, runId: runKey, journey: journeyName });
    const requestedPhase = req?.constraints?.phase || req?.context?.journey?.phaseId;
    const contextPhases = Array.isArray(req?.context?.journey?.phases) ? req.context.journey.phases : [];
    let currentPhase = requestedPhase && phaseSequence.includes(requestedPhase) ? requestedPhase : null;
    if (!currentPhase && contextPhases.length > 0) {
      currentPhase = contextPhases[contextPhases.length - 1] || null;
    }
    if (!currentPhase) {
      currentPhase = phaseSequence[completedPhases.length] || phaseSequence[0] || null;
    }
    const phaseIndex = currentPhase ? phaseSequence.indexOf(currentPhase) : 0;
    const phasesExecuted = contextPhases.length > 0 ? contextPhases : completedPhases;
    const artifactsSoFar = artifactStore.getArtifacts({ tenantId, runId: runKey, journey: journeyName });
    const phaseSnapshot = currentPhase
      ? artifactStore.getPhaseSnapshot({ tenantId, runId: runKey, journey: journeyName, phase: currentPhase })
      : null;

    req = {
      ...req,
      context: {
        ...(req.context || {}),
        journey: {
          ...(req.context?.journey || {}),
          journeyType: journeyName,
          phaseId: currentPhase || req.context?.journey?.phaseId,
          phases: phaseSequence,
        },
      },
    };

    const demoMode = process.env.DEMO_MODE === 'true';
    const originalOpenAIKey = process.env.OPENAI_API_KEY;
    if (demoMode) {
      process.env.OPENAI_API_KEY = '';
      ops.llm.mode = 'mock';
      ops.llm.provider = 'mock';
      addUnique(ops.fallbacks, 'demo_mode');
    }

    // Secrets policy (applied after guards evaluation)
    const secretsDecision = secretsPolicy.evaluate({
      env: process.env.RUNTIME_ENV || process.env.NODE_ENV || 'DEV',
      mode: demoMode ? 'DEMO' : process.env.RUNTIME_ENV || process.env.NODE_ENV || 'DEV',
    });
    ops.securityWarnings = secretsDecision.warnings || [];

    const cbState = circuitBreaker.summary(tenantId)[tenantId];
    const allowLlm = circuitBreaker.canProceed(tenantId, 'llm');
    if (!allowLlm) {
      ops.llm.mode = 'mock';
      ops.llm.provider = 'mock';
      addUnique(ops.fallbacks, 'circuit_breaker_llm');
    }
    let allowRag = circuitBreaker.canProceed(tenantId, 'rag');

    const journeyPhases = currentPhase ? [currentPhase] : [];

    // Concurrency gate per tenant (only if not already idempotent replay, no shed before acquire)
    slot = await concurrencyManager.acquire(tenantId);
    ops.concurrency = { queued: slot.queued, running: slot.running, max: slot.max, shed: slot.shed };
    acquiredSlot = Boolean(slot && typeof slot.release === 'function');
    if (slot.shed) {
      addUnique(ops.fallbacks, 'load_shed');
      const shedResponse = {
        traceId: getTraceId(req, payload),
        intent: req?.intent || payload?.intent || 'unknown',
        runId: req?.runId || payload?.runId || 'unknown',
        agents: [],
        agentsMeta: { enabled: [], disabled: [] },
        decision: { overallStatus: 'WARN', topFindings: [], recommendedActions: [], actionPlan: { steps: [] }, rationale: 'load_shed' },
        executionPlan: { tools: [] },
        executionGate: null,
        executionResult: null,
        productionGuards: { realExecutionAllowed: false, reasons: ['load_shed'] },
        ops,
        systemStatus: {
          llm: ops.llm.mode,
          rag: ops.rag.mode,
          execution: 'dry-run',
          agentsActiveCount: 0,
          audit: auditTrailStore.summary(),
          idempotent: false,
          agents: {},
          tenant: { id: tenantId, mode: 'isolated', caches: ['llm', 'idempotency', 'metrics', 'audit', 'memory'] },
          web3: lastWeb3Guard,
          killSwitch: { active: false, scope: 'REAL_ONLY', triggeredBy: null, reasons: [] },
          slo: metricsStore.summary(),
          alerts: alertingEngine.recentAlerts(5),
        },
        metrics: { agentsCount: 0, durationMs: Date.now() - startedAll, ragUsed: false, realExecutionAttempted: false },
        presetMeta: preset
          ? {
            name: preset.name,
            description: preset.description,
            expectedDuration: preset.expectedDuration || 'n/a',
            sampleInput: preset.sampleInput,
            sampleOutput: preset.sampleOutput,
          }
          : null,
      };
      if (acquiredSlot) {
        try {
          slot.release();
        } catch (e) {
          // ignore
        }
      }
      return shedResponse;
    }

    const explicitPhaseForIntents = payload?.constraints?.phase || payload?.context?.journey?.phaseId || null;
    const phasesForIntents = explicitPhaseForIntents
      ? (contextPhases.length > 0 ? contextPhases : [explicitPhaseForIntents])
      : (contextPhases.length > 0 ? contextPhases : []);
    const workflowIntents = phasesForIntents.flatMap((phaseId) =>
      resolveWorkflowIntents({ ...req.context?.journey, phaseId })
    );

    const intentsCombined = [req.intent, ...workflowIntents].filter(Boolean);
    const intentsDeduped = dedupeAndOrderIntents(intentsCombined);
    const routed = routeIntent({
      intent: intentsDeduped,
      input: req.input,
      context: req.context,
    });

    const buildIdempotencyKey = () => {
      const baseKey = req.traceId || req.runId || 'unknown';
      const safePayload = { ...payload };
      delete safePayload.headers;
      const explicitPhase = payload?.constraints?.phase || payload?.context?.journey?.phaseId || null;
      const phaseKey = explicitPhase ? `|phase:${explicitPhase}` : '';
      const hashPayload = idempotencyStore.stableHash({
        intentNormalized: routed.intentNormalized,
        payload: safePayload,
        tenantId,
        phase: explicitPhase,
      });
      return crypto
        .createHash('sha256')
        .update(`${tenantId}|${baseKey}|${routed.intentNormalized}${phaseKey}|${hashPayload}`)
        .digest('hex');
    };

    const idempotencyKey = buildIdempotencyKey();
    const cached = idempotencyStore.get(idempotencyKey, tenantId);
    if (cached) {
      const gateIdCached = cached.executionGate?.gateId;
      const gateState = gateIdCached ? executionGate.get(gateIdCached) : null;
      const gatePending = gateState?.status === 'PENDING';
      // Si gate a évolué (APPROVED/REJECTED/EXPIRED), on relance l'orchestration.
      if (gateIdCached && gateState && !gatePending && gateState.status !== cached.executionGate?.status) {
        // continue to re-execute
      } else {
        idempotentReplays += 1;
        const replay = JSON.parse(JSON.stringify(cached));
        const fallbacks = new Set([...(replay.ops?.fallbacks || []), 'idempotent_replay']);
        replay.ops = {
          ...replay.ops,
          fallbacks: Array.from(fallbacks),
        };
        replay.systemStatus = {
          ...(replay.systemStatus || {}),
          idempotent: true,
          web3: replay.systemStatus?.web3 || {
            level: lastWeb3Guard.level,
            allowed: lastWeb3Guard.allowed,
            reasons: lastWeb3Guard.reasons,
            diagnostics: lastWeb3Guard.diagnostics,
          },
          journey: replay.systemStatus?.journey || {
            name: journeyName,
            phase: currentPhase,
            phaseIndex,
            phases: phaseSequence,
            artifactsSummary: artifactStore.getArtifacts({ tenantId, runId: runKey, journey: journeyName }),
          },
        };
        return replay;
      }
    }

    if (phaseSnapshot && currentPhase) {
      const replay = JSON.parse(JSON.stringify(phaseSnapshot));
      replay.ops = replay.ops || {};
      replay.ops.fallbacks = Array.from(new Set([...(replay.ops.fallbacks || []), 'idempotent_phase_replay']));
      replay.systemStatus = replay.systemStatus || {};
      replay.systemStatus.journey = {
        name: journeyName,
        phase: currentPhase,
        phaseIndex,
        phases: phaseSequence,
        artifactsSummary: artifactStore.getArtifacts({ tenantId, runId: runKey, journey: journeyName }),
      };
      return replay;
    }
    const budget = envBudget();
    let selected = (routed.selectedAgents || [])
      .filter((sel) => isAgentEnabled(sel.agentId))
      .slice(0, budget.maxAgents || (routed.selectedAgents || []).length);
    const tenantMetrics = metricsStore.summary(tenantId);
    let quotaDecision = tenantQuotaRegistry.evaluateQuota(tenantId, {
      runsInWindow: tenantMetrics.window,
      llmCallsPerRun: 0,
      costWindowUsd: tenantMetrics.llm?.costTotal || 0,
      agentsPerRun: selected.length,
    });
    if (quotaDecision.status === 'WARN') addUnique(ops.fallbacks, 'quota_warn');
    if (selected.length > (quotaDecision.quota.maxAgentsPerRun || selected.length)) {
      addUnique(ops.fallbacks, 'load_shed');
      selected = selected.slice(0, quotaDecision.quota.maxAgentsPerRun);
    }
    const previous = memoryStore.get(req.runId, tenantId);
    const memoryEntries = memoryStore.values(tenantId);
    const learningMap = computeLearningScores(selected, registryIndex, memoryEntries);
    const defaultModel = registryIndex[selected[0]?.agentId]?.llmProfile?.model || 'gpt-4o';
    ops.llm.model = defaultModel;
    let cacheHits = 0;

    let ragContext = null;
    let ragDomains = '';
    try {
      const needsRag = selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false);
      if (demoMode) {
        ops.rag.mode = 'local';
        ragContext = { source: 'demo_local', chunks: [] };
      } else if (needsRag && allowRag) {
        ragDomains = selected
          .map((a) => registryIndex[a.agentId]?.domain)
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(' ');
        ragContext = await ragClient.search({
          query: req.input || routed.intentNormalized || req.intent,
          topK: req.context?.rag?.topK || 4,
          traceId: getTraceId(req, payload),
          domain: ragDomains,
        });
      } else {
        ops.rag.mode = 'disabled';
        if (!allowRag) addUnique(ops.fallbacks, 'circuit_breaker_rag');
      }
    } catch (error) {
      const safeTraceId = req?.traceId || payload?.traceId || 'unknown';
      logger.warn('RAG failed, continuing without context', { traceId: safeTraceId, error: error.message });
      ragContext = null;
      addUnique(ops.fallbacks, 'rag_disabled');
    }

    const runs = await Promise.all(
      selected.map(async (sel) => {
        const meta = registryIndex[sel.agentId] || {};
        const agentInstance = agentsPool[sel.agentId];
        const started = Date.now();
        const timeoutMs = Math.min(
          req.constraints?.timeoutMs ?? meta.timeouts?.agentMs ?? meta.timeoutMs ?? 6000,
          budget.timeoutMs
        );

        if (!agentInstance) {
          addUnique(ops.fallbacks, 'agent_stub');
          return {
            agentId: sel.agentId,
            status: 'FAIL',
            summary: 'Agent not registered',
            actions: [],
            citations: [],
            metrics: { latencyMs: 0 },
            errors: ['agent_not_registered'],
            traceId: getTraceId(req, payload),
          };
        }

        try {
          const executeOnce = () =>
            timeoutGuard(
              agentInstance.run({
                traceId: getTraceId(req, payload),
                runId: req?.runId || payload?.runId || 'unknown',
                input: req.input,
                ragContext: meta.requiresRag === false ? null : ragContext,
                constraints: req.constraints,
                intentNormalized: routed.intentNormalized,
                journey: req.context?.journey || null,
                phaseContext: {
                  journey: journeyName,
                  phase: currentPhase,
                  phaseIndex,
                  artifacts: artifactsSoFar,
                  constraints: req.constraints,
                },
                tenantId,
              }),
              timeoutMs,
              sel.agentId,
              req.traceId
            );

          let res;
          let retried = false;
          try {
            res = await executeOnce();
          } catch (err) {
            const transient = (err && /timeout|ECONNRESET|ETIMEDOUT/i.test(err.message)) || err === 'agent_timeout';
            if (!retried && transient && !ops.retries.attempted) {
              retried = true;
              ops.retries = { attempted: true, count: 1, reason: 'transient_agent_timeout' };
              res = await executeOnce();
            } else {
              throw err;
            }
          }

          const { response: sanitized, warnings: agentWarnings } = sanitizeAgentResponse({
            ...res,
            agentId: sel.agentId,
            traceId: getTraceId(req, payload),
          });
          ops.warnings.push(...agentWarnings);

          const effectiveWeight = learningMap[sel.agentId]?.learningScore;
          const resWithScores = {
            ...sanitized,
            metrics: {
              ...(sanitized.metrics || {}),
              latencyMs: sanitized.metrics?.latencyMs ?? Date.now() - started,
            },
            scores: computeScores(sanitized, meta, effectiveWeight),
          };
          circuitBreaker.recordSuccess(tenantId, 'execution');
          return resWithScores;
        } catch (error) {
          logger.error('Agent execution failed', { traceId: getTraceId(req, payload), agentId: sel.agentId, error: error.message });
          circuitBreaker.recordFailure(tenantId, 'execution', 'agent_failure');
          return {
            agentId: sel.agentId,
            traceId: getTraceId(req, payload),
            status: 'FAIL',
            summary: 'Agent execution failed',
            actions: [],
            citations: [],
            metrics: { latencyMs: Date.now() - started },
            errors: [error.message],
            scores: computeScores({ status: 'FAIL', actions: [], errors: [error.message] }, meta, learningMap[sel.agentId]?.learningScore),
          };
        }
      })
    );

    let runsWithScores = runs.map((r) => {
      if (r.scores) return r;
      const meta = registryIndex[r.agentId] || {};
      return { ...r, scores: computeScores(r, meta) };
    });

    runsWithScores = applyRagPolicy(runsWithScores);
    runsWithScores = applyRagPolicy(runsWithScores);

    ops.llm.calls = runsWithScores.length;
    ops.llm.cacheHits = 0;
    ops.llm.deduplicatedCalls = 0;

    const summary = runsWithScores
      .map((r) => r.summary || r.details || r.status || r.agentId)
      .filter(Boolean)
      .join(' | ');

    const actions = runsWithScores.flatMap((r) => (Array.isArray(r.actions) ? r.actions : []));
    const contradictions = detectContradictions(runsWithScores);

    // Detect Web3 actions from agent actions or payload (after actions are collected)
    const web3Actions = [];
    actions.forEach((action) => {
      const actionStr = typeof action === 'string' ? action.toLowerCase() : String(action).toLowerCase();
      if (actionStr.includes('web3:proof') || (actionStr.includes('proof') && actionStr.includes('web3'))) {
        web3Actions.push('proof');
      } else if (actionStr.includes('web3:anchor') || (actionStr.includes('anchor') && actionStr.includes('web3'))) {
        web3Actions.push('anchor');
      } else if (actionStr.includes('web3:mint') || (actionStr.includes('mint') && actionStr.includes('web3'))) {
        web3Actions.push('mint');
      }
    });
    if (payload.web3?.action) {
      const payloadAction = String(payload.web3.action).toLowerCase();
      if (['proof', 'anchor', 'mint'].includes(payloadAction)) {
        web3Actions.push(payloadAction);
      }
    }

    const severity = { FAIL: 3, TIMEOUT: 2, WARN: 1, OK: 0 };
    const hasOk = runsWithScores.some((r) => r.status === 'OK');
    const hasFailOrTimeout = runsWithScores.some((r) => r.status === 'FAIL' || r.status === 'TIMEOUT');
    let overallStatus = 'WARN';
    if (hasOk && !hasFailOrTimeout) {
      overallStatus = 'OK';
    } else {
      overallStatus =
        runsWithScores.reduce((worst, r) => (severity[r.status] > severity[worst] ? r.status : worst), 'OK') || 'OK';
    }

    const topFindings = runsWithScores
      .slice()
      .sort((a, b) => (b.scores?.weighted || 0) - (a.scores?.weighted || 0))
      .slice(0, 5)
      .map((r) => ({
        agentId: r.agentId,
        summary: r.summary || r.status,
        score: r.scores?.weighted || 0,
      }));

    const recommendedActions = runsWithScores
      .slice()
      .sort((a, b) => (b.scores?.weighted || 0) - (a.scores?.weighted || 0))
      .flatMap((r) =>
        (Array.isArray(r.actions) ? r.actions : []).map((action) => ({
          agentId: r.agentId,
          action,
          score: r.scores?.weighted || 0,
        }))
      )
      .slice(0, 10);

    const agentsMeta = {
      enabled: registry.filter((a) => isAgentEnabled(a.agentId)).map((a) => a.agentId),
      disabled: registry.filter((a) => !isAgentEnabled(a.agentId)).map((a) => a.agentId),
    };
    ops.disabledAgents = agentsMeta.disabled;

    if (runsWithScores.some((r) => r.status === 'WARN')) addUnique(ops.warnings, 'agent_warn');
    if (routed.intentNormalized === 'unknown_intent' || !req.intent) addUnique(ops.warnings, 'intent_fallback');
    if (intentsDeduped.length !== intentsCombined.length) addUnique(ops.warnings, 'intent_deduped');

    runsWithScores
      .filter((r) => r.status === 'TIMEOUT')
      .forEach((r) => {
        ops.timeouts.push({ agentId: r.agentId, reason: (r.errors || [])[0] || 'timeout' });
      });

    runsWithScores
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        ops.failures.push({ agentId: r.agentId, reason: (r.errors || [])[0] || 'fail' });
      });

    if (!ragContext && selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false)) {
      addUnique(ops.fallbacks, 'rag_disabled');
    }
    if (!process.env.OPENAI_API_KEY) addUnique(ops.fallbacks, 'llm_mock');

    ops.rag = {
      mode: ragContext ? (String(ragContext.source || '').includes('remote') ? 'remote' : 'local') : 'disabled',
      domain: ragDomains || null,
      hits: Array.isArray(ragContext?.chunks) ? ragContext.chunks.length : 0,
    };

    const summaryMode = process.env.EXECUTION_ENABLED === 'true' ? 'REAL' : 'DRY_RUN';
    ops.execution.mode = summaryMode;

    const confidenceFromScores = () => {
      const confs = runsWithScores.map((r) => (typeof r.confidence === 'number' ? r.confidence : null)).filter((v) => v !== null);
      const scoreAvg =
        runsWithScores.reduce((acc, r) => acc + (r.scores?.weighted || 0), 0) / (runsWithScores.length || 1 || 1);
      const base = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0.55;
      return Math.max(0, Math.min(0.95, base + Math.min(scoreAvg, 1) * 0.1));
    };

    const aggregatedDecision = {
      overallStatus,
      topFindings,
      recommendedActions,
      rationale: `Selected actions from highest weighted agents. Contradictions detected: ${contradictions.length}.`,
      confidence: confidenceFromScores(),
    };

    const agentsStatus = registry.reduce((acc, meta) => {
      const enabled = isAgentEnabled(meta.agentId);
      const envKey = `AGENT_${meta.agentId.toUpperCase()}_ENABLED`;
      const reason =
        enabled === false
          ? process.env[envKey] === 'false'
            ? 'disabled_env_override'
            : meta.enabled === false
              ? 'registry_disabled'
              : 'disabled'
          : undefined;
      acc[meta.agentId] = { enabled, mode: enabled ? 'REAL_CAPABLE' : 'DISABLED', reason };
      return acc;
    }, {});

    aggregated = {
      traceId: getTraceId(req, payload),
      intent: routed.intentNormalized,
      intentMeta: {
        deduplicated: intentsDeduped.length !== intentsCombined.length,
        source: ['input', workflowIntents.length ? 'workflowMap' : null].filter(Boolean),
      },
      runId: req.runId,
      agents: runsWithScores,
      summary,
      actions,
      contradictions,
      decision: aggregatedDecision,
      memory: {
        reused: Boolean(previous),
        previousActionsCount: previous?.recommendedActions?.length || previous?.decision?.recommendedActions?.length || 0,
      },
      learning: {
        enabled: true,
        agents: Object.values(learningMap),
      },
      budgets: Object.fromEntries(
        selected.map((sel) => {
          const meta = registryIndex[sel.agentId] || {};
          const effectiveMaxTokens = Math.min(
            req.constraints?.maxTokens || meta.maxTokens || budget.maxTokens,
            meta.maxTokens || budget.maxTokens,
            budget.maxTokens
          );
          const effectiveTimeout = Math.min(
            req.constraints?.timeoutMs || meta.timeoutMs || budget.timeoutMs,
            meta.timeoutMs || budget.timeoutMs,
            budget.timeoutMs
          );
          return [sel.agentId, { maxTokens: effectiveMaxTokens, timeoutMs: effectiveTimeout }];
        })
      ),
      agentsMeta,
      journeyProgress: {
        phasesExecuted: phasesExecuted,
        currentPhase: currentPhase || null,
      },
      executionPlan: null,
      executionGate: null,
      executionResult: null,
      systemStatus: {
        llm: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
        rag: ragContext ? ragContext.source || 'unknown' : 'disabled',
        execution: process.env.EXECUTION_ENABLED === 'true' ? 'real-enabled' : 'dry-run',
        agentsActiveCount: agentsMeta.enabled.length,
        agents: agentsStatus,
      },
      metrics: {
        agentsCount: runsWithScores.length,
        durationMs: Date.now() - startedAll,
        ragUsed: Boolean(ragContext),
        realExecutionAttempted: process.env.EXECUTION_ENABLED === 'true',
      },
      presetMeta: preset
        ? {
          name: preset.name,
          description: preset.description,
          expectedDuration: preset.expectedDuration || 'n/a',
          sampleInput: preset.sampleInput,
          sampleOutput: preset.sampleOutput,
        }
        : null,
    };

    // Action plan consolidation (current + previous)
    const currentActionEntries = recommendedActions.map((r) => ({
      action: r.action,
      agentId: r.agentId,
      score: r.score,
      conflict: contradictions.some((c) => c.agents.includes(r.agentId)),
    }));

    const previousActionEntries = (previous?.decision?.recommendedActions || []).map((r) => ({
      action: r.action,
      agentId: r.agentId,
      score: r.score || 0,
      conflict: contradictions.some((c) => c.agents.includes(r.agentId)),
      fromMemory: true,
    }));

    const mergedActions = [...currentActionEntries, ...previousActionEntries];
    const dedup = new Map(); // key by action string lowercase
    for (const item of mergedActions) {
      const key = String(item.action || '').toLowerCase().trim();
      if (!key) continue;
      if (!dedup.has(key) || (dedup.get(key)?.score || 0) < (item.score || 0)) {
        dedup.set(key, item);
      }
    }

    const stepsOrdered = Array.from(dedup.values()).sort((a, b) => {
      if (a.conflict !== b.conflict) return a.conflict ? 1 : -1; // non-conflict first
      return (b.score || 0) - (a.score || 0);
    });

    const actionPlanSteps = stepsOrdered.map((s, idx) => ({
      action: s.action,
      sourceAgent: s.agentId,
      score: s.score,
      priority: idx + 1,
      conflict: Boolean(s.conflict),
      fromMemory: Boolean(s.fromMemory),
    }));

    aggregated.decision.actionPlan = {
      steps: actionPlanSteps,
      strategy: contradictions.length > 0 ? 'resolve-contradictions-first' : 'highest-confidence-first',
    };

    const flattenedFindings = runsWithScores
      .flatMap((r) => Array.isArray(r.findings) ? r.findings.map((f) => ({ ...f, agentId: r.agentId })) : [])
      .filter((f) => f && (f.item || f.detail));
    const keyFindings = (flattenedFindings.length
      ? flattenedFindings.map((f) => f.detail || f.item).filter(Boolean)
      : topFindings.map((f) => f.summary)
    ).slice(0, 5);
    const topRisks = flattenedFindings
      .filter((f) => f.severity)
      .slice(0, 3)
      .map((f) => ({ risk: f.item || f.detail || 'risk', severity: f.severity }));
    const recommendedNextSteps = actionPlanSteps.slice(0, 5).map((s) => s.action);
    const executiveSummary = {
      headline: overallStatus === 'OK' ? 'Key improvements identified' : 'Risks identified, action required',
      keyFindings,
      topRisks,
      recommendedNextSteps,
      confidence: aggregatedDecision.confidence,
    };

    const humanPlan = {
      objective: 'Execute the prioritized improvements',
      steps: actionPlanSteps.slice(0, 10).map((s, idx) => ({
        step: idx + 1,
        action: s.action,
        owner: s.sourceAgent || 'unassigned',
        priority: idx < 3 ? 'HIGH' : idx < 6 ? 'MEDIUM' : 'LOW',
      })),
      warnings: contradictions.length ? ['Conflicting agent recommendations present'] : [],
    };

    aggregated.executiveSummary = executiveSummary;
    aggregated.humanPlan = humanPlan;

    // Execution plan (declarative, no side effects) with tool mapping
    const executionTools = actionPlanSteps.map((step, index) => {
      const mapped = actionToolMapper.mapActionToTool(step.action);
      const tool = mapped.tool;
      if (!tool || mapped.toolId === 'noop') {
        if (mapped.reason === 'unknown_action' && step.action && step.action.trim()) {
          addUnique(ops.warnings, 'unknown_action_tool');
        }
        return {
          toolId: 'noop',
          action: step.action,
          sourceAgent: step.sourceAgent,
          priority: step.priority,
          unexecutable: true,
          requiresConfirmation: false,
          requiresGate: false,
          risk: 'LOW',
          web3: false,
          mappingConfidence: mapped.confidence,
          mappingReason: mapped.reason,
        };
      }
      return {
        toolId: tool.toolId || tool.id,
        action: step.action,
        sourceAgent: step.sourceAgent,
        priority: step.priority,
        requiresConfirmation: tool.requiresConfirmation || tool.sideEffects === 'external' || tool.sideEffects === 'irreversible',
        requiresGate: tool.requiresGate || false,
        sideEffects: tool.sideEffects || 'none',
        risk: tool.risk || 'LOW',
        web3: tool.web3 || false,
        mappingConfidence: mapped.confidence,
        mappingReason: mapped.reason,
      };
    });

    let executionGateInfo = null;
    let gateId = previous?.executionGateId || null;
    const needsGate = executionTools.some((t) => t.requiresConfirmation);
    const existingGate = gateId ? executionGate.get(gateId) : null;

    if (existingGate && (existingGate.status === 'APPROVED' || existingGate.status === 'PENDING' || existingGate.status === 'REJECTED')) {
      executionGateInfo = {
        gateId,
        status: existingGate.status,
        requiresHuman: true,
      };
    } else if (needsGate) {
      gateId = executionGate.submit({ traceId: getTraceId(req, payload), runId: req?.runId || payload?.runId || 'unknown', executionPlan: executionTools });
      executionGateInfo = { gateId, status: 'PENDING', requiresHuman: true };
    }

    const shadowMode = process.env.REAL_EXECUTION_MODE === 'shadow';
    ops.execution.shadow = shadowMode;

    // Pre-simulate execution plan steps (after gate info) - will be updated after execution if needed
    const gateApprovedForSim = executionGateInfo?.status === 'APPROVED';
    const preSimulation = executionEngine.simulate({
      executionPlan: executionTools,
      traceId: getTraceId(req, payload),
      runId: req?.runId || payload?.runId || getTraceId(req, payload),
      tenantId,
      gateApproved: gateApprovedForSim,
    });

    aggregated.executionPlan = {
      mode: shadowMode ? 'SHADOW' : 'DRY_RUN',
      steps: preSimulation.steps,
      summary: preSimulation.summary,
      overallStatus: preSimulation.overallStatus,
    };

    const guardDecision = productionGuards.evaluateProductionGuards({
      executionEnabled: process.env.EXECUTION_ENABLED === 'true',
      gateApproved: executionGateInfo?.status === 'APPROVED',
      contradictions,
      runs: runsWithScores,
      intents: intentsDeduped,
      agentsMeta,
    });

    if (secretsDecision.status === 'BLOCK') {
      guardDecision.realExecutionAllowed = false;
      ops.execution.blocked = true;
      ops.execution.mode = 'DRY_RUN';
      addUnique(ops.execution.blockReasons, 'secrets_block');
      addUnique(ops.fallbacks, 'secrets_block');
    } else if (secretsDecision.status === 'WARN') {
      addUnique(ops.fallbacks, 'secrets_warn');
    }

    if (quotaDecision.status === 'WARN') {
      addUnique(ops.execution.blockReasons, 'quota_warn');
    }
    if (quotaDecision.status === 'BLOCK') {
      guardDecision.realExecutionAllowed = false;
      ops.execution.blocked = true;
      addUnique(ops.execution.blockReasons, 'quota_exceeded');
      addUnique(ops.fallbacks, 'load_shed');
    }

    const web3Guard = web3Guards.evaluate({
      request: req,
      payload,
      executionPlan: aggregated?.executionPlan,
    });
    lastWeb3Guard = web3Guard;

    ops.execution.blockReasons = guardDecision.reasons || [];
    if (web3Guard.reasons.length) {
      web3Guard.reasons.forEach((r) => addUnique(ops.execution.blockReasons, r));
    }

    if (web3Guard.level !== 'OK') {
      if (web3Guard.level === 'BLOCK') {
        guardDecision.realExecutionAllowed = false;
        ops.execution.blocked = true;
        ops.execution.mode = 'DRY_RUN';
      } else {
        guardDecision.realExecutionAllowed = false;
      }
      web3Guard.reasons.forEach((r) => addUnique(ops.warnings, r));
    }

    ops.execution.blocked = ops.execution.blockReasons.length > 0 || ops.execution.blocked;
    ops.execution.mode = guardDecision.realExecutionAllowed ? 'REAL' : 'DRY_RUN';

    const kill = killSwitch.evaluate({
      ops,
      runs: runsWithScores,
      contradictions,
      idempotentReplays,
      auditSummary: auditTrailStore.summary(),
      web3: lastWeb3Guard,
    });

    if (kill.active) {
      ops.execution.blocked = true;
      addUnique(ops.execution.blockReasons, 'kill_switch');
      addUnique(ops.fallbacks, 'kill_switch');
      if (kill.scope === 'ALL') {
        guardDecision.realExecutionAllowed = false;
        ops.execution.mode = 'DRY_RUN';
      } else if (kill.scope === 'REAL_ONLY') {
        guardDecision.realExecutionAllowed = false;
        if (ops.execution.mode === 'REAL') ops.execution.mode = 'DRY_RUN';
      }
    }

    // Apply Web3 pipeline actions (after guards and kill switch, before execution)
    const pipelineContext = { tenantId, runId: req.runId || req.traceId || 'unknown' };
    let web3PipelineState = web3Pipeline.getState(pipelineContext);
    let web3PipelineResult = null;
    // Re-check payload.web3.action here in case it wasn't detected earlier
    const directWeb3Action = payload?.web3?.action ? String(payload.web3.action).toLowerCase() : null;
    const actionToApply = web3Actions && web3Actions.length > 0 ? web3Actions[0] : (directWeb3Action && ['proof', 'anchor', 'mint'].includes(directWeb3Action) ? directWeb3Action : null);
    if (actionToApply && web3Guard && web3Guard.level !== 'BLOCK') {
      web3PipelineResult = web3Pipeline.applyAction(actionToApply, pipelineContext);
      if (web3PipelineResult && web3PipelineResult.idempotent) {
        addUnique(ops.fallbacks, 'idempotent_web3_replay');
      }
      if (web3PipelineResult && !web3PipelineResult.success) {
        addUnique(ops.warnings, web3PipelineResult.reason || 'web3_pipeline_warn');
        if (web3PipelineResult.level === 'WARN') {
          addUnique(ops.execution.blockReasons, 'web3_pipeline_invalid_transition');
        }
      } else if (web3PipelineResult && web3PipelineResult.success) {
        web3PipelineState = web3Pipeline.getState(pipelineContext);
      }
    }

    let executionResult = null;
    if (executionGateInfo?.gateId) {
      const state = executionGate.get(executionGateInfo.gateId);
      if (state?.status === 'APPROVED' && guardDecision.realExecutionAllowed) {
        try {
          if (process.env.EXECUTION_ENABLED === 'true' && !shadowMode) {
            logger.info('Real execution enabled, attempting guarded execution', { traceId: getTraceId(req, payload), gateId: executionGateInfo.gateId });
            executionResult = executionEngine.execute({
              executionPlan: executionTools,
              traceId: getTraceId(req, payload),
              runId: req.runId || req.traceId || 'unknown',
              tenantId,
              gateApproved: true,
            });
            executionGateInfo.status = 'APPROVED';
            ops.execution.attempted = true;
            ops.execution.mode = 'REAL';
          } else if (process.env.EXECUTION_ENABLED === 'true' && shadowMode) {
            const dryRun = executionEngine.simulate({
              executionPlan: executionTools,
              traceId: getTraceId(req, payload),
              runId: req.runId || req.traceId || 'unknown',
              tenantId,
              gateApproved: true,
            });
            const realSimulated = executionEngine.simulate({
              executionPlan: executionTools,
              traceId: getTraceId(req, payload),
              runId: req.runId || req.traceId || 'unknown',
              tenantId,
              gateApproved: true,
            });
            // Enriched shadow delta with step-by-step comparison
            const stepsChanged = [];
            const riskEscalation = [];
            const blockedByGate = [];
            dryRun.steps.forEach((dryStep, idx) => {
              const realStep = realSimulated.steps[idx];
              if (!realStep) return;
              if (dryStep.status !== realStep.status) {
                stepsChanged.push(idx + 1);
              }
              if (realStep.status === 'BLOCKED_BY_GATE') {
                blockedByGate.push(realStep.toolId || 'unknown');
              }
              const dryRisk = executionTools.find((t) => t.toolId === dryStep.toolId)?.risk || 'LOW';
              const realRisk = executionTools.find((t) => t.toolId === realStep.toolId)?.risk || 'LOW';
              const riskLevels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
              if (riskLevels[realRisk] > riskLevels[dryRisk]) {
                riskEscalation.push(realStep.toolId || 'unknown');
              }
            });
            executionResult = {
              shadow: true,
              dryRun,
              realSimulated,
              delta: {
                stepsChanged: stepsChanged.length > 0 ? stepsChanged : null,
                riskEscalation: riskEscalation.length > 0 ? riskEscalation : null,
                blockedByGate: blockedByGate.length > 0 ? blockedByGate : null,
                summary: stepsChanged.length > 0 || riskEscalation.length > 0 || blockedByGate.length > 0 ? 'Differences detected between DRY_RUN and REAL simulated' : 'No differences',
              },
            };
            executionGateInfo.status = 'APPROVED';
            ops.execution.attempted = true;
            ops.execution.mode = 'DRY_RUN';
            ops.execution.shadowComparison = executionResult;
            addUnique(ops.fallbacks, 'shadow_mode');
          } else {
            executionResult = executionEngine.simulate({
              executionPlan: executionTools,
              traceId: getTraceId(req, payload),
              runId: req.runId || req.traceId || 'unknown',
              tenantId,
              gateApproved: true,
            });
            executionGateInfo.status = 'APPROVED';
            ops.execution.attempted = true;
            ops.execution.mode = 'DRY_RUN';
            addUnique(ops.fallbacks, 'real_disabled_flag');
          }
        } catch (err) {
          logger.warn('Execution (real) blocked or failed, falling back to dry-run', {
            traceId: getTraceId(req, payload),
            gateId: executionGateInfo.gateId,
            error: err.message,
          });
          executionResult = executionEngine.simulate({
            executionPlan: executionTools,
            traceId: getTraceId(req, payload),
            runId: req.runId || req.traceId || 'unknown',
            tenantId,
            gateApproved: state?.status === 'APPROVED',
          });
          executionGateInfo.status = state?.status || executionGateInfo.status;
          ops.execution.attempted = true;
          ops.execution.mode = 'DRY_RUN';
          addUnique(ops.fallbacks, 'execution_fallback');
        }
      } else if (state?.status === 'APPROVED' && !guardDecision.realExecutionAllowed) {
        executionResult = executionEngine.simulate({
          executionPlan: executionTools,
          traceId: getTraceId(req, payload),
          runId: req.runId || req.traceId || 'unknown',
          tenantId,
          gateApproved: true,
        });
        ops.execution.attempted = true;
        ops.execution.mode = 'DRY_RUN';
        ops.execution.blocked = true;
      }
    } else if (executionTools.length > 0) {
      // No gate needed, still simulate for preview
      const baseSimulation = executionEngine.simulate({
        executionPlan: executionTools,
        traceId: getTraceId(req, payload),
        runId: req.runId || req.traceId || 'unknown',
        tenantId,
        gateApproved: false,
      });
      if (guardDecision.realExecutionAllowed && process.env.EXECUTION_ENABLED === 'true' && shadowMode) {
        const realSimulated = executionEngine.simulate({
          executionPlan: executionTools,
          traceId: getTraceId(req, payload),
          runId: req.runId || req.traceId || 'unknown',
          tenantId,
          gateApproved: true,
        });
        // Enriched shadow delta
        const stepsChanged = [];
        const riskEscalation = [];
        const blockedByGate = [];
        baseSimulation.steps.forEach((dryStep, idx) => {
          const realStep = realSimulated.steps[idx];
          if (!realStep) return;
          if (dryStep.status !== realStep.status) {
            stepsChanged.push(idx + 1);
          }
          if (realStep.status === 'BLOCKED_BY_GATE') {
            blockedByGate.push(realStep.toolId || 'unknown');
          }
          const dryRisk = executionTools.find((t) => t.toolId === dryStep.toolId)?.risk || 'LOW';
          const realRisk = executionTools.find((t) => t.toolId === realStep.toolId)?.risk || 'LOW';
          const riskLevels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          if (riskLevels[realRisk] > riskLevels[dryRisk]) {
            riskEscalation.push(realStep.toolId || 'unknown');
          }
        });
        executionResult = {
          shadow: true,
          dryRun: baseSimulation,
          realSimulated,
          delta: {
            stepsChanged: stepsChanged.length > 0 ? stepsChanged : null,
            riskEscalation: riskEscalation.length > 0 ? riskEscalation : null,
            blockedByGate: blockedByGate.length > 0 ? blockedByGate : null,
            summary: stepsChanged.length > 0 || riskEscalation.length > 0 || blockedByGate.length > 0 ? 'Differences detected between DRY_RUN and REAL simulated' : 'No differences',
          },
        };
        ops.execution.shadowComparison = executionResult;
        addUnique(ops.fallbacks, 'shadow_mode');
      } else {
        executionResult = baseSimulation;
      }
      ops.execution.attempted = true;
      ops.execution.mode = guardDecision.realExecutionAllowed ? ops.execution.mode : 'DRY_RUN';
      if (!guardDecision.realExecutionAllowed) ops.execution.blocked = true;
    }

    aggregated.executionResult = executionResult;

    // Update executionPlan with final simulation result if available
    if (executionResult && executionResult.steps) {
      aggregated.executionPlan = {
        mode: executionResult.mode || (shadowMode ? 'SHADOW' : 'DRY_RUN'),
        steps: executionResult.steps,
        summary: executionResult.summary || preSimulation.summary,
        overallStatus: executionResult.overallStatus || preSimulation.overallStatus,
      };
    } else if (executionResult && executionResult.dryRun) {
      // Shadow mode: use dryRun as base
      aggregated.executionPlan = {
        mode: 'SHADOW',
        steps: executionResult.dryRun.steps,
        summary: executionResult.dryRun.summary,
        overallStatus: executionResult.dryRun.overallStatus,
      };
    }

    // Add execution metrics to ops
    if (aggregated.executionPlan && aggregated.executionPlan.steps && aggregated.executionPlan.steps.length > 0) {
      ops.execution.steps = {
        count: aggregated.executionPlan.steps.length,
        blocked: aggregated.executionPlan.steps.filter((s) => s.status === 'BLOCKED_BY_GATE').length,
        ok: aggregated.executionPlan.steps.filter((s) => s.status === 'SIMULATED_OK').length,
        failed: aggregated.executionPlan.steps.filter((s) => s.status === 'SIMULATED_FAIL').length,
        skipped: aggregated.executionPlan.steps.filter((s) => s.status === 'SKIPPED').length,
      };
      const toolsUsed = Array.from(new Set(aggregated.executionPlan.steps.map((s) => s.toolId).filter(Boolean)));
      ops.execution.tools = {
        used: toolsUsed.length,
        list: toolsUsed,
      };
    } else {
      // Initialize empty metrics if no execution plan
      ops.execution.steps = {
        count: 0,
        blocked: 0,
        ok: 0,
        failed: 0,
        skipped: 0,
      };
      ops.execution.tools = {
        used: 0,
        list: [],
      };
    }

    aggregated.executionGate = executionGateInfo;
    aggregated.productionGuards = guardDecision;
    aggregated.ops = ops;

    const artifactsAggregated = artifactStore.getArtifacts({ tenantId, runId: runKey, journey: journeyName });
    const artifactsSummary = Object.fromEntries(
      Object.entries(artifactsAggregated).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
    );

    aggregated.systemStatus = {
      llm: ops.llm.mode,
      rag: ops.rag.mode,
      execution: ops.execution.mode.toLowerCase() === 'real' ? 'real-enabled' : 'dry-run',
      agentsActiveCount: agentsMeta.enabled.length,
      audit: auditTrailStore.summary(),
      idempotent: false,
      agents: agentsStatus,
      tenant: {
        id: tenantId,
        mode: 'isolated',
        caches: ['llm', 'idempotency', 'metrics', 'audit', 'memory'],
      },
      circuitBreakers: circuitBreaker.summary(tenantId)[tenantId],
      runtime: { coldStart },
      secrets: secretsDecision,
      web3: {
        level: lastWeb3Guard.level,
        allowed: lastWeb3Guard.allowed,
        reasons: lastWeb3Guard.reasons,
        diagnostics: lastWeb3Guard.diagnostics,
      },
      web3Pipeline: web3PipelineState
        ? {
          state: web3PipelineState.state,
          proof: web3PipelineState.proof,
          anchor: web3PipelineState.anchor,
          mint: web3PipelineState.mint,
          history: web3PipelineState.history,
        }
        : {
          state: 'NONE',
          proof: null,
          anchor: null,
          mint: null,
          history: [],
        },
      killSwitch: {
        active: kill.active,
        scope: kill.scope,
        triggeredBy: kill.triggeredBy,
        reasons: kill.reasons,
      },
      journey: {
        name: journeyName,
        phase: currentPhase,
        phaseIndex,
        phases: phaseSequence,
        artifactsSummary,
      },
      slo: { window: 0, latency: { p95: 0, p99: 0 }, rates: {} },
      alerts: [],
      cost: aggregated.ops.costs || null,
    };

    const agentContributionScore = runsWithScores.map((r) => ({
      agentId: r.agentId,
      contribution: r.scores?.weighted || 0,
      confidence: r.confidence || null,
    }));

    const costs = costModel.aggregateCosts(runsWithScores);
    const budgetDecision = costModel.evaluateBudget({
      totalCost: costs.total,
      budgetUsd: payload?.constraints?.budgetUsd ?? req.constraints?.budgetUsd,
    });
    aggregated.ops.costGuards = aggregated.ops.costGuards || [];
    if (budgetDecision.status === 'WARN') {
      addUnique(ops.fallbacks, 'cost_warn');
      addUnique(aggregated.ops.costGuards, 'reduce_rag_topk');
      addUnique(aggregated.ops.costGuards, 'lower_max_tokens');
    }
    if (budgetDecision.status === 'BLOCK') {
      addUnique(ops.fallbacks, 'cost_block');
      ops.execution.blocked = true;
      guardDecision.realExecutionAllowed = false;
      ops.execution.mode = 'DRY_RUN';
      addUnique(ops.execution.blockReasons, 'cost_budget_exceeded');
      addUnique(aggregated.ops.costGuards, 'force_mock_llm');
    }

    aggregated.ops.costs = {
      estimatedUsd: costs.total,
      byAgent: costs.byAgent,
      byPreset: preset?.name ? { [preset.name]: costs.total } : {},
      budget: budgetDecision.budgetUsd,
      status: budgetDecision.status,
    };

    aggregated.productMetrics = {
      actionsPlanned: actionPlanSteps.length,
      agentsRun: runsWithScores.length,
      warnings: ops.warnings.length,
      failures: ops.failures.length,
      durationMs: aggregated.metrics.durationMs,
      llmCacheHits: cacheHits,
      costEstimateUsd: costs.total,
    };
    aggregated.agentContributionScore = agentContributionScore;
    aggregated.decisionConfidenceBreakdown = {
      overall: aggregatedDecision.confidence,
      byAgent: agentContributionScore,
    };

    memoryStore.save(req.runId, {
      runId: req.runId,
      lastDecision: aggregated.decision,
      recommendedActions: recommendedActions,
      contradictions,
      timestamp: Date.now(),
      executionGateId: gateId || executionGateInfo?.gateId || null,
    }, tenantId);

    auditTrailStore.add({
              traceId: getTraceId(req, payload),
              runId: req?.runId || payload?.runId || 'unknown',
      intent: aggregated.intent,
      agents: runsWithScores.map((r) => ({ agentId: r.agentId, status: r.status })),
      contradictions: contradictions.length,
      decisionStatus: aggregated.decision.overallStatus,
      executionMode: ops.execution.mode,
      executionBlocked: ops.execution.blocked,
      timestamp: Date.now(),
    }, tenantId);

    metricsStore.record(aggregated, tenantId);
    const metricsSummaryAll = metricsStore.summary();
    const metricsByTenant = metricsStore.summaryByTenant();
    const alertsAll = alertingEngine.evaluate({ ...metricsSummaryAll, tenantId: 'all' });
    Object.values(metricsByTenant).forEach((ms) => alertingEngine.evaluate(ms));

    aggregated.ops.metricsSummary = { ...metricsSummaryAll, byTenant: metricsByTenant };
    aggregated.ops.costGuards = aggregated.ops.costGuards || [];
    aggregated.systemStatus.slo = {
      window: metricsSummaryAll.window,
      latency: metricsSummaryAll.latency,
      rates: metricsSummaryAll.rates,
      byTenant: metricsByTenant,
    };
    const recentAlerts = alertingEngine.recentAlerts(5);
    aggregated.systemStatus.alerts = recentAlerts;

    const memorySummary = memoryStore.summary();
    const idemSummary = idempotencyStore.summary();
    const auditSummaryStore = auditTrailStore.summary();
    const llmCacheSummary = llmCache.summary();
    aggregated.ops.memory = {
      evictions: {
        memory: memorySummary.evictions,
        idempotency: idemSummary.evictions,
        audit: auditSummaryStore.evictions || 0,
        llmCache: llmCacheSummary.evictions || 0,
      },
      pressure: metricsStore.memoryPressure(),
    };
    aggregated.systemStatus.tenant.memory = aggregated.ops.memory;
    if (!allowLlm || (cbState?.llm && cbState.llm.state !== 'CLOSED')) {
      addUnique(ops.fallbacks, 'circuit_breaker_llm');
    }

    const cbOpen = Object.values(cbState || {}).some((s) => s && s.state && s.state !== 'CLOSED');
    const degradationDecisions = {
      quota: quotaDecision.status !== 'OK' ? quotaDecision.status : null,
      cost: budgetDecision.status !== 'OK' ? budgetDecision.status : null,
      slo: (alertsAll || []).length > 0 ? 'ALERT' : null,
      circuit: cbOpen ? 'OPEN' : null,
      kill_switch: kill.active ? kill.scope : null,
    };
    const degradationApplied = degradationPolicy.apply(degradationDecisions);
    aggregated.systemStatus.degradation = { ...degradationApplied, decisions: degradationDecisions };

    const fallbackCategory = (fb) => {
      if (!fb) return null;
      if (fb.includes('quota')) return 'quota';
      if (fb.startsWith('cost')) return 'cost';
      if (fb.includes('slo')) return 'slo';
      if (fb.includes('circuit')) return 'circuit';
      if (fb.includes('kill')) return 'kill_switch';
      return null;
    };
    const orderedFallbacks = Array.from(new Set(ops.fallbacks || []));
    orderedFallbacks.sort((a, b) => {
      const ca = degradationPolicy.ORDER.indexOf(fallbackCategory(a));
      const cb = degradationPolicy.ORDER.indexOf(fallbackCategory(b));
      const va = ca === -1 ? degradationPolicy.ORDER.length : ca;
      const vb = cb === -1 ? degradationPolicy.ORDER.length : cb;
      return va - vb;
    });
    ops.fallbacks = orderedFallbacks;

    const totalRuns = Object.values(metricsByTenant).reduce((acc, m) => acc + (m?.window || 0), 0);
    const auditSummary = {
      totalRuns,
      warn: metricsSummaryAll.statusCounts.WARN,
      fail: metricsSummaryAll.statusCounts.FAIL,
      timeout: metricsSummaryAll.statusCounts.TIMEOUT,
      realBlocked: Math.round(metricsSummaryAll.rates.realBlocked * metricsSummaryAll.window),
      presets: metricsSummaryAll.presetUsage,
      topAgents: runsWithScores
        .reduce((acc, r) => {
          acc[r.agentId] = (acc[r.agentId] || 0) + 1;
          return acc;
        }, {}),
    };

    aggregated.systemStatus.auditSummary = auditSummary;

    quotaDecision = tenantQuotaRegistry.evaluateQuota(tenantId, {
      runsInWindow: metricsByTenant[tenantId]?.window || metricsSummaryAll.window,
      llmCallsPerRun: ops.llm.calls,
      costWindowUsd: (metricsByTenant[tenantId]?.llm?.costTotal || 0) + (aggregated.ops.costs?.estimatedUsd || 0),
      agentsPerRun: runsWithScores.length,
    });
    aggregated.systemStatus.quotas = {
      status: quotaDecision.status,
      reasons: quotaDecision.reasons,
      limits: quotaDecision.quota,
    };
    if (quotaDecision.status === 'BLOCK') {
      guardDecision.realExecutionAllowed = false;
      ops.execution.blocked = true;
      ops.execution.mode = 'DRY_RUN';
      addUnique(ops.execution.blockReasons, 'quota_exceeded');
      addUnique(ops.fallbacks, 'load_shed');
      addUnique(aggregated.ops.costGuards, 'quota_limit');
    } else if (quotaDecision.status === 'WARN') {
      addUnique(ops.fallbacks, 'quota_warn');
      addUnique(aggregated.ops.costGuards, 'quota_limit');
    }

    artifactStore.appendArtifacts({
      tenantId,
      runId: runKey,
      journey: journeyName,
      phase: currentPhase || 'default',
      agentResults: runsWithScores,
      responseSnapshot: aggregated,
    });

    telemetryAdapter.emit({
      type: 'orchestration',
      level: 'INFO',
      data: {
        traceId: getTraceId(req, payload),
        tenantId,
        intent: routed.intentNormalized,
        runId: req.runId,
        status: aggregated?.decision?.overallStatus || 'UNKNOWN',
        fallbacks: ops.fallbacks,
        alerts: recentAlerts,
        durationMs: metricsSummaryAll?.latency?.p95 || 0,
        journey: journeyName,
        phase: currentPhase,
        phaseIndex,
      },
    });
    if (aggregated.executionPlan && aggregated.executionPlan.steps) {
      const stepsCount = aggregated.executionPlan.steps.length;
      const blockedCount = aggregated.executionPlan.steps.filter((s) => s.status === 'BLOCKED_BY_GATE').length;
      const toolsUsed = Array.from(new Set(aggregated.executionPlan.steps.map((s) => s.toolId).filter(Boolean)));
      telemetryAdapter.emit({
        type: 'execution_plan_simulated',
        level: 'INFO',
        data: {
          event: 'execution_plan_simulated',
          mode: aggregated.executionPlan.mode || 'DRY_RUN',
          steps: stepsCount,
          blocked: blockedCount,
          toolsUsed: toolsUsed.length,
              traceId: getTraceId(req, payload),
              runId: req?.runId || payload?.runId || 'unknown',
          tenantId,
        },
      });
    }
    if (web3PipelineResult && web3PipelineResult.success && !web3PipelineResult.idempotent) {
      const previousState = web3PipelineState?.state || 'NONE';
      const newState = web3PipelineResult.state || 'NONE';
      if (previousState !== newState) {
        telemetryAdapter.emit({
          type: 'web3_pipeline_transition',
          level: 'INFO',
          data: {
            event: 'web3_pipeline_transition',
            from: previousState,
            to: newState,
            runId: req.runId,
            tenantId,
            action: web3Actions[0] || 'unknown',
          },
        });
      }
    }
    (alertsAll || [])
      .filter((a) => a.level === 'CRITICAL')
      .forEach((a) => telemetryAdapter.emit({ type: 'alert', level: a.level, data: a }));

    idempotencyStore.set(idempotencyKey, aggregated, tenantId);

    logger.info('Vertical slice completed', {
      traceId: getTraceId(req, payload),
      intent: routed.intentNormalized,
      runId: req?.runId || payload?.runId || 'unknown',
      agents: runs.map((r) => r.agentId),
      ragSource: ragContext?.source || 'none',
    });
  } catch (error) {
    logger.error('Orchestration failed hard', { error: error.message });
    const fallbackOps = {
      warnings: [...validationWarnings, 'orchestration_error'],
      disabledAgents: [],
      fallbacks: ['orchestration_error'],
      timeouts: [],
      failures: [],
      rag: { mode: 'disabled', domain: null, hits: 0 },
      llm: { mode: 'mock', provider: 'mock', model: 'mock', calls: 0 },
      execution: { mode: 'DRY_RUN', attempted: false, blocked: true, blockReasons: ['orchestration_exception'] },
    };
    aggregated = {
      traceId: payload?.traceId || 'unknown',
      intent: payload?.intent || 'unknown',
      runId: payload?.runId || 'unknown',
      agents: [],
      summary: 'orchestration_error',
      actions: [],
      contradictions: [],
      decision: {
        overallStatus: 'FAIL',
        topFindings: [],
        recommendedActions: [],
        rationale: 'orchestration exception',
      },
      memory: { reused: false, previousActionsCount: 0 },
      learning: { enabled: false, agents: [] },
      budgets: {},
      agentsMeta: { enabled: [], disabled: [] },
      journeyProgress: { phasesExecuted: [], currentPhase: null },
      executionPlan: { tools: [] },
      executionGate: null,
      executionResult: null,
      productionGuards: { realExecutionAllowed: false, reasons: ['orchestration_exception'] },
      executiveSummary: {
        headline: 'orchestration_error',
        keyFindings: [],
        topRisks: [],
        recommendedNextSteps: [],
        confidence: 0.3,
      },
      humanPlan: { objective: 'Recover from error', steps: [], warnings: ['orchestration_exception'] },
      ops: fallbackOps,
      systemStatus: {
        llm: 'mock',
        rag: 'disabled',
        execution: 'dry-run',
        agentsActiveCount: 0,
        audit: auditTrailStore.summary(),
        tenant: {
          id: tenantId,
          mode: 'isolated',
          caches: ['llm', 'idempotency', 'metrics', 'audit', 'memory'],
        },
        circuitBreakers: circuitBreaker.summary(tenantId)[tenantId],
        runtime: { coldStart },
        web3: {
          level: lastWeb3Guard.level,
          allowed: lastWeb3Guard.allowed,
          reasons: lastWeb3Guard.reasons,
          diagnostics: lastWeb3Guard.diagnostics,
        },
        quotas: { status: 'WARN', reasons: ['orchestration_exception'], limits: tenantQuotaRegistry.getQuota(tenantId) },
      },
      metrics: {
        agentsCount: 0,
        durationMs: Date.now() - startedAll,
        ragUsed: false,
        realExecutionAttempted: false,
      },
      presetMeta: null,
    };
    telemetryAdapter.emit({
      type: 'orchestration',
      level: 'ERROR',
      data: {
        traceId: aggregated.traceId,
        intent: aggregated.intent,
        runId: aggregated.runId,
        status: 'FAIL',
        fallbacks: ['orchestration_error'],
        error: error.message,
      },
    });
    auditTrailStore.add({
      traceId: aggregated.traceId,
      runId: aggregated.runId,
      intent: aggregated.intent,
      agents: [],
      contradictions: 0,
      decisionStatus: 'FAIL',
      executionMode: 'DRY_RUN',
      executionBlocked: true,
      timestamp: Date.now(),
    }, tenantId);

    metricsStore.record(aggregated, tenantId);
    const metricsSummaryAll = metricsStore.summary();
    const metricsByTenant = metricsStore.summaryByTenant();
    alertingEngine.evaluate({ ...metricsSummaryAll, tenantId: 'all' });
    Object.values(metricsByTenant).forEach((ms) => alertingEngine.evaluate(ms));
    aggregated.ops.metricsSummary = { ...metricsSummaryAll, byTenant: metricsByTenant };
    aggregated.systemStatus.slo = { window: metricsSummaryAll.window, latency: metricsSummaryAll.latency, rates: metricsSummaryAll.rates, byTenant: metricsByTenant };
    aggregated.systemStatus.alerts = alertingEngine.recentAlerts(5);
    const memorySummary = memoryStore.summary();
    const idemSummary = idempotencyStore.summary();
    const auditSummaryStore = auditTrailStore.summary();
    const llmCacheSummary = llmCache.summary();
    aggregated.ops.memory = {
      evictions: {
        memory: memorySummary.evictions,
        idempotency: idemSummary.evictions,
        audit: auditSummaryStore.evictions || 0,
        llmCache: llmCacheSummary.evictions || 0,
      },
      pressure: metricsStore.memoryPressure(),
    };
    aggregated.systemStatus.tenant.memory = aggregated.ops.memory;
  } finally {
    if (demoMode) {
      process.env.OPENAI_API_KEY = originalOpenAIKey;
    }
    if (acquiredSlot && slot && typeof slot.release === 'function') {
      try {
        slot.release();
      } catch (e) {
        /* noop */
      }
    }
  }

  return aggregated;
}

module.exports = {
  orchestrateVerticalSlice,
};
