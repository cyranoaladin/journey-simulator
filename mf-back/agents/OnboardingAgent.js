const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function OnboardingAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Onboarding';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'accueil utilisateur';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('OnboardingAgent', {
    phase,
    intent,
    objective,
    prompt: `Analyser le profil utilisateur pour "${objective}"`,
    reasoning:
      'Recueille les signaux demographiques et parcours passes pour recommander une configuration personnalisee.',
    action: 'Suivre les etapes de configuration proposees et valider la connexion wallet.',
    summary: 'Profil utilisateur initial analyse',
    outcome: 'Setup personnalise recommande',
    payload: {
      output: 'Bienvenue ! Voici vos prochaines etapes personnalisees',
      nextSteps: ['Choisir un parcours', 'Configurer votre wallet Phantom'],
    },
    snippets,
    metrics: { confidence: 0.78, success: true, impact: 'medium' },
    user,
  });
};

