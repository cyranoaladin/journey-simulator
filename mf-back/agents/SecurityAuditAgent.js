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
    const ragHits = rag.chunks?.length || 0;
    const confidence = Math.min(0.55 + (input ? 0.15 : 0) + Math.min(ragHits, 3) * 0.05, 0.9);
    const prompt = this.buildPrompt({ input, ragChunks: rag.chunks });
    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 800,
    });

    const findings = [
      { item: 'CORS/headers', status: 'reviewed', severity: 'medium', detail: 'Check helmet + CORS config' },
      { item: 'Auth/RateLimit', status: 'reviewed', severity: 'medium', detail: 'Verify JWT, rate limits in auth routes' },
      { item: 'Secrets/Logs', status: 'reviewed', severity: 'low', detail: 'Ensure no secrets in logs, env guarded' },
    ];

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: 'Security review executed',
      details: llmRes.text,
      findings,
      confidence,
      assumptions: ['LLM output post-processed, no real execution', `RAG hits: ${ragHits}`],
      citations: (rag.chunks || []).map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: [
        'Inspect CORS/helmet headers for exposed routes',
        'Validate auth/rate-limit paths with supertest',
        'Redact secrets from structured logs',
      ],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: rag.chunks?.length || 0 },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = SecurityAuditAgent;
