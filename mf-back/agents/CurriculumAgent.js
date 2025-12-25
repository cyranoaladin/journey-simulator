class CurriculumAgent {
  async run({ traceId }) {
    return {
      agentId: 'CurriculumAgent',
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

module.exports = CurriculumAgent;
