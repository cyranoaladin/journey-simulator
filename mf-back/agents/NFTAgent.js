const { getRagSnippets } = require('../rag/ragClient');
module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'NFTAgent',
    phase,
    activationLevel: 0.85,
    ae_summary: 'Modèle NFT généré',
    ae_outcome: 'Proposition de collection',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Prototype NFT prêt à mint',
      nextSteps: ['Uploader les assets', 'Configurer la metadata']
    }
  };
};

