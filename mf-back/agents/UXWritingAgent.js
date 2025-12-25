class UXWritingAgent {
  async run({ traceId }) {
    return {
      agentId: 'UXWritingAgent',
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

module.exports = UXWritingAgent;
