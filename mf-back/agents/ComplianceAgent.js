const { getSystemPrompt } = require('./prompts');

class ComplianceAgent {
  async run({ traceId, input = '', ragContext, journey }) {
    const started = Date.now();
    try {
      const citations = buildCitations(ragContext);
      const summary = `Compliance review for phase ${journey?.phaseId || 'n/a'}: key risks noted, guidance provided.`;
      const actions = [
        'Document data retention policy for this feature',
        'Add consent/opt-out copy near the CTA',
      ];
      return {
        agentId: 'ComplianceAgent',
        status: 'OK',
        summary,
        details: {
          systemPrompt: getSystemPrompt('ComplianceAgent'),
          focus: ['data handling', 'consent', 'privacy notice'],
        },
        actions,
        citations,
        metrics: { latencyMs: Date.now() - started, ragHits: citations.length },
        errors: [],
        traceId,
      };
    } catch (error) {
      return {
        agentId: 'ComplianceAgent',
        status: 'WARN',
        summary: 'ComplianceAgent failed safely',
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

module.exports = ComplianceAgent;
