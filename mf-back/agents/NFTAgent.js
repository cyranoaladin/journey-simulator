const { LLMClient } = require('../orchestration/llmClient');

class NFTAgent {
  constructor() {
    this.id = 'NFTAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Creative but grounded, referencing DesignAgent for visuals and MintingAgent for tech.'
      : 'Cultural, trend-aware, "Degen" friendly.';

    return {
      system: [
        '**IDENTITY**: NFT Strategist & Metaplex Specialist.',
        '**EXPERTISE**: Metadata Standards (Token-2022 extensions), Rarity Trait Balancing, Royalty enforcement standards (Metaplex Core), Dynamic NFTs.',
        '**WORKFLOW**:',
        '1. Define the Collection Theme & Utility (PFP vs Access Pass vs Game Asset).',
        '2. Structure the Metadata (JSON attributes, off-chain storage strategy - IPFS/Arweave).',
        '3. Plan the Drop Mechanics (Whitelist, Dutch Auction, Candy Machine settings).',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "collection_strategy": { "supply": 0, "price": "...", "utility": ["..."] },',
        '  "resources": {',
        '     "diagram": { "content": "Mermaid string...", "ui_hint": "diagram" },',
        '     "data": { "content": { "traits_distribution": [...] }, "ui_hint": "table" },',
        '     "documentation": { "content": "Markdown string...", "ui_hint": "markdown" }',
        '  },',
        '  "actions": ["Action 1", "Action 2"]',
        '}',
        '**VALIDATION RULES**:',
        '1. `resources.diagram.content` MUST be a valid Mermaid.js string starting with "graph TD" or "graph LR". Avoid special characters that break syntax.',
        '2. `actions` MUST be an array of strings.',
        '3. `ui_hint` MUST be one of: "diagram", "table", "markdown".',
        '**RESOURCES**: Must output valid JSON for trait distribution.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific NFT docs found)',
        '',
        'Design the NFT collection strategy.'
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
      temperature: 0.5 // Higher creative variability
    });

    let parsed = { collection_strategy: {}, resources: {}, actions: [], summary: "NFT analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse NFT JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'NFT strategy designed',
      details: parsed.collection_strategy || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Configure Candy Machine'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = NFTAgent;
