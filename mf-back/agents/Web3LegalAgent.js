const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function Web3LegalAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Legal';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'conformite web3';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('Web3LegalAgent', {
    phase,
    intent,
    objective,
    prompt: `Evaluer les obligations legales pour "${objective}"`,
    reasoning:
      'Recense les cadres reglementaires par juridiction et identifie les obligations prioritaires.',
    action: 'Preparer une revue legale et appliquer les ajustements proposes.',
    summary: 'Analyse conformite generee',
    outcome: 'Ajustements reglementaires proposes',
    payload: {
      output: 'Voici vos obligations legales par zone geographique',
      nextSteps: ['Preparer un audit ou mise en conformite'],
    },
    snippets,
    metrics: { confidence: 0.8, success: true, impact: 'medium' },
    user,
  });
};

