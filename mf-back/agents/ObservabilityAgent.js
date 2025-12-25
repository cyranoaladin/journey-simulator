class ObservabilityAgent {
  async run({ traceId }) {
    return {
      agentId: 'ObservabilityAgent',
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

module.exports = ObservabilityAgent;
