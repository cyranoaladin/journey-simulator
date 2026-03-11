/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026 (Enhanced with Neural Nexus)
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { RAGClient } = require('../ragClient');
const { ChromaDBClient } = require('../chromaDbClient');

// Use ChromaDB if USE_CHROMADB=true, otherwise use legacy RAGClient (Pinecone)
const useChromaDB = process.env.USE_CHROMADB === 'true' || process.env.USE_OLLAMA === 'true';
const ragClient = useChromaDB ? new ChromaDBClient() : new RAGClient();

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

async function fetchNeuralNexusContext(query, topK = 3) {
  try {
    const { retrieveContext } = require('../../services/neuralNexusService');
    const contextChunks = await retrieveContext(query, topK);
    
    if (!contextChunks || contextChunks.length === 0) {
      return null;
    }
    
    return {
      source: 'neural_nexus',
      chunks: contextChunks.map(chunk => ({
        id: chunk.id,
        text: chunk.content,
        title: chunk.metadata.title,
        category: chunk.metadata.category,
        score: chunk.score,
        metadata: chunk.metadata,
      })),
    };
  } catch (error) {
    console.warn('[Neural Nexus] Context fetch failed:', error.message);
    return null;
  }
}

function mergeRagContexts(externalContext, neuralNexusContext) {
  if (!externalContext && !neuralNexusContext) return null;
  if (!externalContext) return neuralNexusContext;
  if (!neuralNexusContext) return externalContext;
  
  return {
    source: 'hybrid_rag',
    chunks: [
      ...(externalContext.chunks || []),
      ...(neuralNexusContext.chunks || []),
    ].slice(0, 10),
  };
}

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

  const query = req.input || routed.intentNormalized || req.intent;
  const topK = Math.min(req.context?.rag?.topK || 4, 10);
  
  let externalRagContext = null;
  let neuralNexusContext = null;

  try {
    ragDomains = resolveRagDomains(selected, registryIndex);
    if (process.env.NODE_ENV !== 'test') {
      console.log('[RAG_DEBUG]: Querying vector store with:', query);
    }

    externalRagContext = await ragClient.search({
      query,
      topK,
      traceId: getTraceId(req, payload),
      domain: ragDomains,
    });
  } catch (error) {
    const safeTraceId = req?.traceId || payload?.traceId || 'unknown';
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn('External RAG failed', { traceId: safeTraceId, error: errorMsg });
  }

  try {
    neuralNexusContext = await fetchNeuralNexusContext(query, topK);
    if (neuralNexusContext) {
      console.log('[Neural Nexus] Retrieved context:', neuralNexusContext.chunks.length, 'chunks');
    }
  } catch (error) {
    logger.warn('Neural Nexus RAG failed', { error: error.message });
  }

  ragContext = mergeRagContexts(externalRagContext, neuralNexusContext);

  if (!ragContext) {
    ops.fallbacks && ops.fallbacks.push('rag_disabled');
    ops.rag.mode = 'disabled';
  } else {
    ops.rag.mode = ragContext.source || 'hybrid';
  }

  return { ragContext, ragDomains };
}

module.exports = {
  fetchRagContext,
  fetchNeuralNexusContext,
};
