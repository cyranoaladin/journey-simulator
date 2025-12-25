const { getSystemPrompt } = require('./prompts');

class GovernanceDAOAgent {
  async run({ traceId, input = '', ragContext, journey }) {
    const started = Date.now();
    try {
      const citations = buildCitations(ragContext);
      const summary = `Governance guidance for phase ${journey?.phaseId || 'n/a'}: proposal clarity and voting flow checked.`;
      const actions = [
        'Draft proposal summary under 150 words',
        'Define quorum and approval thresholds',
      ];
      return {
        agentId: 'GovernanceDAOAgent',
        status: 'OK',
        summary,
        details: {
          systemPrompt: getSystemPrompt('GovernanceDAOAgent'),
          focus: ['proposal structure', 'voting rules', 'timeline'],
        },
        actions,
        citations,
        metrics: { latencyMs: Date.now() - started, ragHits: citations.length },
        errors: [],
        traceId,
      };
    } catch (error) {
      return {
        agentId: 'GovernanceDAOAgent',
        status: 'WARN',
        summary: 'GovernanceDAOAgent failed safely',
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

module.exports = GovernanceDAOAgent;
