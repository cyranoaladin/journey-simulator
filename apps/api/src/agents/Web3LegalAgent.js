/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class Web3LegalAgent {
  constructor() {
    this.id = 'Web3LegalAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';

    return {
      system: [
        'You are the Web3LegalAgent, a specialist in Crypto Law, Entity Structuring, and Regulatory nuance.',
        'Your goal needs to be clear: guide the user through the legal minefield of Web3 without practicing law (educational/strategic perspective).',
        '',
        'Key Topics:',
        '- Entity Formation: DAO wrapping (Marshall Islands, Wyoming, Swiss Foundation), OpCo vs DevCo setup.',
        '- Securities vs Commodities: The Howey Test application to the user\'s token model.',
        '- Consumer Protection: Terms of Use, Privacy Policy, Risk Disclosures for DeFi interfaces.',
        '- Jurisdictional Arbitrage: Pros/cons of Dubai vs Singapore vs US vs EU (MiCA).',
        '',
        'Output Format: STRICT JSON: { "status": "OK", "legal_risk_score": 0-100, "summary": "...", "considerations": [{ "topic": "...", "risk_level": "...", "advice": "..." }], "actions": ["..."] }.',
        'Always include standard disclaimers that this is not legal advice.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        'RAG Context:',
        citations || '- (no specific legal docs found)',
        '',
        'Review the legal strategy implications.'
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
      temperature: 0.1 // Legal precision required
    });

    let parsed = { considerations: [], actions: [], summary: "Legal analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.considerations = [{ topic: 'Parsing', risk_level: 'Unknown', advice: 'Could not parse JSON report' }];
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Legal review preliminary check complete',
      details: parsed.details || llmRes.text,
      considerations: parsed.considerations || [],
      riskScore: parsed.legal_risk_score || 50,
      confidence: 0.85,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Consult qualified legal counsel'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = Web3LegalAgent;
