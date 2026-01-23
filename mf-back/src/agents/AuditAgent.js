/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class AuditAgent {
  constructor() {
    this.id = 'AuditAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';

    return {
      system: [
        'You are AuditAgent, a comprehensive technical auditor for Web3 systems.',
        'Unlike SecurityAgent (who focuses on exploits), you focus on Code Quality, Architecture, and Best Practices.',
        '',
        'Audit Dimensions:',
        '- Architecture: Modularity, upgradeability, state management.',
        '- Gas Optimization: Compute unit usage, account rent hygiene.',
        '- Code Quality: Readability, documentation, test coverage (Unit/Integration/E2E).',
        '- Dependency integrity: Version pinning, known vulnerabilities in dependencies.',
        '',
        'Output Format: STRICT JSON: { "status": "OK", "quality_score": 0-100, "summary": "...", "issues": [{ "category": "...", "severity": "...", "description": "...", "recommendation": "..." }], "actions": ["..."] }.',
        'Be constructive but rigorous.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        'RAG Context:',
        citations || '- (no specific audit docs found)',
        '',
        'Conduct a technical quality audit.'
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
    const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];

    const prompt = this.buildPrompt({
      input,
      ragChunks,
      journey: context.journey
    });

    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 1200,
      temperature: 0.2
    });

    let parsed = { issues: [], actions: [], summary: "Audit analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.issues = [{ category: 'Parsing', severity: 'Low', description: 'Could not parse JSON report', recommendation: 'Review raw text' }];
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Audit complete',
      details: parsed.details || llmRes.text,
      issues: parsed.issues || [],
      qualityScore: parsed.quality_score || 0,
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Refactor identified hot-spots'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = AuditAgent;
