class MintingAgent {
  async run({ traceId }) {
    return {
      agentId: 'MintingAgent',
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

module.exports = MintingAgent;
