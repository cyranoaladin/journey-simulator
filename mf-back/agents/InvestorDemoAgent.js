class InvestorDemoAgent {
  async run({ traceId }) {
    return {
      agentId: 'InvestorDemoAgent',
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

module.exports = InvestorDemoAgent;
