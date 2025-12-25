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

async function orchestrateVerticalSlice(payload) {
  const startedAll = Date.now();
  const req = normalizeRequest(payload);
  const routed = routeIntent({ intent: req.intent, input: req.input, context: req.context });
  const selected = routed.selectedAgents || [];

  const needsRag = selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false);
  let ragContext = null;
  if (needsRag) {
    ragContext = await ragClient.search({
      query: req.input || routed.intentNormalized || req.intent,
      topK: req.context?.rag?.topK || 4,
      traceId: req.traceId,
    });
  }

  const runs = await Promise.all(
    selected.map(async (sel) => {
      const meta = registryIndex[sel.agentId] || {};
      const agentInstance = agentsPool[sel.agentId];
      const started = Date.now();

      if (!agentInstance) {
        return {
          agentId: sel.agentId,
          status: 'FAIL',
          summary: 'Agent not registered',
          actions: [],
          citations: [],
          metrics: { latencyMs: 0 },
          errors: ['agent_not_registered'],
        };
      }

      const res = await agentInstance.run({
        traceId: req.traceId,
        runId: req.runId,
        input: req.input,
        ragContext: meta.requiresRag === false ? null : ragContext,
        constraints: req.constraints,
        intentNormalized: routed.intentNormalized,
      });

      return {
        ...res,
        agentId: sel.agentId,
        metrics: {
          ...(res.metrics || {}),
          latencyMs: res.metrics?.latencyMs ?? Date.now() - started,
        },
      };
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
