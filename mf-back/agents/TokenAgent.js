const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function TokenAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Token';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'modele tokenomics';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('TokenAgent', {
    phase,
    intent,
    objective,
    prompt: `Elaborer l'architecture tokenomics pour "${objective}"`,
    reasoning:
      'Compare les allocations, vesting et references de tokens similaires pour proposer un schema equitable.',
    action: 'Generer le smart contract SPL avec les parametres recommandes.',
    summary: 'Modele tokenomics genere',
    outcome: 'Architecture de jeton SPL prete a deployer',
    payload: {
      output: 'Distribution, vesting et utilite du token definis',
      nextSteps: ['Generation du smart contract SPL'],
    },
    snippets,
    metrics: { confidence: 0.9, success: true, impact: 'high' },
    user,
  });
};

