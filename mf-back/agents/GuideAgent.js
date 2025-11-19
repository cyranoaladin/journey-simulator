const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function GuideAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Guide';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'orientation parcours';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('GuideAgent', {
    phase,
    intent,
    objective,
    prompt: `Orienter l'utilisateur sur la mission "${objective}"`,
    reasoning:
      'Synthese les ressources essentielles afin de guider la prochaine action et reduire la charge cognitive.',
    action: 'Explorer les modules recommandes et valider la prochaine etape dans le parcours.',
    summary: 'Resume genere pour GuideAgent',
    outcome: 'Orientation utilisateur actualisee',
    payload: {
      output: 'Bienvenue dans votre parcours !',
      nextSteps: ['Exploration des modules recommandes'],
    },
    snippets,
    metrics: { confidence: 0.8, success: true, impact: 'medium' },
    user,
  });
};

