class WalletAuthAgent {
  async run({ traceId }) {
    return {
      agentId: 'WalletAuthAgent',
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

module.exports = WalletAuthAgent;
