const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'GrowthAgent',
    phase,
    activationLevel: 0.85,
    ae_summary: 'Stratégie de traction générée',
    ae_outcome: 'Campagne d’acquisition planifiée',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Canaux d’acquisition et métriques proposés',
      nextSteps: ['Lancement de campagne Twitter / Discord']
    }
  };
};

