class JourneyDesignAgent {
  async run({ traceId }) {
    return {
      agentId: 'JourneyDesignAgent',
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

module.exports = JourneyDesignAgent;
