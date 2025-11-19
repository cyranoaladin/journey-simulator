// 📄 agents/AgentTemplate.js

const { getRagSnippets, ingestDocumentsIfNeeded } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function AgentTemplate(agentInput = {}, context = {}) {
  const agentName = 'AgentTemplate';
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Discover';
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || `Phase ${phase}`;

  const ragSnippets = await getRagSnippets({ query: objective, userContext: user });
  const ingestedDocuments = await ingestDocumentsIfNeeded({ userId: user.id || user.userId || 'demo_user', phase });

  const generatedResponse =
    `Agent ${agentName} a analyse les donnees et recommande d'etudier ${ragSnippets[0]?.title || 'les documents fournis'}.`;

  return createAgentResponse(agentName, {
    phase,
    intent: context.intent || agentInput.intent || null,
    objective,
    prompt: `Synthese rapide des donnees utiles pour ${phase}`,
    reasoning: 'Analyse initiale de la mission pour identifier les ressources les plus pertinentes.',
    action: "Selectionner les ressources clefs et lancer l'agent suivant si necessaire.",
    summary: `Resultat genere par ${agentName}`,
    outcome: 'pending',
    payload: {
      message: generatedResponse,
      ingestedDocuments,
    },
    snippets: ragSnippets,
    ingestedDocuments,
    metrics: { confidence: 0.8, success: true, impact: 'medium' },
    user,
  });
};
