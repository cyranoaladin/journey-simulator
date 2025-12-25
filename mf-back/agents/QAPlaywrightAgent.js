class QAPlaywrightAgent {
  async run({ traceId }) {
    return {
      agentId: 'QAPlaywrightAgent',
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

module.exports = QAPlaywrightAgent;
