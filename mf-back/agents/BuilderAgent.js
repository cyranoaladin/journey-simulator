const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function BuilderAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'anonymous' };
  const phase = agentInput.phase || context.phase || 'Build';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'prototype web3';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('BuilderAgent', {
    phase,
    intent,
    objective,
    prompt: `Elaborer un plan de construction pour "${objective}"`,
    reasoning:
      'Croise les references techniques et les contraintes de mission pour definir les sprints critiques du MVP.',
    action: 'Valider le backlog propose et assigner un owner par lot critique.',
    summary: 'Plan de construction genere',
    outcome: 'Architecture technique validee',
    payload: {
      sprintBacklog: [
        'Configurer les environnements et comptes developpeur',
        'Initialiser le depot et la CI/CD',
        'Developper le smart contract principal',
        'Preparer les scenarios de tests et audits',
      ],
      recommendedStack: ['Solana', 'Anchor', 'TypeScript', 'Jest'],
    },
    snippets,
    metrics: { confidence: 0.92, success: true, impact: 'high' },
    user,
  });
};
