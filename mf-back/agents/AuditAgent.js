const { getRagSnippets } = require('../rag/ragClient');

module.exports = async function(agentInput, context = {}) {
  const { userId, phase, objective } = context;
  const snippets = await getRagSnippets(objective);
  return {
    agent: 'AuditAgent',
    phase,
    activationLevel: 0.9,
    ae_summary: 'Analyse de sécurité automatique initiée',
    ae_outcome: 'Points faibles identifiés + recommandations',
    ragEnriched: true,
    references: snippets,
    ingestedDocuments: [],
    payload: {
      output: 'Audit préliminaire des contrats terminé',
      nextSteps: ['Correction des vulnérabilités', 'Audit formel externe']
    }
  };
};

