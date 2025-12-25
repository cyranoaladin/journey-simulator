class DataIntegrityAgent {
  async run({ traceId }) {
    return {
      agentId: 'DataIntegrityAgent',
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

module.exports = DataIntegrityAgent;
