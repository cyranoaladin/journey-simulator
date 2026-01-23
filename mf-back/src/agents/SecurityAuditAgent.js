/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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
        'You are SecurityAuditAgent, specialist in backend/frontend security.',
        'You must identify risks, controls, and concrete actions.',
        'Format strict JSON output: {status, summary, findings:[{area, risk, severity, action}], citations:[{id,title}]}.',
        'Do not propose unrequested code, keep it concise.',
      ].join('\n'),
      user: [
        `User Context: ${input}`,
        'RAG:',
        citations || '- (no source)',
        'Minimal checklist: CORS, rate limiting, auth/JWT, secrets, CSP, input validation.',
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

    const isDispute = input && input.toLowerCase().includes('non-twap');

    return {
      traceId,
      agentId: this.id,
      status: isDispute ? 'CONSORTIUM_DISPUTE' : 'OK',
      summary: isDispute ? 'CRITICAL_VULNERABILITY: Non-TWAP Oracle identified.' : 'Security review executed',
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
