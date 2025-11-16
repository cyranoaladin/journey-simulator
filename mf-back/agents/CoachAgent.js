const { getRagSnippets } = require('../rag/ragClient');
module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'CoachAgent',
    phase,
    activationLevel: 0.8,
    ae_summary: 'Résumé généré pour CoachAgent',
    ae_outcome: 'Succès simulé pour CoachAgent',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Suivi personnalisé généré',
      nextSteps: ['Rappel des objectifs à atteindre']
    }
  };
};

