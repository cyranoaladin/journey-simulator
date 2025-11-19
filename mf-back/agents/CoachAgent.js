const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function CoachAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Coaching';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'coaching de mission';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('CoachAgent', {
    phase,
    intent,
    objective,
    prompt: `Analyser la progression utilisateur pour "${objective}"`,
    reasoning:
      'Compare les scores AEPO/AECO et les retours precedents pour suggerer un plan de coaching cible.',
    action: 'Planifier une session de coaching et suivre la liste de micro-objectifs proposes.',
    summary: 'Resume genere pour CoachAgent',
    outcome: 'Feuille de route de coaching ajustee',
    payload: {
      output: 'Suivi personnalise genere',
      nextSteps: ['Rappel des objectifs a atteindre'],
    },
    snippets,
    metrics: { confidence: 0.82, success: true, impact: 'medium' },
    user,
  });
};

