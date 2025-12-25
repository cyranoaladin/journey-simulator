const registry = require('../agents/registry');

function selectAgents(intent = 'default') {
  const matches = registry
    .filter((agent) => agent.intents.includes(intent) || agent.intents.includes('default'))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return matches;
}

function routeIntent({ intent = 'default', input, context }) {
  const agents = selectAgents(intent);
  return {
    intent,
    agents,
    context,
  };
}

module.exports = {
  selectAgents,
  routeIntent,
};
