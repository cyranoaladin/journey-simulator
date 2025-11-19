const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function AuditAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Audit';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'audit securite contrat';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('AuditAgent', {
    phase,
    intent,
    objective,
    prompt: `Identifier les risques de securite critiques pour "${objective}"`,
    reasoning:
      'Analyse les contrats, checklists de securite et incidents similaires pour detecter les surfaces de risque.',
    action: 'Prioriser les correctifs proposes et planifier un audit externe cible.',
    summary: 'Analyse de securite automatique initiee',
    outcome: 'Points faibles identifies et recommandations structurees',
    payload: {
      output: 'Audit preliminaire des contrats termine',
      nextSteps: ['Correction des vulnerabilites', 'Audit formel externe'],
    },
    snippets,
    metrics: { confidence: 0.9, success: true, impact: 'high' },
    user,
  });
};

