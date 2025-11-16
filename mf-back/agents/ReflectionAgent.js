const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'ReflectionAgent',
    phase,
    activationLevel: 0.9,
    ae_summary: 'Bilan d’étape généré',
    ae_outcome: 'Auto-évaluation et suggestions pour continuer',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Voici votre évaluation AEPO/AECO à ce stade',
      nextSteps: ['Consolider vos acquis', 'Passer à la prochaine phase']
    }
  };
};

