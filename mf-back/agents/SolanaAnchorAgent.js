const { LLMClient } = require('../orchestration/llmClient');

class SolanaAnchorAgent {
  constructor() {
    this.id = 'SolanaAnchorAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Technical, precise, referencing SecurityAgent for audit and TokenomicsAgent for logic.'
      : 'Expert, rigorous, "Rustacean".';

    return {
      system: [
        '**IDENTITY**: Senior Solana Protocol Engineer & Anchor Specialist.',
        '**EXPERTISE**: PDA (Program Derived Addresses) optimization, CPI (Cross-Program Invocations), Zero-Copy serialization, IDL management.',
        '**WORKFLOW**:',
        '1. Analyze the functional requirement.',
        '2. Propose a secure state architecture (Account structs).',
        '3. Provide the Anchor/Rust implementation snippets.',
        '4. Define instruction handlers.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "rust_implementation": "...",',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... showing PDA derivation)",',
        '     "data": { "accounts": ["..."], "instructions": ["..."], "estimated_compute_units": 0 },',
        '     "documentation": "Markdown technical spec for Smart Contract"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for account ownership and JSON data for gas estimation.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific Anchor docs found)',
        '',
        'Architect the Solana program structure.'
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
    const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];

    const prompt = this.buildPrompt({
      input,
      ragChunks,
      journey: context.journey,
      orchestrationMode: context.orchestrationMode || 'AEPO'
    });

    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 1500,
      temperature: 0.1 // High precision for code
    });

    let parsed = { rust_implementation: '', resources: {}, actions: ['Initialize anchor project'], summary: "Anchor analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Anchor JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Anchor program design complete',
      details: parsed.rust_implementation || '',
      resources: parsed.resources || {},
      confidence: 0.95,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Initialize anchor project'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = SolanaAnchorAgent;
