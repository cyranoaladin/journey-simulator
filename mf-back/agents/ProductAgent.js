const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function ProductAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Product';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'roadmap produit';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('ProductAgent', {
    phase,
    intent,
    objective,
    prompt: `Concevoir une feuille de route produit pour "${objective}"`,
    reasoning:
      'Croise feedback utilisateurs et benchmarks pour ordonner les fonctionnalites prioritaires.',
    action: 'Programmer les tests utilisateurs et ajuster la maquette selon la roadmap proposee.',
    summary: 'Feuille de route produit creee',
    outcome: 'Maquette fonctionnelle alignee sur le besoin utilisateur',
    payload: {
      output: 'Roadmap produit generee avec features cles',
      nextSteps: ['Tests utilisateurs', 'Amelioration UX/UI'],
    },
    snippets,
    metrics: { confidence: 0.77, success: true, impact: 'medium' },
    user,
  });
};

