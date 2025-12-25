const { LLMClient } = require('../orchestration/llmClient');

class ProductSpecAgent {
  constructor() {
    this.id = 'ProductSpecAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');
    return {
      system: [
        'Tu es ProductSpecAgent, responsable des specs produit/UX.',
        'Tu produis un plan concis avec user flows, critères d’acceptance, métriques.',
        'Format JSON strict: {summary, flows:[{name, steps}], acceptance:[{id, criterion}], risks:[{item, impact}], citations:[{id,title}]}.',
      ].join('\n'),
      user: [
        `Demande produit: ${input}`,
        'Contexte RAG:',
        citations || '- (aucune source)',
        'Inclure une section flows (3-5 étapes max) et 3 critères d’acceptance minimum.',
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, rag = {}, constraints = {} } = request;
    const prompt = this.buildPrompt({ input, ragChunks: rag.chunks });
    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 800,
    });

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: 'Product spec generated',
      details: llmRes.text,
      citations: (rag.chunks || []).map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: [],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: rag.chunks?.length || 0 },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = ProductSpecAgent;
