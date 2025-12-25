class APIContractAgent {
  async run({ traceId }) {
    return {
      agentId: 'APIContractAgent',
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

module.exports = APIContractAgent;
