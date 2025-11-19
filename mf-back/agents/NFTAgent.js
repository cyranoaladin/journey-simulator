const { getRagSnippets } = require('../rag/ragClient');
const { createAgentResponse } = require('./telemetryUtils');

module.exports = async function NFTAgent(agentInput = {}, context = {}) {
  const user = agentInput.user || context.user || { id: 'demo_user' };
  const phase = agentInput.phase || context.phase || 'NFT';
  const intent = context.intent || agentInput.intent || null;
  const objective =
    agentInput.objective || context.objective || agentInput.input || context.input || 'lancement collection NFT';

  const snippets = await getRagSnippets({ query: objective, userContext: user });

  return createAgentResponse('NFTAgent', {
    phase,
    intent,
    objective,
    prompt: `Concevoir un modele NFT pour "${objective}"`,
    reasoning:
      'Etudie les collections similaires et les retours RAG pour suggere un positionnement et une structure de metadata.',
    action: 'Preparer les assets graphiques et configurer la metadata selon le schema propose.',
    summary: 'Modele NFT genere',
    outcome: 'Proposition de collection',
    payload: {
      output: 'Prototype NFT pret a mint',
      nextSteps: ['Uploader les assets', 'Configurer la metadata'],
    },
    snippets,
    metrics: { confidence: 0.85, success: true, impact: 'medium' },
    user,
  });
};

