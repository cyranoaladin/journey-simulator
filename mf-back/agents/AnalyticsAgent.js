class AnalyticsAgent {
  async run({ traceId }) {
    return {
      agentId: 'AnalyticsAgent',
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

module.exports = AnalyticsAgent;
