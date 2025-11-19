const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function CommunityAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Community';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'strategie communaute';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('CommunityAgent', {
    phase,
    intent,
    objective,
    prompt: `Construire une strategie communautaire pour "${objective}"`,
    reasoning:
      'Analyse la cible et les canaux historiques pour proposer une feuille de route communautaire coherent.',
    action: 'Lancer les salons prioritaire et activer le programme ambassadeurs.',
    summary: 'Strategie communaute proposee',
    outcome: 'Structure Discord et moderation definies',
    payload: {
      output: 'Plan de community management pret',
      nextSteps: ['Ouverture des salons', 'Lancement ambassadeurs'],
    },
    snippets,
    metrics: { confidence: 0.83, success: true, impact: 'medium' },
    user,
  });
};

