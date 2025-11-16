const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'InvestorAgent',
    phase,
    activationLevel: 0.8,
    ae_summary: 'Liste d’investisseurs stratégiques proposée',
    ae_outcome: 'Préparation au pitch investisseur réussie',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Liste VCs, angels et fonds ciblés générée',
      nextSteps: ['Prise de contact', 'Envoi de pitch decks']
    }
  };
};

