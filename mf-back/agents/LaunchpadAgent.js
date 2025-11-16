const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'LaunchpadAgent',
    phase,
    activationLevel: 0.85,
    ae_summary: 'Préparation de la campagne de lancement',
    ae_outcome: 'Checklist launchpad complète générée',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Checklist de lancement complète avec milestones',
      nextSteps: ['Choix d’un launchpad Solana', 'Préparation au TGE']
    }
  };
};

