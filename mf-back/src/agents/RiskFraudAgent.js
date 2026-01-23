/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { getSystemPrompt } = require('./prompts');

class RiskFraudAgent {
  async run({ traceId, input = '', ragContext, journey }) {
    const started = Date.now();
    try {
      const citations = buildCitations(ragContext);
      const summary = `Risk/Fraud scan for phase ${journey?.phaseId || 'n/a'}: controls proposed.`;
      const confidence = 0.62;
      const findings = [
        { item: 'velocity', status: 'ok', detail: 'Velocity checks recommended' },
        { item: 'logging', status: 'ok', detail: 'Anomaly logging advised' },
        { item: 'thresholds', status: 'warn', detail: 'Severity thresholds to set' },
      ];
      const actions = [
        'Add velocity checks to sensitive flows',
        'Log anomalies to risk channel with severity tags',
      ];
      return {
        agentId: 'RiskFraudAgent',
        status: 'OK',
        summary,
        details: {
          systemPrompt: getSystemPrompt('RiskFraudAgent'),
          focus: ['abuse prevention', 'signal thresholds', 'monitoring'],
        },
        findings,
        confidence,
        assumptions: ['Execution is advisory only; agent disabled by default'],
        actions,
        citations,
        metrics: { latencyMs: Date.now() - started, ragHits: citations.length },
        errors: [],
        traceId,
      };
    } catch (error) {
      return {
        agentId: 'RiskFraudAgent',
        status: 'WARN',
        summary: 'RiskFraudAgent failed safely',
        actions: [],
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: [error.message],
        traceId,
      };
    }
  }
}

function buildCitations(ragContext) {
  const chunks = ragContext?.chunks || [];
  return chunks.slice(0, 3).map((c, i) => ({
    source: c.source || `local:${i}`,
    quote: (c.text || '').slice(0, 160),
    relevance: 0.8,
  }));
}

module.exports = RiskFraudAgent;
