const { normalizeRequest } = require('./agentProtocol');
const { RAGClient } = require('./ragClient');
const { routeIntent } = require('./intentRouter');
const registry = require('../agents/registry');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;
const memoryStore = require('./memoryStore');
const executionGate = require('./executionGate');
const toolsRegistry = require('./toolsRegistry');
const executionEngine = require('./executionEngine');
const workflowMap = require('./workflowMap');
const { applyRagPolicy } = require('./ragPolicy');
const productionGuards = require('./productionGuards');
const auditTrailStore = require('./auditTrailStore');

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

const getAgentIdForIntent = (intent) => {
  const match = registry.find((a) => a.enabled !== false && a.intents.includes(intent));
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
    const key = (i || '').toLowerCase().trim().replace(/\./g, '_');
    if (key) unique.set(key, key);
  });
  return Array.from(unique.values()).sort((a, b) => {
    const pa = registryIndex[getAgentIdForIntent(a)]?.priority || 0;
    const pb = registryIndex[getAgentIdForIntent(b)]?.priority || 0;
    if (pb !== pa) return pb - pa;
    return a.localeCompare(b);
  });
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
  let aggregated = null;

  const addUnique = (arr, value) => {
    if (!value) return;
    if (!arr.includes(value)) arr.push(value);
  };

  try {
    const req = normalizeRequest(payload);
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
      },
      execution: { mode: 'DRY_RUN', attempted: false, blocked: false, blockReasons: [] },
    };

    const journeyPhases = Array.isArray(req.context?.journey?.phases) && req.context?.journey?.phases.length > 0
      ? req.context.journey.phases
      : req.context?.journey?.phaseId
        ? [req.context.journey.phaseId]
        : [];

    const workflowIntents = journeyPhases.flatMap((phaseId) =>
      resolveWorkflowIntents({ ...req.context?.journey, phaseId })
    );

    const intentsCombined = [req.intent, ...workflowIntents].filter(Boolean);
    const intentsDeduped = dedupeAndOrderIntents(intentsCombined);
    const routed = routeIntent({
      intent: intentsDeduped,
      input: req.input,
      context: req.context,
    });
    const selected = routed.selectedAgents || [];
    const previous = memoryStore.get(req.runId);
    const memoryEntries = memoryStore.values();
    const learningMap = computeLearningScores(selected, registryIndex, memoryEntries);
    const defaultModel = registryIndex[selected[0]?.agentId]?.llmProfile?.model || 'gpt-4o';
    ops.llm.model = defaultModel;

    let ragContext = null;
    let ragDomains = '';
    try {
      const needsRag = selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false);
      if (needsRag) {
        ragDomains = selected
          .map((a) => registryIndex[a.agentId]?.domain)
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(' ');
        ragContext = await ragClient.search({
          query: req.input || routed.intentNormalized || req.intent,
          topK: req.context?.rag?.topK || 4,
          traceId: req.traceId,
          domain: ragDomains,
        });
      } else {
        ops.rag.mode = 'disabled';
      }
    } catch (error) {
      logger.warn('RAG failed, continuing without context', { traceId: req.traceId, error: error.message });
      ragContext = null;
      addUnique(ops.fallbacks, 'rag_disabled');
    }

    const runs = await Promise.all(
      selected.map(async (sel) => {
        const meta = registryIndex[sel.agentId] || {};
        const agentInstance = agentsPool[sel.agentId];
        const started = Date.now();
        const timeoutMs = req.constraints?.timeoutMs ?? meta.timeouts?.agentMs ?? meta.timeoutMs ?? 6000;

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
              journey: req.context?.journey || null,
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

    let runsWithScores = runs.map((r) => {
      if (r.scores) return r;
      const meta = registryIndex[r.agentId] || {};
      return { ...r, scores: computeScores(r, meta) };
    });

    runsWithScores = applyRagPolicy(runsWithScores);
    runsWithScores = applyRagPolicy(runsWithScores);

    ops.llm.calls = runsWithScores.length;

    const summary = runsWithScores
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

    const agentsMeta = {
      enabled: registry.filter((a) => a.enabled !== false).map((a) => a.agentId),
      disabled: registry.filter((a) => a.enabled === false).map((a) => a.agentId),
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

    const aggregatedDecision = {
      overallStatus,
      topFindings,
      recommendedActions,
      rationale: `Selected actions from highest weighted agents. Contradictions detected: ${contradictions.length}.`,
    };

    aggregated = {
      traceId: req.traceId,
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
            req.constraints?.maxTokens || meta.maxTokens || 800,
            meta.maxTokens || 800
          );
          const effectiveTimeout = req.constraints?.timeoutMs || meta.timeoutMs || 6000;
          return [sel.agentId, { maxTokens: effectiveMaxTokens, timeoutMs: effectiveTimeout }];
        })
      ),
      agentsMeta,
      journeyProgress: {
        phasesExecuted: journeyPhases,
        currentPhase: journeyPhases[journeyPhases.length - 1] || null,
      },
      executionPlan: null,
      executionGate: null,
      executionResult: null,
      systemStatus: {
        llm: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
        rag: ragContext ? ragContext.source || 'unknown' : 'disabled',
        execution: process.env.EXECUTION_ENABLED === 'true' ? 'real-enabled' : 'dry-run',
        agentsActiveCount: agentsMeta.enabled.length,
      },
      metrics: {
        agentsCount: runsWithScores.length,
        durationMs: Date.now() - startedAll,
        ragUsed: Boolean(ragContext),
        realExecutionAttempted: process.env.EXECUTION_ENABLED === 'true',
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

    const guardDecision = productionGuards.evaluateProductionGuards({
      executionEnabled: process.env.EXECUTION_ENABLED === 'true',
      gateApproved: executionGateInfo?.status === 'APPROVED',
      contradictions,
      runs: runsWithScores,
      intents: intentsDeduped,
      agentsMeta,
    });

    ops.execution.blockReasons = guardDecision.reasons;
    ops.execution.blocked = guardDecision.reasons.length > 0;
    ops.execution.mode = guardDecision.realExecutionAllowed ? 'REAL' : 'DRY_RUN';

    let executionResult = null;
    if (executionGateInfo?.gateId) {
      const state = executionGate.get(executionGateInfo.gateId);
      if (state?.status === 'APPROVED' && guardDecision.realExecutionAllowed) {
        try {
          if (process.env.EXECUTION_ENABLED === 'true') {
            logger.info('Real execution enabled, attempting guarded execution', { traceId: req.traceId, gateId: executionGateInfo.gateId });
            executionResult = executionEngine.execute({
              executionPlan: executionTools,
              traceId: req.traceId,
              gateApproved: true,
            });
            executionGateInfo.status = 'APPROVED';
            ops.execution.attempted = true;
            ops.execution.mode = 'REAL';
          } else {
            executionResult = executionEngine.simulate({ executionPlan: executionTools, traceId: req.traceId });
            executionGateInfo.status = 'APPROVED';
            ops.execution.attempted = true;
            ops.execution.mode = 'DRY_RUN';
            addUnique(ops.fallbacks, 'real_disabled_flag');
          }
        } catch (err) {
          logger.warn('Execution (real) blocked or failed, falling back to dry-run', {
            traceId: req.traceId,
            gateId: executionGateInfo.gateId,
            error: err.message,
          });
          executionResult = executionEngine.simulate({ executionPlan: executionTools, traceId: req.traceId });
          executionGateInfo.status = state?.status || executionGateInfo.status;
          ops.execution.attempted = true;
          ops.execution.mode = 'DRY_RUN';
          addUnique(ops.fallbacks, 'execution_fallback');
        }
      } else if (state?.status === 'APPROVED' && !guardDecision.realExecutionAllowed) {
        executionResult = executionEngine.simulate({ executionPlan: executionTools, traceId: req.traceId });
        ops.execution.attempted = true;
        ops.execution.mode = 'DRY_RUN';
        ops.execution.blocked = true;
      }
    } else if (executionTools.length > 0) {
      // No gate needed, still simulate for preview
      executionResult = executionEngine.simulate({ executionPlan: executionTools, traceId: req.traceId });
      ops.execution.attempted = true;
      ops.execution.mode = guardDecision.realExecutionAllowed ? ops.execution.mode : 'DRY_RUN';
      if (!guardDecision.realExecutionAllowed) ops.execution.blocked = true;
    }

    aggregated.executionResult = executionResult;
    aggregated.executionGate = executionGateInfo;
    aggregated.productionGuards = guardDecision;
    aggregated.ops = ops;

    aggregated.systemStatus = {
      llm: ops.llm.mode,
      rag: ops.rag.mode,
      execution: ops.execution.mode.toLowerCase() === 'real' ? 'real-enabled' : 'dry-run',
      agentsActiveCount: agentsMeta.enabled.length,
      audit: auditTrailStore.summary(),
    };

    memoryStore.save(req.runId, {
      runId: req.runId,
      lastDecision: aggregated.decision,
      recommendedActions: recommendedActions,
      contradictions,
      timestamp: Date.now(),
      executionGateId: gateId || executionGateInfo?.gateId || null,
    });

    auditTrailStore.add({
      traceId: req.traceId,
      runId: req.runId,
      intent: aggregated.intent,
      agents: runsWithScores.map((r) => ({ agentId: r.agentId, status: r.status })),
      contradictions: contradictions.length,
      decisionStatus: aggregated.decision.overallStatus,
      executionMode: ops.execution.mode,
      executionBlocked: ops.execution.blocked,
      timestamp: Date.now(),
    });

    aggregated.systemStatus = {
      llm: ops.llm.mode,
      rag: ops.rag.mode,
      execution: ops.execution.mode.toLowerCase() === 'real' ? 'real-enabled' : 'dry-run',
      agentsActiveCount: agentsMeta.enabled.length,
      audit: auditTrailStore.summary(),
    };

    logger.info('Vertical slice completed', {
      traceId: req.traceId,
      intent: routed.intentNormalized,
      runId: req.runId,
      agents: runs.map((r) => r.agentId),
      ragSource: ragContext?.source || 'none',
    });
  } catch (error) {
    logger.error('Orchestration failed hard', { error: error.message });
    const fallbackOps = {
      warnings: ['orchestration_error'],
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
      ops: fallbackOps,
      systemStatus: {
        llm: 'mock',
        rag: 'disabled',
        execution: 'dry-run',
        agentsActiveCount: 0,
        audit: auditTrailStore.summary(),
      },
      metrics: {
        agentsCount: 0,
        durationMs: Date.now() - startedAll,
        ragUsed: false,
        realExecutionAttempted: false,
      },
    };
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
    });
  }

  return aggregated;
}

module.exports = {
  orchestrateVerticalSlice,
};
