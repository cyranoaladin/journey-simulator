const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function BuilderAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'anonymous' };
  const phase = agentInput.phase || context.phase || 'Build';
  const objective = agentInput.objective || context.objective || agentInput.input || context.input || 'prototype web3';
  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return {
    agent: 'BuilderAgent',
    phase,
    activationLevel: 0.92,
    ae_summary: 'Plan de construction généré',
    ae_outcome: 'Architecture technique validée',
    ragEnriched: snippets,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      sprintBacklog: [
        'Configurer les environnements et comptes développeur',
        'Initialiser le dépôt et la CI/CD',
        'Développer le smart contract principal',
        'Préparer les scénarios de tests et audits'
      ],
      recommendedStack: ['Solana', 'Anchor', 'TypeScript', 'Jest']
    }
  };
};
