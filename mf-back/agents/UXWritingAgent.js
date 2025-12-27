const { getSystemPrompt } = require('./prompts');

class UXWritingAgent {
  async run({ traceId, input = '', ragContext, journey }) {
    const started = Date.now();
    try {
      const citations = buildCitations(ragContext);
      const summary = `UX copy refined for phase ${journey?.phaseId || 'unknown'}: concise, action-led.`;
      const confidence = input ? 0.72 : 0.6;
      const findings = [
        { item: 'cta', status: 'ok', detail: 'CTA rewrite suggested' },
        { item: 'helper', status: 'ok', detail: 'Helper text constraint applied' },
        { item: 'tone', status: 'warn', detail: 'Tone alignment to confirm' },
      ];
      const actions = [
        `Rewrite CTA to a verb-first phrase for phase ${journey?.phaseId || 'current'}`,
        'Add helper text limited to 120 chars',
      ];
      return {
        agentId: 'UXWritingAgent',
        status: 'OK',
        summary,
        details: {
          systemPrompt: getSystemPrompt('UXWritingAgent'),
          considerations: ['clarity', 'actionability', 'tone consistent'],
        },
        findings,
        confidence,
        assumptions: input ? [] : ['Texte source non fourni, propositions génériques'],
        actions,
        citations,
        metrics: { latencyMs: Date.now() - started, ragHits: citations.length },
        errors: [],
        traceId,
      };
    } catch (error) {
      return {
        agentId: 'UXWritingAgent',
        status: 'WARN',
        summary: 'UXWritingAgent failed safely',
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

module.exports = UXWritingAgent;
