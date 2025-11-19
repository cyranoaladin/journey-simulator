const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function DAOAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'DAO';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'structure de gouvernance';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('DAOAgent', {
    phase,
    intent,
    objective,
    prompt: `Designer une gouvernance DAO pour "${objective}"`,
    reasoning:
      'Compare les modeles de gouvernance, quorum et roles observes dans les references RAG pour suggerer une structure resilient.',
    action: 'Configurer le module de vote propose et valider la matrice de roles.',
    summary: 'Structure de gouvernance DAO proposee',
    outcome: 'Regles de vote et roles definis',
    payload: {
      output: 'DAO configuree avec quorum, roles et vote system',
      nextSteps: ['Deploiement du module DAO', 'Integration Snapshot ou Realms'],
    },
    snippets,
    metrics: { confidence: 0.84, success: true, impact: 'high' },
    user,
  });
};

