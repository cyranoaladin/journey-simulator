// Source of truth for journey → phase → agent intents mapping.
// This is intentionally simple and in-memory (no DB).

module.exports = {
  onboarding: {
    phases: {
      design: ['product_spec', 'ux_writing'],
      security: ['security_audit'],
    },
  },
  audit: {
    phases: {
      governance: ['governance_dao', 'compliance', 'risk_fraud'],
      tech: ['security_audit', 'api_contract'],
    },
  },
  certification: {
    phases: {
      tokenomics: ['tokenomics'],
      curriculum: ['curriculum'],
    },
  },
  product_launch: {
    phases: {
      discovery: ['product_spec'],
      design: ['ux_writing'],
      validation: ['security_audit'],
      execution: ['qa_playwright'],
    },
  },
  dao_readiness: {
    phases: {
      discovery: ['governance_dao'],
      validation: ['compliance'],
      audit: ['risk_fraud'],
    },
  },
  investor_fundraise: {
    phases: {
      discovery: ['investor_demo'],
      validation: ['risk_fraud'],
      execution: ['product_spec'],
    },
  },
};
