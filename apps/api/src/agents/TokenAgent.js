/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');
const { normalizeProjectSpecs } = require('../constants/project_schemas');

class TokenAgent {
  constructor() {
    this.id = 'TokenAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode, history }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Holistic, balancing incentives with GovernanceAgent, aligning with ComplianceAgent.'
      : 'Mathematically rigorous, ruthless optimizer, "Token Engineer".';

    return {
      system: [
        '**IDENTITY**: Chief Token Architect & Economist (Thought Partner).',
        '**EXPERTISE**: Bonding Curves (Linear/Exponential/Sigmoid), Vesting Mathematics, Supply Schedules, Game Theory Equilibrium.',
        '',
        '**MEMORY FIRST**: Use the provided conversation history as the primary ground truth about the project. If history contains the project name or constraints, you MUST restate and honor them. Do NOT say "unknown" when history provides the answer.',
        '**LEGAL & MATH REQUIREMENTS (MUST INCLUDE)**:',
        '1. **Bonding Curve Formulas** (toujours en LaTeX entre $$ $$):',
        '   - Linear: $$P = m \\cdot S + b$$',
        '   - Exponential: $$P = a \\cdot e^{k \\cdot S}$$',
        '   - Sigmoid: $$P = \\frac{K}{1 + e^{-k \\cdot (S - S_0)}}$$',
        '2. **Vesting Logic**: Define Cliff (months), Linear Vesting duration (months), and TGE Unlock %.',
        '   - Formula: Unlock(t) = (t < Cliff) ? 0 : (Allocation * (t - Cliff) / VestingDuration)',
        '3. **Valuation Metrics**: Calculate Initial Market Cap (IMC) vs Fully Diluted Valuation (FDV).',
        '4. **Sell Pressure Analysis**: Estimate the "Sell Pressure" (USD value) unlocking at TGE + Cliff.',
        '5. **CRITICAL VALIDATION**: SUM(Allocations) MUST equal 100%. If the input or your design implies >100% or <100%, you MUST return "status": "ERROR" and "summary": "ERROR: TOTAL_ALLOCATION_MISMATCH".',
        '',
        '**WORKFLOW**:',
        '1. Define supply dynamics (inflation/deflation/hard cap).',
        '2. Allocate tokens (Team, Treasury, Community, Investors) and verify the sum = 100%.',
        '3. Map utility (staking, burn) explaining with a flow graph analogy.',
        '4. Simulate sell vs buy pressure with a small demonstration (think series/flow graphs).',
        '5. **Double Check Sum**: verify the sum before outputting the response; if !=100% => status ERROR.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK" | "ERROR",',
        '  "summary": "...",',
        '  "token_model": { "supply_cap": "...", "valuations": { "fdv": "...", "imc": "..." }, "sell_pressure_at_cliff": "..." },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for token flow OR pie chart for allocation)",',
        '     "data": { "allocations": [{ "category": "Team", "percentage": 15, "vesting": "..." }, ...], "inflation_schedule": [...] },',
        '     "documentation": "Markdown tokenomics paper, including all formulas in LaTeX $$...$$"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for token distribution.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'Conversation History:',
        (history ? JSON.stringify(history.slice(-3), null, 2) : '- (no history)'),
        '',
        'RAG Context:',
        citations || '- (no specific tokenomics docs found)',
        '',
        'Design the token economy.'
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
    const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];
    const normalizedSpecs = normalizeProjectSpecs({
      ...context.projectSpecs,
      ...context.nft,
    });

    const extractNumber = (raw) => {
      if (!raw) return null;
      const normalized = String(raw).replace(/[^0-9.,-\s]/g, '').replace(/[\s,]+/g, '');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const lowerInput = (input || '').toLowerCase();
    const capMatch = lowerInput.match(/market\s*cap\s*(?:initial)?\s*\$?\s*([\d.,\s]+)/) || lowerInput.match(/cap\s*initiale?\s*\$?\s*([\d.,\s]+)/);
    const supplyMatch = lowerInput.match(/supply\s*(?:de|of)?\s*([\d.,\s]+)/) || lowerInput.match(/offre\s*(?:totale)?\s*([\d.,\s]+)/);
    const detectedCap = extractNumber(capMatch?.[1]) ?? normalizedSpecs.marketCap;
    const detectedSupply = extractNumber(supplyMatch?.[1]) ?? normalizedSpecs.supply;
    const impliedPrice = detectedCap && detectedSupply ? detectedCap / detectedSupply : null;
    const aberrationDetected = Boolean(
      detectedCap && detectedSupply && (impliedPrice <= 0 || impliedPrice < 1e-6)
    );

    if (aberrationDetected) {
      return {
        traceId,
        agentId: this.id,
        status: 'ERROR',
        summary: 'ERROR: MARKET_CAP_INCONSISTENT',
        details: {
          reason: 'Initial market cap is inconsistent vs supply',
          detectedCap,
          detectedSupply,
          impliedPrice,
        },
        findings: [{ item: 'market_cap', status: 'error', detail: 'Market cap too low compared to supply' }],
        confidence: 0.91,
        assumptions: [`History size: ${(context.history || []).length}`],
        citations: [],
        actions: ['Recalculate price per token with realistic constraints'],
        metrics: { latencyMs: 0, tokens: 0, ragHits: ragChunks.length },
        errors: ['market_cap_aberration'],
        mock: true,
      };
    }

    const prompt = this.buildPrompt({
      input,
      ragChunks,
      journey: context.journey,
      orchestrationMode: context.orchestrationMode || 'AEPO',
      history: context.history || []
    });

    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 1200,
      temperature: 0.3
    });

    let parsed = { model: {}, findings: [], actions: [], summary: "Tokenomics analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      console.log('[DEBUGAGENT] LLM JSON Match:', jsonMatch ? jsonMatch[0] : 'No match');
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.findings = [{ item: 'Parse Error', status: 'warn', detail: 'Review tokenomics text output manually.' }];
    }

    const baseResult = {
      traceId,
      agentId: this.id,
      status: parsed.status || 'OK',
      summary: parsed.summary || 'Tokenomics draft generated',
      details: parsed.token_model || parsed.model || parsed.details || llmRes.text,
      findings: parsed.findings || [],
      confidence: 0.8,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Simulate circulation schedule'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };

    if (process.env.MFAI_ONCHAIN_MODE === 'connect-only') {
      return {
        ...baseResult,
        mode: 'simulated',
        onchainExecuted: false,
        limits: [...(baseResult.limits || []), 'Simulation only — no on-chain execution in Testnet v0'],
      };
    }
    return baseResult;
  }
}

module.exports = TokenAgent;
