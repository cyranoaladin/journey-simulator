const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function InvestorAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'Invest';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'recherche investisseurs';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('InvestorAgent', {
    phase,
    intent,
    objective,
    prompt: `Identifier les investisseurs pertinents pour "${objective}"`,
    reasoning:
      'Croise maturite du projet, theses web3 et deals recents pour proposer des cibles prioritaires.',
    action: 'Contacter les fonds recommandes et joindre le pitch deck adapte.',
    summary: 'Liste dinvestisseurs strategiques proposee',
    outcome: 'Preparation au pitch investisseur reussie',
    payload: {
      output: 'Liste VCs, angels et fonds cibles generee',
      nextSteps: ['Prise de contact', 'Envoi de pitch decks'],
    },
    snippets,
    metrics: { confidence: 0.81, success: true, impact: 'medium' },
    user,
  });
};

