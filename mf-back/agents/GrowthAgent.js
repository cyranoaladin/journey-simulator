class GrowthAgent {
  constructor() {
    this.id = 'GrowthAgent';
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

      const summary = hasInput ? 'Growth playbook proposed' : 'Growth playbook drafted with limited input';
      const confidence = hasInput ? 0.72 : 0.58;
      const findings = [
        { item: 'acquisition', status: 'ok', detail: 'Acquisition lever proposed' },
        { item: 'activation', status: 'ok', detail: 'Activation checklist suggested' },
        { item: 'retention', status: 'warn', detail: 'Retention experiment to design' },
      ];

      const details = {
        intent: intentNormalized || 'growth',
        journeyType,
        phaseId,
        objectives,
        artifacts,
        levers: [
          { name: 'Acquisition', tactic: 'SEO + referrals', metric: 'signups' },
          { name: 'Activation', tactic: 'guided checklist', metric: 'AHA rate' },
          { name: 'Retention', tactic: 'nudges & alerts', metric: 'WAU/MAU' },
        ],
      };

      const actions = [
        'Ship activation checklist in product',
        'Launch referral incentive experiment (A/B)',
        'Instrument retention cohort dashboard',
      ];

      return {
        agentId: this.id,
        status: hasInput ? 'OK' : 'WARN',
        summary,
        details,
        findings,
        confidence,
        assumptions: hasInput ? [] : ['Hypothèses basées sur modèle générique AARRR'],
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
        summary: 'Growth agent failed',
        actions: [],
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: [error.message],
        traceId: request?.traceId,
      };
    }
  }
}

module.exports = GrowthAgent;
