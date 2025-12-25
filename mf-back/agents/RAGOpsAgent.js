class RAGOpsAgent {
  async run({ traceId }) {
    return {
      agentId: 'RAGOpsAgent',
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

module.exports = RAGOpsAgent;
