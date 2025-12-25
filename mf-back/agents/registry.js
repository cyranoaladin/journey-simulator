module.exports = [
  {
    agentId: 'SecurityAuditAgent',
    domain: 'security',
    intents: ['security_audit', 'default'],
    toolsAllowed: [],
    llmProfile: { model: 'gpt-4o', temperature: 0.2 },
    ragProfile: { topK: 4 },
    timeoutMs: 6000,
    priority: 90,
  },
  {
    agentId: 'ProductSpecAgent',
    domain: 'product',
    intents: ['product_spec', 'default'],
    toolsAllowed: [],
    llmProfile: { model: 'gpt-4o', temperature: 0.2 },
    ragProfile: { topK: 4 },
    timeoutMs: 6000,
    priority: 80,
  },
  // Legacy agents can be added here incrementally with their intent mapping.
];
