/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

class ObservabilityAgent {
  constructor() {
    this.id = 'ObservabilityAgent';
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

      const summary = hasInput ? 'Observability plan generated' : 'Observability plan drafted with limited input';
      const confidence = hasInput ? 0.72 : 0.58;
      const findings = [
        { item: 'slos', status: 'ok', detail: 'SLOs drafted (latency, error rate, availability)' },
        { item: 'alerts', status: 'ok', detail: 'Alert patterns suggested' },
        { item: 'tracing', status: hasInput ? 'ok' : 'warn', detail: 'Tracing instrumentation to confirm' },
      ];

      const details = {
        intent: intentNormalized || 'observability',
        journeyType,
        phaseId,
        objectives,
        artifacts,
        telemetry: ['logs', 'metrics', 'traces'],
        sre: {
          slos: ['latency p95', 'error rate', 'availability'],
          alerts: ['p95 > budget', '5xx spike', 'queue backlog'],
        },
      };

      const actions = [
        'Define SLIs/SLOs for critical paths',
        'Instrument tracing for key flows',
        'Add alert runbooks with owners',
      ];

      return {
        agentId: this.id,
        status: hasInput ? 'OK' : 'WARN',
        summary,
        details,
        findings,
        confidence,
        assumptions: hasInput ? [] : ['Limited inputs, SLOs to be calibrated'],
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
        summary: 'Observability agent failed',
        actions: [],
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: [error.message],
        traceId: request?.traceId,
      };
    }
  }
}

module.exports = ObservabilityAgent;
