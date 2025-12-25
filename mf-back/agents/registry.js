const base = {
  toolsAllowed: [],
  llmProfile: { model: 'gpt-4o', temperature: 0.2 },
  ragProfile: { topK: 4 },
  inputSchema: { type: 'object', required: ['input'] },
  outputSchema: { type: 'object', required: ['summary'] },
  confidenceWeight: 1.0,
  requiresRag: false,
  maxTokens: 600,
  timeoutMs: 6000,
  enabled: true,
};

const agents = [
  { agentId: 'SecurityAuditAgent', domain: 'security', capabilities: ['audit', 'risk', 'compliance'], intents: ['security_audit', 'default'], requiresRag: true, priority: 95, enabled: true },
  { agentId: 'ProductSpecAgent', domain: 'product', capabilities: ['spec', 'flows', 'acceptance'], intents: ['product_spec', 'default'], requiresRag: true, priority: 90, enabled: true },
  { agentId: 'JourneyDesignAgent', domain: 'journey', capabilities: ['design', 'mapping'], intents: ['journey_design'], requiresRag: false, priority: 88, enabled: true },
  { agentId: 'EvaluationAgent', domain: 'quality', capabilities: ['evaluation', 'rubric'], intents: ['evaluation'], requiresRag: false, priority: 87, enabled: true },
  { agentId: 'RAGOpsAgent', domain: 'rag', capabilities: ['ingest', 'search'], intents: ['rag_ops'], requiresRag: false, priority: 86, enabled: true },
  { agentId: 'DataIntegrityAgent', domain: 'data', capabilities: ['integrity', 'validation'], intents: ['data_integrity'], requiresRag: false, priority: 85, enabled: true },
  { agentId: 'APIContractAgent', domain: 'api', capabilities: ['contracts', 'schemas'], intents: ['api_contract'], requiresRag: false, priority: 84, enabled: true },
  { agentId: 'TokenomicsAgent', domain: 'tokenomics', capabilities: ['economy', 'supply'], intents: ['tokenomics'], requiresRag: false, priority: 83, enabled: true },
  { agentId: 'GovernanceDAOAgent', domain: 'governance', capabilities: ['dao', 'voting'], intents: ['governance_dao'], requiresRag: true, priority: 82, enabled: true },
  { agentId: 'GrowthAgent', domain: 'growth', capabilities: ['growth', 'marketing'], intents: ['growth'], requiresRag: false, priority: 81, enabled: true },
  { agentId: 'InvestorDemoAgent', domain: 'investor', capabilities: ['demo', 'pitch'], intents: ['investor_demo'], requiresRag: false, priority: 80, enabled: true },
  { agentId: 'UXWritingAgent', domain: 'ux', capabilities: ['ux_writing'], intents: ['ux_writing'], requiresRag: true, priority: 79, enabled: true },
  { agentId: 'QAPlaywrightAgent', domain: 'qa', capabilities: ['e2e', 'playwright'], intents: ['qa_playwright'], requiresRag: false, priority: 78, enabled: true },
  { agentId: 'DevOpsAgent', domain: 'devops', capabilities: ['ci_cd', 'infra'], intents: ['devops'], requiresRag: false, priority: 77, enabled: true },
  { agentId: 'ObservabilityAgent', domain: 'observability', capabilities: ['logs', 'metrics', 'tracing'], intents: ['observability'], requiresRag: false, priority: 76, enabled: true },
  { agentId: 'ComplianceAgent', domain: 'compliance', capabilities: ['policy', 'regulation'], intents: ['compliance'], requiresRag: true, priority: 75, enabled: true },
  { agentId: 'RiskFraudAgent', domain: 'risk', capabilities: ['fraud', 'risk'], intents: ['risk_fraud'], requiresRag: true, priority: 74, enabled: false }, // disabled by default for progressive rollout
  { agentId: 'CurriculumAgent', domain: 'education', capabilities: ['curriculum', 'learning_path'], intents: ['curriculum'], requiresRag: false, priority: 73, enabled: true },
  { agentId: 'MarketplaceAgent', domain: 'marketplace', capabilities: ['listing', 'pricing'], intents: ['marketplace'], requiresRag: false, priority: 72, enabled: true },
  { agentId: 'AnalyticsAgent', domain: 'analytics', capabilities: ['analytics', 'insights'], intents: ['analytics'], requiresRag: false, priority: 71, enabled: true },
  { agentId: 'PerformanceAgent', domain: 'performance', capabilities: ['perf', 'optimization'], intents: ['performance'], requiresRag: false, priority: 70, enabled: true },
  { agentId: 'WalletAuthAgent', domain: 'auth', capabilities: ['wallet', 'auth'], intents: ['wallet_auth'], requiresRag: false, priority: 69, enabled: true },
  { agentId: 'SolanaAnchorAgent', domain: 'blockchain', capabilities: ['anchor', 'solana'], intents: ['solana_anchor'], requiresRag: false, priority: 68, enabled: true },
  { agentId: 'MintingAgent', domain: 'mint', capabilities: ['mint', 'nft'], intents: ['minting'], requiresRag: false, priority: 67, enabled: true },
];

module.exports = agents.map((a) => ({
  ...base,
  ...a,
  defaultModel: a.defaultModel || base.llmProfile.model,
  inputSchema: a.inputSchema || base.inputSchema,
  outputSchema: a.outputSchema || base.outputSchema,
}));
