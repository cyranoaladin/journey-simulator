/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const registry = require('../agents/registry');

const FALLBACK_INTENT = 'product.spec';
const FALLBACK_AGENT_ID = 'ProductSpecAgent';

const normalizeToken = (token = '') =>
  token
    .toLowerCase()
    .replace(/\./g, '_')
    .replace(/\s+/g, '') // Regex for whitespace replacement
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

function selectAgentsForIntents(intents = [], strict = false) {
  const matches = new Map();

  const wanted = intents.length > 0 ? intents : (strict ? [] : [FALLBACK_INTENT]);

  for (const intent of wanted) {
    let intentMatched = false;
    for (const agent of registry.filter((a) => a.enabled !== false)) {
      if (agent.intents.includes(intent)) {
        matches.set(agent.agentId, agent);
        intentMatched = true;
      }
    }
    if (!intentMatched && !strict) {
      const fallback = registry.find((a) => a.agentId === FALLBACK_AGENT_ID);
      if (fallback) {
        matches.set(fallback.agentId, fallback);
      }
    }
  }

  if (matches.size === 0 && !strict) {
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

function routeIntent({ intent, input, context, strict = false }) {
  const intents = normalizeIntents(intent);
  const selected = selectAgentsForIntents(intents, strict);
  let intentNormalized = intents.length > 0 ? intents.join('+') : (strict ? null : normalizeToken(FALLBACK_INTENT));

  // Strictly enforce snake_case normalization (User Request)
  if (intentNormalized) {
    intentNormalized = intentNormalized.replace(/\./g, '_');
  }

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
