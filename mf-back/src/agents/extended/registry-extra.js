/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * Extended agents (au-dela du Core 17). Charges uniquement hors test.
 */
module.exports = [
  { agentId: 'RiskFraudAgent', domain: 'risk', capabilities: ['fraud', 'risk'], intents: ['risk_fraud'], requiresRag: true, priority: 74, enabled: true },
  { agentId: 'CurriculumAgent', domain: 'education', capabilities: ['curriculum', 'learning_path'], intents: ['curriculum'], requiresRag: true, priority: 73, enabled: true },
  { agentId: 'MarketplaceAgent', domain: 'marketplace', capabilities: ['listing', 'pricing'], intents: ['marketplace'], requiresRag: true, priority: 72, enabled: true },
  { agentId: 'AnalyticsAgent', domain: 'analytics', capabilities: ['analytics', 'insights'], intents: ['analytics'], requiresRag: true, priority: 71, enabled: true },
  { agentId: 'PerformanceAgent', domain: 'performance', capabilities: ['perf', 'optimization'], intents: ['performance'], requiresRag: true, priority: 70, enabled: true },
  { agentId: 'WalletAuthAgent', domain: 'auth', capabilities: ['wallet', 'auth'], intents: ['wallet_auth'], requiresRag: true, priority: 69, enabled: true },
  { agentId: 'SolanaAnchorAgent', domain: 'blockchain', capabilities: ['anchor', 'solana'], intents: ['solana_anchor'], requiresRag: true, priority: 68, enabled: true },
  { agentId: 'MintingAgent', domain: 'mint', capabilities: ['mint', 'nft'], intents: ['minting'], requiresRag: true, priority: 67, enabled: true },
  { agentId: 'CommunityAgent', domain: 'growth', capabilities: ['community', 'engagement'], intents: ['community'], requiresRag: true, priority: 80, enabled: true },
  { agentId: 'GovernanceAgent', domain: 'governance', capabilities: ['strategy', 'policy'], intents: ['governance'], requiresRag: true, priority: 81, enabled: true },
  { agentId: 'LaunchpadAgent', domain: 'investor', capabilities: ['incubation', 'launch'], intents: ['launchpad'], requiresRag: true, priority: 78, enabled: true },
  { agentId: 'OnboardingAgent', domain: 'ux', capabilities: ['onboarding', 'flows'], intents: ['onboarding'], requiresRag: true, priority: 85, enabled: true },
  { agentId: 'PitchAgent', domain: 'investor', capabilities: ['pitch', 'deck'], intents: ['pitch'], requiresRag: true, priority: 82, enabled: true },
  { agentId: 'ProductAgent', domain: 'product', capabilities: ['discovery', 'strategy'], intents: ['product'], requiresRag: true, priority: 89, enabled: true },
  { agentId: 'TokenAgent', domain: 'tokenomics', capabilities: ['utility', 'mapping'], intents: ['token_design'], requiresRag: true, priority: 84, enabled: true },
  { agentId: 'BuilderAgent', domain: 'architecture', capabilities: ['system_design', 'stack'], intents: ['builder', 'architecture'], requiresRag: true, priority: 89, enabled: true },
  { agentId: 'ProtocolAgent', domain: 'protocol', capabilities: ['standards', 'token_2022'], intents: ['protocol', 'standards'], requiresRag: true, priority: 88, enabled: true },
  { agentId: 'DevAgent', domain: 'development', capabilities: ['code', 'implementation'], intents: ['dev', 'code'], requiresRag: true, priority: 88, enabled: true },
  { agentId: 'DesignAgent', domain: 'design', capabilities: ['visuals', 'ux'], intents: ['design', 'visuals'], requiresRag: true, priority: 85, enabled: true },
  { agentId: 'NFTAgent', domain: 'nft', capabilities: ['metadata', 'strategy'], intents: ['nft_design'], requiresRag: true, priority: 84, enabled: true },
  { agentId: 'DAOAgent', domain: 'dao', capabilities: ['tooling', 'structure'], intents: ['dao_tooling'], requiresRag: true, priority: 84, enabled: true },
  { agentId: 'GuideAgent', domain: 'cognitive', capabilities: ['orientation', 'help'], intents: ['guide', 'help'], requiresRag: true, priority: 99, enabled: true },
  { agentId: 'EducationAgent', domain: 'cognitive', capabilities: ['teaching', 'explaining'], intents: ['education', 'explain'], requiresRag: true, priority: 98, enabled: true },
  { agentId: 'ReflectionAgent', domain: 'cognitive', capabilities: ['analysis', 'meta'], intents: ['reflection'], requiresRag: true, priority: 97, enabled: true },
  { agentId: 'CoachAgent', domain: 'cognitive', capabilities: ['strategy', 'advice'], intents: ['coach'], requiresRag: true, priority: 96, enabled: true },
  { agentId: 'Web3LegalAgent', domain: 'legal', capabilities: ['legal', 'mica'], intents: ['legal'], requiresRag: true, priority: 83, enabled: true },
  { agentId: 'AuditAgent', domain: 'audit', capabilities: ['code_quality', 'security'], intents: ['audit'], requiresRag: true, priority: 94, enabled: true },
  { agentId: 'SecurityAgent', domain: 'security', capabilities: ['red_team', 'exploits'], intents: ['security_attack'], requiresRag: true, priority: 94, enabled: true },
];
