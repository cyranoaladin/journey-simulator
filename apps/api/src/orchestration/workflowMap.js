/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Workflow Map - Persona → Phase → Agent Mapping
 * Maps current frontend personas to Zyno agent intents
 */

module.exports = {
  'cognitive-activation-hub': {
    phases: {
      'cognitive-orientation': ['curriculum', 'ux_writing'],
      'solana-fluency': ['curriculum', 'product_spec'],
      'token-design-lab': ['tokenomics', 'governance_dao'],
      'identity-proofing': ['security_audit'],
      'ecosystem-engagement': ['governance_dao', 'curriculum'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
  'capital-foundry': {
    phases: {
      'capital-discovery': ['product_spec', 'investor_demo'],
      'program-forge': ['api_contract', 'qa_playwright'],
      'oracle-integration': ['api_contract', 'product_spec'],
      'risk-command': ['risk_fraud', 'governance_dao'],
      'capital-launchpad': ['investor_demo', 'governance_dao', 'tokenomics'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
  'system-architect': {
    phases: {
      'architecture-scan': ['product_spec', 'api_contract'],
      'infra-build': ['api_contract', 'security_audit'],
      'ai-integration': ['api_contract', 'product_spec'],
      'network-optimization': ['api_contract', 'qa_playwright'],
      'production-deploy': ['security_audit', 'governance_dao'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
  'experience-studio': {
    phases: {
      'ux-discovery': ['ux_writing', 'product_spec'],
      'design-system': ['ux_writing'],
      'interaction-lab': ['ux_writing', 'qa_playwright'],
      'accessibility-audit': ['security_audit', 'ux_writing'],
      'deployment-design': ['ux_writing', 'governance_dao'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
  'impact-engine': {
    phases: {
      'impact-mapping': ['governance_dao', 'product_spec'],
      'community-build': ['governance_dao', 'ux_writing'],
      'metrics-design': ['tokenomics', 'governance_dao'],
      'partnerships': ['investor_demo', 'governance_dao'],
      'scaling-strategy': ['governance_dao', 'investor_demo'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
  'resilience-master': {
    phases: {
      'risk-assessment': ['risk_fraud', 'security_audit'],
      'security-hardening': ['security_audit', 'api_contract'],
      'compliance-framework': ['compliance', 'governance_dao'],
      'incident-response': ['security_audit', 'risk_fraud'],
      'governance-resilience': ['governance_dao', 'compliance'],
      'launch-collaterize': ['investor_demo', 'product_spec'],
    },
  },
};
