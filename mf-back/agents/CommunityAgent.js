const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'CommunityAgent',
    phase,
    activationLevel: 0.8,
    ae_summary: 'Stratégie communauté proposée',
    ae_outcome: 'Structure Discord + modération définies',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Plan de community management prêt',
      nextSteps: ['Ouverture des salons', 'Lancement ambassadeurs']
    }
  };
};

