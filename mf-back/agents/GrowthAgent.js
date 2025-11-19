const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function GrowthAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Growth';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'plan de traction';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('GrowthAgent', {
    phase,
    intent,
    objective,
    prompt: `Tracer une strategie d'acquisition pour "${objective}"`,
    reasoning:
      'Analyse les benchmarks de croissance et les audiences RAG pour definir les canaux a plus fort effet levier.',
    action: 'Lancer la campagne pilote et suivre les indicateurs clefs proposes.',
    summary: 'Strategie de traction generee',
    outcome: 'Campagne acquisition planifiee',
    payload: {
      output: 'Canaux acquisition et metriques proposes',
      nextSteps: ['Lancement de campagne Twitter / Discord'],
    },
    snippets,
    metrics: { confidence: 0.86, success: true, impact: 'medium' },
    user,
  });
};

