const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function PitchAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Pitch';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'preparation pitch';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('PitchAgent', {
    phase,
    intent,
    objective,
    prompt: `Structurer un pitch pour "${objective}"`,
    reasoning:
      'Selectionne les arguments clefs et exemples marche pour articuler un pitch coherent en 10 slides.',
    action: 'Iterer sur le pitch draft et preparer une rehearsal avec CoachAgent.',
    summary: 'Pitch structure genere',
    outcome: 'Prototype de pitch pret a usage',
    payload: {
      output: 'Voici votre pitch deck : [draft]',
      nextSteps: ['Valider ou ameliorer le contenu'],
    },
    snippets,
    metrics: { confidence: 0.85, success: true, impact: 'medium' },
    user,
  });
};

