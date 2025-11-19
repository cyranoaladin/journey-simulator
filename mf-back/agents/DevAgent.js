const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function DevAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Dev';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'plan de developpement';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('DevAgent', {
    phase,
    intent,
    objective,
    prompt: `Definir la mise en oeuvre technique pour "${objective}"`,
    reasoning:
      'Inspecte les meilleures pratiques stack et les contraintes produits pour articuler les modules techniques.',
    action: 'Initialiser le depot avec la stack proposee et lancer la mise en place CI/CD.',
    summary: 'Developpement technique amorce',
    outcome: 'Modules et endpoints API proposes',
    payload: {
      output: 'Stack technique validee et depot initialise',
      nextSteps: ['Implementation des modules cles', 'Mise en place CI/CD'],
    },
    snippets,
    metrics: { confidence: 0.9, success: true, impact: 'high' },
    user,
  });
};

