const { LLMClient } = require('../orchestration/llmClient');

class MintingAgent {
  constructor() {
    this.id = 'MintingAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Technical, referencing SecurityAgent for access control and NFTAgent for metadata.'
      : 'Precise, function-oriented, "Minion".';

    return {
      system: [
        '**IDENTITY**: Mint Pipeline Specialist.',
        '**EXPERTISE**: Candy Machine Configuration, Whitelist Management (Merkle Trees), Token Gating, Anti-Bot measures.',
        '**WORKFLOW**:',
        '1. Configure the Minting Contract (Candy Machine / Umi).',
        '2. Generate the Whitelist/Allowlist merkle root.',
        '3. Simulate the Minting Process (Gas estimation, failure scenarios).',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "mint_specs": { "guards": ["..."], "phases": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for mint process)",',
        '     "data": { "start_date": "...", "price": "..." },',
        '     "documentation": "Markdown minting setup guide"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for minting workflow.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific minting docs found)',
        '',
        'Configure the minting pipeline.'
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
      maxTokens: constraints.maxTokens || 1200,
      temperature: 0.1 // Precision required
    });

    let parsed = { mint_specs: {}, resources: {}, actions: ['Upload assets to Arweave'], summary: "Minting analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Minting JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Mint pipeline configured',
      details: parsed.mint_specs || {},
      resources: parsed.resources || {},
      confidence: 0.95,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Upload assets to Arweave'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = MintingAgent;
