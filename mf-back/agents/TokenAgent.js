const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'TokenAgent',
    phase,
    activationLevel: 0.9,
    ae_summary: 'Modèle tokenomics généré',
    ae_outcome: 'Architecture de jeton SPL prête à déployer',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Distribution, vesting et utilité du token définis',
      nextSteps: ['Génération du smart contract SPL']
    }
  };
};

