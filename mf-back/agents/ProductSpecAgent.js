const { LLMClient } = require('../orchestration/llmClient');

class ProductSpecAgent {
  constructor() {
    this.id = 'ProductSpecAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, context }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');
    const historySummary = context?.historySummary
      ? JSON.stringify(context.historySummary).slice(0, 600)
      : '- (aucun résumé disponible)';
    const recentHistory = Array.isArray(context?.history)
      ? context.history.slice(-3).map((h) => h.note || h.summary || h.input).filter(Boolean).slice(0, 3)
      : [];
    return {
      system: [
        'Tu es ProductSpecAgent, responsable des specs produit/UX.',
        'Tu produis un plan concis avec user flows, critères d’acceptance, métriques.',
        'Format JSON strict: {summary, flows:[{name, steps}], acceptance:[{id, criterion}], risks:[{item, impact}], citations:[{id,title}]}.',
      ].join('\n'),
      user: [
        `Demande produit: ${input}`,
        'Contexte sessions précédentes (à réutiliser sans redemander):',
        historySummary,
        recentHistory.length ? `Derniers points: ${recentHistory.join(' | ')}` : 'Derniers points: -',
        'Contexte RAG:',
        citations || '- (aucune source)',
        'Inclure une section flows (3-5 étapes max) et 3 critères d’acceptance minimum.',
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, rag = {}, context = {}, constraints = {} } = request;
    const ragHits = rag.chunks?.length || 0;
    const hasInput = Boolean(input && input.trim());
    const confidence = Math.min(0.55 + (hasInput ? 0.2 : 0.05) + Math.min(ragHits, 3) * 0.05, 0.9);
    const prompt = this.buildPrompt({ input, ragChunks: rag.chunks, context });
    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 800,
    });

    const findings = [
      { item: 'Flows', status: hasInput ? 'ok' : 'warn', detail: 'User flows drafted' },
      { item: 'Acceptance', status: hasInput ? 'ok' : 'warn', detail: 'Acceptance criteria listed' },
      { item: 'Risks', status: 'ok', detail: 'Risks captured for spec' },
    ];

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: 'Product spec generated',
      details: llmRes.text,
      findings,
      confidence,
      assumptions: ['Spec is textual, no code generated', `RAG hits: ${ragHits}`],
      citations: (rag.chunks || []).map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: [
        'Produce OpenAPI or interface skeleton from spec',
        'List top 3 acceptance criteria with owners',
        'Document risks/deps in spec appendix',
      ],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: rag.chunks?.length || 0 },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = ProductSpecAgent;
