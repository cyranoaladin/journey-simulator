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
};
