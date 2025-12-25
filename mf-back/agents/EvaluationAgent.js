class EvaluationAgent {
  async run({ traceId }) {
    return {
      agentId: 'EvaluationAgent',
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

module.exports = EvaluationAgent;
