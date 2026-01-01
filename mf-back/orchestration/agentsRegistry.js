module.exports = {
  // Cognitive Hub
  GuideAgent: require('../agents/GuideAgent'),
  CoachAgent: require('../agents/CoachAgent'),
  EducationAgent: require('../agents/EducationAgent'),
  ReflectionAgent: require('../agents/ReflectionAgent'),

  // System Architect Cluster
  BuilderAgent: require('../agents/BuilderAgent'),
  ProtocolAgent: require('../agents/ProtocolAgent'),
  DevAgent: require('../agents/DevAgent'),
  SolanaAnchorAgent: require('../agents/SolanaAnchorAgent'),
  AuditAgent: require('../agents/AuditAgent'),
  SecurityAgent: require('../agents/SecurityAgent'),
  SecurityAuditAgent: require('../agents/SecurityAuditAgent'), // Legacy/Alias?

  // Experience & Growth Cluster
  NFTAgent: require('../agents/NFTAgent'),
  GrowthAgent: require('../agents/GrowthAgent'),
  DesignAgent: require('../agents/DesignAgent'),
  DAOAgent: require('../agents/DAOAgent'),
  GovernanceDAOAgent: require('../agents/GovernanceDAOAgent'),
  MarketplaceAgent: require('../agents/MarketplaceAgent'),
  MintingAgent: require('../agents/MintingAgent'),
  CommunityAgent: require('../agents/CommunityAgent'),
  AnalyticsAgent: require('../agents/AnalyticsAgent'),

  // Resilience & Capital
  TokenomicsAgent: require('../agents/TokenomicsAgent'),
  InvestorAgent: require('../agents/InvestorAgent'),
  ComplianceAgent: require('../agents/ComplianceAgent'),
  Web3LegalAgent: require('../agents/Web3LegalAgent'),

  // Design/Legacy
  PitchAgent: require('../agents/PitchAgent'),
  TokenAgent: require('../agents/TokenomicsAgent'), // Updated validation: Mapped to new Refactored Agent
  ProductSpecAgent: require('../agents/ProductSpecAgent'),
  LaunchpadAgent: require('../agents/LaunchpadAgent'),
  ProductAgent: require('../agents/ProductAgent'),
  OnboardingAgent: require('../agents/OnboardingAgent')
};
