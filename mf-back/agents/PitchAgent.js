const { getRagSnippets } = require('../rag/ragClient');
module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'PitchAgent',
    phase,
    activationLevel: 0.85,
    ae_summary: 'Pitch structuré généré',
    ae_outcome: 'Prototype de pitch prêt à usage',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Voici votre pitch deck : [draft]',
      nextSteps: ['Valider ou améliorer le contenu']
    }
  };
};

