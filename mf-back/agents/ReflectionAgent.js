const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function ReflectionAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Reflection';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'bilan de phase';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('ReflectionAgent', {
    phase,
    intent,
    objective,
    prompt: `Etablir un bilan de progression pour "${objective}"`,
    reasoning:
      'Synthetise les scores AEPO/AECO, livrables et feedbacks pour orienter la prochaine decision.',
    action: 'Valider les recommandations et planifier la prochaine phase ou consolidation.',
    summary: 'Bilan detape genere',
    outcome: 'Auto-evaluation et suggestions pour continuer',
    payload: {
      output: 'Voici votre evaluation AEPO/AECO a ce stade',
      nextSteps: ['Consolider vos acquis', 'Passer a la prochaine phase'],
    },
    snippets,
    metrics: { confidence: 0.9, success: true, impact: 'medium' },
    user,
  });
};

