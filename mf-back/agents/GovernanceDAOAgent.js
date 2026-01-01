const { LLMClient } = require('../orchestration/llmClient');

class GovernanceDAOAgent {
  constructor() {
    this.id = 'GovernanceDAOAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';

    return {
      system: [
        'You are GovernanceDAOAgent, an expert in DAO governance, voting systems, and proposal structures (Solana/SPL).',
        'Your goal: Analyze the user request and generate specific governance recommendations.',
        'Output STRICT JSON format: { "status": "OK", "summary": "...", "findings": [{ "item": "...", "status": "ok|warn", "detail": "..." }], "actions": ["..."], "details": "..." }.',
        'Focus on: Quorum, Thresholds, Voting Delay, Legal Wrapper (DAO LLC/UNA).',
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        'RAG Context:',
        citations || '- (no sources)',
        'Generate a structured governance checks and actionable setup steps.',
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
    // Handle both flat ragContext (from executionEngine) or nested rag object
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
      maxTokens: constraints.maxTokens || 800,
      temperature: 0.3
    });

    let parsed = { findings: [], actions: [], summary: "Analysis failed to parse" };
    try {
      // Attempt to parse strictly, or extract JSON from text if markdown is present
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      // Fallback if JSON parsing fails
      parsed.details = llmRes.text;
      parsed.findings = [{ item: 'Parse Error', status: 'warn', detail: 'Could not parse LLM JSON output' }];
      parsed.actions = ['Review raw output manually'];
    }

    // Fallback default structure if keys missing
    const findings = parsed.findings || [
      { item: 'Proposal Structure', status: 'warn', detail: 'AI generated unstructured advice.' }
    ];
    const actions = parsed.actions || ['Define DAO constitution'];

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Governance analysis complete',
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

module.exports = GovernanceDAOAgent;
