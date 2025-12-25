const registry = require('../agents/registry');

const FALLBACK_INTENT = 'product.spec';
const FALLBACK_AGENT_ID = 'ProductSpecAgent';

const normalizeToken = (token = '') =>
  token
    .toLowerCase()
    .replace(/\./g, '_')
    .replace(/\s+/g, '')
    .trim();

function normalizeIntents(intent) {
  if (Array.isArray(intent)) {
    return intent
      .flatMap((i) => (typeof i === 'string' ? i.split('+') : []))
      .map(normalizeToken)
      .filter(Boolean);
  }
  if (typeof intent === 'string') {
    return intent
      .split('+')
      .map(normalizeToken)
      .filter(Boolean);
  }
  return [];
}

function selectAgentsForIntents(intents = []) {
  const matches = new Map();

  const wanted = intents.length > 0 ? intents : [FALLBACK_INTENT];

  for (const intent of wanted) {
    let intentMatched = false;
    for (const agent of registry.filter((a) => a.enabled !== false)) {
      if (agent.intents.includes(intent)) {
        matches.set(agent.agentId, agent);
        intentMatched = true;
      }
    }
    if (!intentMatched) {
      const fallback = registry.find((a) => a.agentId === FALLBACK_AGENT_ID);
      if (fallback) {
        matches.set(fallback.agentId, fallback);
      }
    }
  }

  if (matches.size === 0) {
    const fallback = registry.find((a) => a.agentId === FALLBACK_AGENT_ID);
    if (fallback) {
      matches.set(fallback.agentId, fallback);
    }
  }

  return Array.from(matches.values()).sort((a, b) => {
    if (b.priority !== a.priority) return (b.priority || 0) - (a.priority || 0);
    return (b.confidenceWeight || 0) - (a.confidenceWeight || 0);
  });
}

function routeIntent({ intent, input, context }) {
  const intents = normalizeIntents(intent);
  const selected = selectAgentsForIntents(intents);
  const intentNormalized = intents.length > 0 ? intents.join('+') : normalizeToken(FALLBACK_INTENT);

  return {
    intentNormalized,
    selectedAgents: selected.map((a) => ({
      agentId: a.agentId,
      priority: a.priority,
      confidenceWeight: a.confidenceWeight,
    })),
    context,
  };
}

module.exports = {
  normalizeIntents,
  selectAgentsForIntents,
  routeIntent,
};
