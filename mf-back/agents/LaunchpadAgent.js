const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function LaunchpadAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Launchpad';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'plan de lancement';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('LaunchpadAgent', {
    phase,
    intent,
    objective,
    prompt: `Preparer la campagne de lancement pour "${objective}"`,
    reasoning:
      'Analyse les checklists launchpad recensees pour s\'assurer que la campagne couvre la token sale et le marketing.',
    action: 'Verifier les pre-requis KYC et planifier le calendrier TGE propose.',
    summary: 'Preparation de la campagne de lancement',
    outcome: 'Checklist launchpad complete generee',
    payload: {
      output: 'Checklist de lancement complete avec jalons',
      nextSteps: ['Choix d\'un launchpad Solana', 'Preparation au TGE'],
    },
    snippets,
    metrics: { confidence: 0.87, success: true, impact: 'high' },
    user,
  });
};

