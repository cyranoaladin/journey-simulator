class SolanaAnchorAgent {
  async run({ traceId }) {
    return {
      agentId: 'SolanaAnchorAgent',
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

module.exports = SolanaAnchorAgent;
