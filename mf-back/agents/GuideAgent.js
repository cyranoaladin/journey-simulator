const { getRagSnippets } = require('../rag/ragClient');
module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'GuideAgent',
    phase,
    activationLevel: 0.8,
    ae_summary: 'Résumé généré pour GuideAgent',
    ae_outcome: 'Succès simulé pour GuideAgent',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Bienvenue dans votre parcours !',
      nextSteps: ['Exploration des modules recommandés']
    }
  };
};

