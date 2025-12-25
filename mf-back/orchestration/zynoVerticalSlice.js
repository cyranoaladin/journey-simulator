const { normalizeRequest } = require('./agentProtocol');
const { RAGClient } = require('./ragClient');
const SecurityAuditAgent = require('../agents/SecurityAuditAgent');
const ProductSpecAgent = require('../agents/ProductSpecAgent');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;

const ragClient = new RAGClient();
const logger = createLogger(__filename);

const agents = {
  SecurityAuditAgent: new SecurityAuditAgent(),
  ProductSpecAgent: new ProductSpecAgent(),
};

async function orchestrateVerticalSlice(payload) {
  const req = normalizeRequest(payload);
  const { traceId, intent, input, context, constraints } = req;

  const ragResult = await ragClient.search({
    query: input || intent,
    topK: context?.rag?.topK || 4,
    traceId,
  });

  const commonRequest = {
    traceId,
    intent,
    input,
    constraints,
    context,
    rag: { ...ragResult },
  };

  const runs = await Promise.all(
    Object.values(agents).map(async (agent) => {
      const started = Date.now();
      const res = await agent.run(commonRequest);
      return {
        ...res,
        metrics: {
          ...(res.metrics || {}),
          latencyMs: res.metrics?.latencyMs ?? Date.now() - started,
        },
      };
    })
  );

  const aggregated = {
    traceId,
    intent,
    runId: req.runId,
    agents: runs,
    summary: runs.map((r) => `${r.agentId}: ${r.status}`).join(' | '),
    rag: { source: ragResult.source, hits: ragResult.chunks?.length || 0 },
  };

  logger.info('Vertical slice completed', {
    traceId,
    intent,
    runId: req.runId,
    agents: runs.map((r) => r.agentId),
    ragSource: ragResult.source,
  });

  return aggregated;
}

module.exports = {
  orchestrateVerticalSlice,
};
