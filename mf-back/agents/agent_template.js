// 📄 agents/AgentTemplate.js

const { getRagSnippets, ingestDocumentsIfNeeded } = require('../rag/ragClient');

module.exports = async function AgentTemplate({ user, journey, phase, input }) {
  const agentName = 'AgentTemplate';

  // 🔍 Recherche dans le RAG
  const ragSnippets = await getRagSnippets({ query: input || phase, userContext: user });

  // 📄 Ingestion si documents fournis
  const ingestedDocuments = await ingestDocumentsIfNeeded({ userId: user.id, phase });

  // 🤖 Simulation d'appel LLM
  const generatedResponse = `Agent ${agentName} a analysé les données et recommande d'étudier ${ragSnippets[0]?.title || 'les documents fournis'}.`;

  return {
    agent: agentName,
    phase,
    ragEnriched: ragSnippets,
    ingestedDocuments,
    payload: generatedResponse,
    ae_summary: `Résultat généré par ${agentName}`,
    ae_outcome: 'pending',
    activationLevel: 0.8,
    checkpoint: false
  };
}
