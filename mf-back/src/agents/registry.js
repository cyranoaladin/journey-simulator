/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const base = {
  toolsAllowed: [],
  llmProfile: { model: process.env.LLM_MODEL_NAME || 'gpt-4o', temperature: 0.2 },
  ragProfile: { topK: 4 },
  inputSchema: { type: 'object', required: ['input'] },
  outputSchema: { type: 'object', required: ['summary'] },
  confidenceWeight: 1.0,
  requiresRag: false,
  maxTokens: 600,
  timeoutMs: 6000,
  enabled: true,
};

const coreAgents = [
  { agentId: 'SecurityAuditAgent', domain: 'security', capabilities: ['audit', 'risk', 'compliance'], intents: ['security_audit', 'default'], requiresRag: true, priority: 95, enabled: true },
  { agentId: 'ProductSpecAgent', domain: 'product', capabilities: ['spec', 'flows', 'acceptance'], intents: ['product_spec', 'default'], requiresRag: true, priority: 90, enabled: true },
  { agentId: 'ProductAgent', domain: 'product', capabilities: ['discovery', 'strategy'], intents: ['product'], requiresRag: true, priority: 89, enabled: true },
  { agentId: 'JourneyDesignAgent', domain: 'journey', capabilities: ['design', 'mapping'], intents: ['journey_design'], requiresRag: true, priority: 88, enabled: true },
  { agentId: 'EvaluationAgent', domain: 'quality', capabilities: ['evaluation', 'rubric'], intents: ['evaluation'], requiresRag: true, priority: 87, enabled: true },
  { agentId: 'RAGOpsAgent', domain: 'rag', capabilities: ['ingest', 'search'], intents: ['rag_ops'], requiresRag: false, priority: 86, enabled: true },
  { agentId: 'DataIntegrityAgent', domain: 'data', capabilities: ['integrity', 'validation'], intents: ['data_integrity'], requiresRag: true, priority: 85, enabled: true },
  { agentId: 'OnboardingAgent', domain: 'ux', capabilities: ['onboarding', 'flows'], intents: ['onboarding'], requiresRag: true, priority: 85, enabled: true },
  { agentId: 'APIContractAgent', domain: 'api', capabilities: ['contracts', 'schemas'], intents: ['api_contract'], requiresRag: true, priority: 84, enabled: true },
  { agentId: 'TokenAgent', domain: 'tokenomics', capabilities: ['utility', 'mapping'], intents: ['token_design'], requiresRag: true, priority: 84, enabled: true },
  { agentId: 'TokenomicsAgent', domain: 'tokenomics', capabilities: ['economy', 'supply'], intents: ['tokenomics'], requiresRag: true, priority: 83, enabled: true },
  { agentId: 'GovernanceDAOAgent', domain: 'governance', capabilities: ['dao', 'voting'], intents: ['governance_dao'], requiresRag: true, priority: 82, enabled: true },
  { agentId: 'PitchAgent', domain: 'investor', capabilities: ['pitch', 'deck'], intents: ['pitch'], requiresRag: true, priority: 82, enabled: true },
  { agentId: 'GrowthAgent', domain: 'growth', capabilities: ['growth', 'marketing'], intents: ['growth'], requiresRag: true, priority: 81, enabled: true },
  { agentId: 'GovernanceAgent', domain: 'governance', capabilities: ['strategy', 'policy'], intents: ['governance'], requiresRag: true, priority: 81, enabled: true },
  { agentId: 'InvestorDemoAgent', domain: 'investor', capabilities: ['demo', 'pitch'], intents: ['investor_demo'], requiresRag: true, priority: 80, enabled: true },
  { agentId: 'CommunityAgent', domain: 'growth', capabilities: ['community', 'engagement'], intents: ['community'], requiresRag: true, priority: 80, enabled: true },
  { agentId: 'InvestorAgent', domain: 'investor', capabilities: ['fundraise', 'pitch'], intents: ['investor_fundraise'], requiresRag: true, priority: 79, enabled: true },
  { agentId: 'UXWritingAgent', domain: 'ux', capabilities: ['ux_writing'], intents: ['ux_writing'], requiresRag: true, priority: 79, enabled: true },
  { agentId: 'QAPlaywrightAgent', domain: 'qa', capabilities: ['e2e', 'playwright'], intents: ['qa_playwright'], requiresRag: true, priority: 78, enabled: true },
  { agentId: 'LaunchpadAgent', domain: 'investor', capabilities: ['incubation', 'launch'], intents: ['launchpad'], requiresRag: true, priority: 78, enabled: true },
  { agentId: 'DevOpsAgent', domain: 'devops', capabilities: ['ci_cd', 'infra'], intents: ['devops'], requiresRag: true, priority: 77, enabled: true },
  { agentId: 'ObservabilityAgent', domain: 'observability', capabilities: ['logs', 'metrics', 'tracing'], intents: ['observability'], requiresRag: true, priority: 76, enabled: true },
  { agentId: 'ComplianceAgent', domain: 'compliance', capabilities: ['policy', 'regulation'], intents: ['compliance'], requiresRag: true, priority: 75, enabled: true },
  { agentId: 'RiskFraudAgent', domain: 'risk', capabilities: ['fraud', 'risk'], intents: ['risk_fraud'], requiresRag: true, priority: 74, enabled: true },
  { agentId: 'CurriculumAgent', domain: 'education', capabilities: ['curriculum', 'learning_path'], intents: ['curriculum'], requiresRag: true, priority: 73, enabled: true },
  { agentId: 'MarketplaceAgent', domain: 'marketplace', capabilities: ['listing', 'pricing'], intents: ['marketplace'], requiresRag: true, priority: 72, enabled: true },
  { agentId: 'AnalyticsAgent', domain: 'analytics', capabilities: ['analytics', 'insights'], intents: ['analytics'], requiresRag: true, priority: 71, enabled: true },
  { agentId: 'PerformanceAgent', domain: 'performance', capabilities: ['perf', 'optimization'], intents: ['performance'], requiresRag: true, priority: 70, enabled: true },
  { agentId: 'WalletAuthAgent', domain: 'auth', capabilities: ['wallet', 'auth'], intents: ['wallet_auth'], requiresRag: true, priority: 69, enabled: true },
  { agentId: 'SolanaAnchorAgent', domain: 'blockchain', capabilities: ['anchor', 'solana'], intents: ['solana_anchor'], requiresRag: true, priority: 68, enabled: true },
  { agentId: 'MintingAgent', domain: 'mint', capabilities: ['mint', 'nft'], intents: ['minting'], requiresRag: true, priority: 67, enabled: true },
];

const extendedAgents = require('./extended/registry-extra');
const loadExtended = process.env.CORE_ONLY !== 'true';
const selectedAgents = loadExtended ? [...coreAgents, ...extendedAgents] : coreAgents;

module.exports = selectedAgents.map((a) => ({
  ...base,
  ...a,
  defaultModel: a.defaultModel || base.llmProfile.model,
  inputSchema: a.inputSchema || base.inputSchema,
  outputSchema: a.outputSchema || base.outputSchema,
})).sort((a, b) => b.priority - a.priority);
