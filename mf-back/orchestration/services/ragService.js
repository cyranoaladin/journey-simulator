const { RAGClient } = require('../ragClient');
const ragClient = new RAGClient();

const resolveRagDomains = (selected, registryIndex) =>
  selected
    .map((a) => registryIndex[a.agentId]?.domain)
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(' ');

const shouldUseRag = (selected, registryIndex, demoMode, allowRag) => {
  if (demoMode) {
    return { mode: 'local', allowed: true, needsRag: false };
  }
  const needsRag = selected.some((a) => (registryIndex[a.agentId]?.requiresRag ?? false) !== false);
  if (!needsRag) {
    return { mode: 'disabled', allowed: allowRag, needsRag: false };
  }
  return { mode: allowRag ? 'remote' : 'disabled', allowed: allowRag, needsRag };
};

async function fetchRagContext({
  selected,
  registryIndex,
  allowRag,
  demoMode,
  req,
  routed,
  payload,
  getTraceId,
  ops,
  logger,
}) {
  let ragContext = null;
  let ragDomains = '';
  const ragDecision = shouldUseRag(selected, registryIndex, demoMode, allowRag);

  if (demoMode) {
    ops.rag.mode = 'local';
    return { ragContext: { source: 'demo_local', chunks: [] }, ragDomains };
  }

  if (!ragDecision.needsRag || !ragDecision.allowed) {
    ops.rag.mode = 'disabled';
    if (!ragDecision.allowed) ops.fallbacks && ops.fallbacks.push('circuit_breaker_rag');
    return { ragContext: null, ragDomains };
  }

  try {
    ragDomains = resolveRagDomains(selected, registryIndex);
    if (process.env.NODE_ENV !== 'test') {
      // Observabilité RAG: trace la requête exacte avant envoi au store vectoriel
      // eslint-disable-next-line no-console
      console.log('[RAG_DEBUG]: Querying vector store with:', req.input || routed.intentNormalized || req.intent);
    }
    ragContext = await ragClient.search({
      query: req.input || routed.intentNormalized || req.intent,
      topK: req.context?.rag?.topK || 4,
      traceId: getTraceId(req, payload),
      domain: ragDomains,
    });
    ops.rag.mode = (ragContext?.source || '').includes('remote') ? 'remote' : 'local';
  } catch (error) {
    const safeTraceId = req?.traceId || payload?.traceId || 'unknown';
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn('RAG failed, continuing without context', { traceId: safeTraceId, error: errorMsg });
    ragContext = null;
    ops.fallbacks && ops.fallbacks.push('rag_disabled');
    ops.rag.mode = 'disabled';
  }

  return { ragContext, ragDomains };
}

module.exports = {
  fetchRagContext,
};
