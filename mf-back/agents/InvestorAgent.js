/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class InvestorAgent {
  constructor() {
    this.id = 'InvestorAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';

    return {
      system: [
        'You are InvestorAgent, a simulated Tier-1 VC Partner (e.g., a16z, Paradigm equivalent).',
        'Your goal: Critically evaluate the project for investment potential, market fit, and execution capability.',
        '',
        'Evaluation Criteria:',
        '- Market: TAM/SAM/SOM, Growth rate, Competitors, "Why now?".',
        '- Team: Experience, Founder-Market Fit, Engineering capability.',
        '- Product: Unique Value Proposition, Moat, UX/UI quality.',
        '- Traction: Users, Revenue, Partnerships, Community engagement.',
        '- Tokenomics: Value capture, Vesting, Utility vs Speculation.',
        '',
        'Tone: Professional, skeptical, data-driven, direct ("Shark Tank" style).',
        'Output Format: STRICT JSON structure: { "status": "OK", "summary": "...", "investment_decision": "YES | NO | WATCH", "score": 0-100, "findings": [{ "item": "...", "status": "strength|weakness", "detail": "..." }], "questions": ["..."] }.',
        'Do not be polite. Be accurate.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        'RAG Context:',
        citations || '- (no specific investor docs found in RAG)',
        '',
        'Evaluate this pitch/update.'
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
      maxTokens: constraints.maxTokens || 1000,
      temperature: 0.4 // Slightly higher for "opinion"
    });

    let parsed = { investment_decision: "WATCH", findings: [], questions: [], summary: "Analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.findings = [{ item: 'Parse Error', status: 'weakness', detail: 'Could not parse VC feedback.' }];
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Investment analysis complete',
      details: parsed.details || llmRes.text,
      findings: parsed.findings || [],
      confidence: 0.9,
      score: parsed.score || 0,
      decision: parsed.investment_decision || "WATCH",
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.questions || ['Prepare detailed data room'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = InvestorAgent;
