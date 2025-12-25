class ComplianceAgent {
  async run({ traceId }) {
    return {
      agentId: 'ComplianceAgent',
      status: 'WARN',
      summary: 'Not implemented yet',
      actions: [],
      citations: [],
      metrics: { latencyMs: 0 },
      errors: [],
      traceId,
    };
  }
}

module.exports = ComplianceAgent;
