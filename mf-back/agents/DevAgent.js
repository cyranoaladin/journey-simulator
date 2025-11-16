const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'DevAgent',
    phase,
    activationLevel: 0.9,
    ae_summary: 'Développement technique amorcé',
    ae_outcome: 'Modules et endpoints API proposés',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Stack technique validée + repo initialisé',
      nextSteps: ['Implémentation des modules clés', 'CI/CD setup']
    }
  };
};

