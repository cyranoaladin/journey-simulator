class EvaluationAgent {
  constructor() {
    this.id = 'EvaluationAgent';
  }

  async run(request = {}) {
    const started = Date.now();
    try {
      const { traceId, intentNormalized, input = '', journey = {} } = request;
      const journeyType = journey?.journeyType || 'generic';
      const phaseId = journey?.phaseId || journey?.phases?.[0] || 'unspecified';
      const objectives = journey?.objectives || [];
      const artifacts = journey?.artifacts || [];
      const hasInput = Boolean(input && input.trim());

      const rubric = [
        { criterion: 'Clarity', weight: 0.3 },
        { criterion: 'Feasibility', weight: 0.3 },
        { criterion: 'Risk', weight: 0.2 },
        { criterion: 'User impact', weight: 0.2 },
      ];

      const summary = hasInput ? 'Evaluation rubric scored' : 'Evaluation rubric drafted';

      const details = {
        intent: intentNormalized || 'evaluation',
        journeyType,
        phaseId,
        objectives,
        artifacts,
        rubric,
        notes: hasInput ? input.slice(0, 200) : 'No input provided',
      };

      const actions = [
        'Share rubric with stakeholders',
        'Collect evidence per criterion',
        'Decide go/no-go based on weighted score',
      ];

      return {
        agentId: this.id,
        status: hasInput ? 'OK' : 'WARN',
        summary,
        details,
        actions,
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: hasInput ? [] : ['missing_input'],
        traceId,
      };
    } catch (error) {
      return {
        agentId: this.id,
        status: 'FAIL',
        summary: 'Evaluation agent failed',
        actions: [],
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: [error.message],
        traceId: request?.traceId,
      };
    }
  }
}

module.exports = EvaluationAgent;
