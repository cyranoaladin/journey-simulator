class MarketplaceAgent {
  async run({ traceId }) {
    return {
      agentId: 'MarketplaceAgent',
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

module.exports = MarketplaceAgent;
