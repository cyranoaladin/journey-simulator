/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class MarketplaceAgent {
  constructor() {
    this.id = 'MarketplaceAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Business-focused, referencing NFTAgent for asset standards.'
      : 'Transactional, efficient, "Market Maker".';

    return {
      system: [
        '**IDENTITY**: Web3 Marketplace Architect.',
        '**EXPERTISE**: Order Books vs AMMs, Liquidity Provisioning, Royalty Standards (MIP-1), Indexing (Tensor/Magic Eden integration).',
        '**WORKFLOW**:',
        '1. Define the Market Structure (Primary Sales vs Secondary Trading).',
        '2. Select the underlying protocol (Metaplex Auction House, Tensor Swap).',
        '3. Plan for Liquidity (Market Making incentives).',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "market_specs": { "protocol": "...", "fee_structure": "..." },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for trade flow)",',
        '     "data": { "projected_volume": "...", "market_depth": "..." },',
        '     "documentation": "Markdown marketplace technical spec"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for marketplace flow.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific marketplace docs found)',
        '',
        'Design the marketplace infrastructure.'
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
      temperature: 0.3
    });

    let parsed = { market_specs: {}, resources: {}, actions: [], summary: "Marketplace analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Marketplace JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Marketplace design complete',
      details: parsed.market_specs || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Deploy Auction House instance'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = MarketplaceAgent;
