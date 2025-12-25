const registry = require('../agents/registry');

describe('Agent registry', () => {
  const expectedAgentIds = [
    'SecurityAuditAgent',
    'ProductSpecAgent',
    'JourneyDesignAgent',
    'EvaluationAgent',
    'RAGOpsAgent',
    'DataIntegrityAgent',
    'APIContractAgent',
    'TokenomicsAgent',
    'GovernanceDAOAgent',
    'GrowthAgent',
    'InvestorDemoAgent',
    'UXWritingAgent',
    'QAPlaywrightAgent',
    'DevOpsAgent',
    'ObservabilityAgent',
    'ComplianceAgent',
    'RiskFraudAgent',
    'CurriculumAgent',
    'MarketplaceAgent',
    'AnalyticsAgent',
    'PerformanceAgent',
    'WalletAuthAgent',
    'SolanaAnchorAgent',
    'MintingAgent',
  ];

  it('contains all expected agents with required fields', () => {
    expect(Array.isArray(registry)).toBe(true);
    expect(registry.map((a) => a.agentId)).toEqual(expectedAgentIds);

    for (const agent of registry) {
      expect(typeof agent.agentId).toBe('string');
      expect(typeof agent.domain).toBe('string');
      expect(Array.isArray(agent.capabilities)).toBe(true);
      expect(Array.isArray(agent.intents)).toBe(true);
      expect(typeof agent.confidenceWeight).toBe('number');
      expect(typeof agent.requiresRag).toBe('boolean');
      expect(typeof agent.maxTokens).toBe('number');
      expect(typeof agent.timeoutMs).toBe('number');
      expect(agent.inputSchema).toBeInstanceOf(Object);
      expect(agent.outputSchema).toBeInstanceOf(Object);
    }
  });

  it('orders agents by priority descending', () => {
    const priorities = registry.map((a) => a.priority);
    const sorted = [...priorities].sort((a, b) => b - a);
    expect(priorities).toEqual(sorted);
  });
});
