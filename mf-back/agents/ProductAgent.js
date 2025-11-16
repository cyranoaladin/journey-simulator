const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'ProductAgent',
    phase,
    activationLevel: 0.75,
    ae_summary: 'Feuille de route produit créée',
    ae_outcome: 'Maquette fonctionnelle alignée sur besoin utilisateur',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Roadmap produit générée avec features clés',
      nextSteps: ['Tests utilisateurs', 'Amélioration UX/UI']
    }
  };
};

