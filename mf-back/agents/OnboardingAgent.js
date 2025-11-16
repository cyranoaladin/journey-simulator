const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'OnboardingAgent',
    phase,
    activationLevel: 0.7,
    ae_summary: 'Profil utilisateur initial analysé',
    ae_outcome: 'Setup personnalisé recommandé',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Bienvenue ! Voici vos prochaines étapes personnalisées',
      nextSteps: ['Choisir un parcours', 'Configurer votre wallet Phantom']
    }
  };
};

