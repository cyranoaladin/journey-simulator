const { LLMClient } = require('../orchestration/llmClient');

class SecurityAuditAgent {
  constructor() {
    this.id = 'SecurityAuditAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');
    return {
      system: [
        'Tu es SecurityAuditAgent, spécialiste sécurité backend/front.',
        'Tu dois identifier risques, contrôles, et actions concrètes.',
        'Format de sortie JSON strict: {status, summary, findings:[{area, risk, severity, action}], citations:[{id,title}]}.',
        'Ne propose pas de code non demandé, reste concis.',
      ].join('\n'),
      user: [
        `Contexte utilisateur: ${input}`,
        'RAG:',
        citations || '- (aucune source)',
        'Check-list minimale: CORS, rate limiting, auth/JWT, secrets, CSP, validation d’entrée.',
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
      summary: 'Security review executed',
      details: llmRes.text,
      citations: (rag.chunks || []).map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: [],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: rag.chunks?.length || 0 },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = SecurityAuditAgent;
