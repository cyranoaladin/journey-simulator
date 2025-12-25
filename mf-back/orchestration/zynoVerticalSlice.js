const { normalizeRequest } = require('./agentProtocol');
const { RAGClient } = require('./ragClient');
const { routeIntent } = require('./intentRouter');
const registry = require('../agents/registry');
const SecurityAuditAgent = require('../agents/SecurityAuditAgent');
const ProductSpecAgent = require('../agents/ProductSpecAgent');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;

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

        return {
          ...res,
          agentId: sel.agentId,
          traceId: req.traceId,
          metrics: {
            ...(res.metrics || {}),
            latencyMs: res.metrics?.latencyMs ?? Date.now() - started,
          },
        };
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
        };
      }
    })
  );

  const summary = runs
    .map((r) => r.summary || r.details || r.status || r.agentId)
    .filter(Boolean)
    .join(' | ');

  const actions = runs.flatMap((r) => (Array.isArray(r.actions) ? r.actions : []));

  const aggregated = {
    traceId: req.traceId,
    intent: routed.intentNormalized,
    runId: req.runId,
    agents: runs,
    summary,
    actions,
    metrics: {
      agentsCount: runs.length,
      durationMs: Date.now() - startedAll,
    },
  };

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
