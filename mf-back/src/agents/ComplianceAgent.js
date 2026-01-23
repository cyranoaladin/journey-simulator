/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class ComplianceAgent {
  constructor() {
    this.id = 'ComplianceAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';

    return {
      system: [
        'You are ComplianceAgent, a specialized legal & regulatory expert for Web3, DeFi, and DAOs.',
        'Your jurisdiction focus: Global standards with emphasis on MiCA (EU) and SEC (US) guidelines for tokens.',
        'Key Areas of Expertise:',
        '- KYC/AML requirements for token sales and DAO participation.',
        '- Data Privacy (GDPR/CCPA) in the context of public ledgers.',
        '- Intellectual Property regarding NFTs and on-chain content.',
        '- Regulatory classification (Security vs Utility token assessment).',
        '',
        'Your Goal: Analyze the user\'s project context and identify compliance gaps or risks.',
        'Output Format: STRICT JSON structure: { "status": "OK", "summary": "...", "findings": [{ "item": "...", "status": "ok|warn|risk", "detail": "...", "reference": "..." }], "actions": ["..."], "details": "..." }.',
        'Do not provide binding legal advice, but robust "compliance guardrails" for engineering and product teams.',
        'If the input lacks sufficient detail, list the specific compliance questions that need answering.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Journey Phase: ${phase}`,
        'RAG Context (Legal/Regulatory Docs):',
        citations || '- (no specific legal precedents found in RAG)',
        '',
        'Provide a compliance risk assessment and actionable mitigation steps.'
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
      temperature: 0.1 // High precision for legal
    });

    let parsed = { findings: [], actions: [], summary: "Compliance analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.findings = [{ item: 'Parse Error', status: 'warn', detail: 'Raw output requires manual review.' }];
      parsed.actions = ['Consult legal team manually'];
    }

    // Default fallbacks
    const findings = parsed.findings || [];
    const actions = parsed.actions || ['Conduct full legal audit'];

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Compliance review complete',
      details: parsed.details || llmRes.text,
      findings,
      confidence: 0.85,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions,
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = ComplianceAgent;
