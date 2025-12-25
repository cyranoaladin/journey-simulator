const { normalizeRequest } = require('./agentProtocol');
const { RAGClient } = require('./ragClient');
const { routeIntent } = require('./intentRouter');
const registry = require('../agents/registry');
const SecurityAuditAgent = require('../agents/SecurityAuditAgent');
const ProductSpecAgent = require('../agents/ProductSpecAgent');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;
const memoryStore = require('./memoryStore');
const executionGate = require('./executionGate');
const toolsRegistry = require('./toolsRegistry');
const executionEngine = require('./executionEngine');

const ragClient = new RAGClient();
const logger = createLogger(__filename);

const agentsPool = {
  SecurityAuditAgent: new SecurityAuditAgent(),
  ProductSpecAgent: new ProductSpecAgent(),
};

const registryIndex = registry.reduce((acc, agent) => {
  acc[agent.agentId] = agent;
  return acc;
}, {});

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

const toolIndex = toolsRegistry.reduce((acc, t) => {
  acc[(t.toolId || '').toLowerCase()] = t;
  return acc;
}, {});

const normalizeActionKey = (action) => (action || '').toLowerCase().trim();

const mapActionToTool = (action) => {
  const key = normalizeActionKey(action);
  if (key.includes('allow uploads')) return toolsRegistry.find((t) => t.toolId === 'allow_uploads');
  if (key.includes('deny uploads')) return toolsRegistry.find((t) => t.toolId === 'deny_uploads');
  if (key.includes('enable checklist')) return toolsRegistry.find((t) => t.toolId === 'enable_checklist');
  return toolIndex[key] || null;
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
  const req = normalizeRequest(payload);
  const routed = routeIntent({ intent: req.intent, input: req.input, context: req.context });
  const selected = routed.selectedAgents || [];
  const previous = memoryStore.get(req.runId);
  const memoryEntries = memoryStore.values();
  const learningMap = computeLearningScores(selected, registryIndex, memoryEntries);

  let ragContext = null;
  try {
    const needsRag = selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false);
    if (needsRag) {
      ragContext = await ragClient.search({
        query: req.input || routed.intentNormalized || req.intent,
        topK: req.context?.rag?.topK || 4,
        traceId: req.traceId,
      });
    }
  } catch (error) {
    logger.warn('RAG failed, continuing without context', { traceId: req.traceId, error: error.message });
    ragContext = null;
  }

  const runs = await Promise.all(
    selected.map(async (sel) => {
      const meta = registryIndex[sel.agentId] || {};
      const agentInstance = agentsPool[sel.agentId];
      const started = Date.now();
      const timeoutMs = req.constraints?.timeoutMs ?? meta.timeouts?.agentMs ?? meta.timeoutMs ?? 6000;

      if (!agentInstance) {
        return {
          agentId: sel.agentId,
          status: 'FAIL',
          summary: 'Agent not registered',
          actions: [],
          citations: [],
          metrics: { latencyMs: 0 },
          errors: ['agent_not_registered'],
          traceId: req.traceId,
        };
      }

      try {
        const res = await timeoutGuard(
          agentInstance.run({
            traceId: req.traceId,
            runId: req.runId,
            input: req.input,
            ragContext: meta.requiresRag === false ? null : ragContext,
            constraints: req.constraints,
            intentNormalized: routed.intentNormalized,
          }),
          timeoutMs,
          sel.agentId,
          req.traceId
        );

        const effectiveWeight = learningMap[sel.agentId]?.learningScore;
        const resWithScores = {
          ...res,
          agentId: sel.agentId,
          traceId: req.traceId,
          metrics: {
            ...(res.metrics || {}),
            latencyMs: res.metrics?.latencyMs ?? Date.now() - started,
          },
          scores: computeScores(res, meta, effectiveWeight),
        };
        return resWithScores;
      } catch (error) {
        logger.error('Agent execution failed', { traceId: req.traceId, agentId: sel.agentId, error: error.message });
        return {
          agentId: sel.agentId,
          traceId: req.traceId,
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

  const runsWithScores = runs.map((r) => {
    if (r.scores) return r;
    const meta = registryIndex[r.agentId] || {};
    return { ...r, scores: computeScores(r, meta) };
  });

  const summary = runs
    .map((r) => r.summary || r.details || r.status || r.agentId)
    .filter(Boolean)
    .join(' | ');

  const actions = runsWithScores.flatMap((r) => (Array.isArray(r.actions) ? r.actions : []));
  const contradictions = detectContradictions(runsWithScores);

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

  const aggregated = {
    traceId: req.traceId,
    intent: routed.intentNormalized,
    runId: req.runId,
    agents: runsWithScores,
    summary,
    actions,
    contradictions,
    decision: {
      overallStatus,
      topFindings,
      recommendedActions,
      rationale: `Selected actions from highest weighted agents. Contradictions detected: ${contradictions.length}.`,
    },
    memory: {
      reused: Boolean(previous),
      previousActionsCount: previous?.recommendedActions?.length || previous?.decision?.recommendedActions?.length || 0,
    },
    learning: {
      enabled: true,
      agents: Object.values(learningMap),
    },
    metrics: {
      agentsCount: runsWithScores.length,
      durationMs: Date.now() - startedAll,
    },
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
    const key = (item.action || '').toLowerCase().trim();
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

  // Execution plan (declarative, no side effects)
  const executionTools = actionPlanSteps.map((step) => {
    const tool = mapActionToTool(step.action);
    if (!tool) {
      return {
        toolId: null,
        action: step.action,
        sourceAgent: step.sourceAgent,
        priority: step.priority,
        unexecutable: true,
        requiresConfirmation: false,
      };
    }
    return {
      toolId: tool.toolId,
      action: step.action,
      sourceAgent: step.sourceAgent,
      priority: step.priority,
      requiresConfirmation: tool.requiresConfirmation || tool.sideEffects === 'external' || tool.sideEffects === 'irreversible',
      sideEffects: tool.sideEffects,
    };
  });

  aggregated.executionPlan = {
    tools: executionTools,
  };

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
    gateId = executionGate.submit({ traceId: req.traceId, runId: req.runId, executionPlan: executionTools });
    executionGateInfo = { gateId, status: 'PENDING', requiresHuman: true };
  }

  let executionResult = null;
  if (executionGateInfo?.gateId) {
    const state = executionGate.get(executionGateInfo.gateId);
    if (state?.status === 'APPROVED') {
      executionResult = executionEngine.simulate({ executionPlan: executionTools, traceId: req.traceId });
      executionGateInfo.status = 'APPROVED';
    }
  }

  aggregated.executionResult = executionResult;
  aggregated.executionGate = executionGateInfo;

  memoryStore.save(req.runId, {
    runId: req.runId,
    lastDecision: aggregated.decision,
    recommendedActions: recommendedActions,
    contradictions,
    timestamp: Date.now(),
    executionGateId: gateId || executionGateInfo?.gateId || null,
  });

  logger.info('Vertical slice completed', {
    traceId: req.traceId,
    intent: routed.intentNormalized,
    runId: req.runId,
    agents: runs.map((r) => r.agentId),
    ragSource: ragContext?.source || 'none',
  });

  return aggregated;
}

module.exports = {
  orchestrateVerticalSlice,
};
