class PerformanceAgent {
  async run({ traceId }) {
    return {
      agentId: 'PerformanceAgent',
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

module.exports = PerformanceAgent;
