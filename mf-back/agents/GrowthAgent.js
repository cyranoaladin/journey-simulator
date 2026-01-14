/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');
const { normalizeProjectSpecs } = require('../constants/project_schemas');

class GrowthAgent {
  constructor() {
    this.id = 'GrowthAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode, projectSpecs }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Data-driven, referencing CommunityAgent for sentiment and Tokenomics for incentives.'
      : 'Aggressive, metric-obsessed, "Growth Hacker".';

    return {
      system: [
        '**IDENTITY**: Growth Hacker & User Acquisition Specialist.',
        '**EXPERTISE**: Web3 Marketing Funnels, Vampire Attacks, Airdrop Mechanics, On-chain Analytics (Dune/Flipside), Viral Loops.',
        '**WORKFLOW**:',
        '**MEMORY FIRST**: Use provided conversation history (if any) as the single source of truth for project naming, constraints, and budgets. Do NOT invent data missing from history; prefer answering "Insufficient data  provide budget/constraints" over guessing.',
        '**CRITICAL REALITY CHECK (MUST ENFORCE)**:',
        '1. **Budget vs Goal**: If the budget is clearly insufficient for the goal (e.g. <$5000 for a $1M+ sellout), you MUST flag it.',
        '2. **Logic Check**: If (Supply * Price) > 500 * Budget, return "status": "RISK_REPORT" and fill "details" with a "Realism Matrix".',
        '   - Realism Matrix format: { "viability_score": 0-10, "blockers": ["..."], "required_budget": "Estimated $..." }',
        '',
        '**REASONING**: Explain the CAC theoretical calculation vs budget BEFORE outputting the growth plan or realism matrix. Include formulas and assumptions.',
        '**WORKFLOW**:',
        '1. Analyze Project Specs (Supply, Price) vs Input (Budget).',
        '2. Define the North Star Metric (e.g. WAU, TVL).',
        '3. If viable, Design the Acquisition Strategy. If not, generate Risk Report.',
        '4. Calculate CAC estimates.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "growth_plan": { "channels": ["..."], "experiments": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph LR... for funnel)",',
        '     "data": { "kpis": [{ "label": "CAC", "value": "$15" }, ...], "projections": [...] },',
        '     "documentation": "Markdown growth playbook"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid JSON data for growth projections.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'Project Context (from previous agents):',
        (projectSpecs ? JSON.stringify(projectSpecs, null, 2) : '- (no specs provided)'),
        '',
        'RAG Context:',
        citations || '- (no specific growth docs found)',
        '',
        'Design a high-impact growth strategy.'
      ].join('\n'),
    };
  }

  async run(request) {
    const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
    const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];

    const normalizedSpecs = normalizeProjectSpecs({
      ...context.projectSpecs,
      ...context.nft, // allow NFTAgent output (collection_strategy) to populate price/supply
    });

    const { supply, price, budget, currency } = normalizedSpecs;
    const hasNumbers = Number.isFinite(supply) && Number.isFinite(price) && Number.isFinite(budget);
    const unrealisticBudget = hasNumbers && (supply * price) > (500 * budget);

    if (unrealisticBudget) {
      return {
        traceId,
        agentId: this.id,
        status: 'RISK',
        summary: 'RISK_REPORT: conflicting budget vs goals',
        details: {
          realism_matrix: {
            viability_score: 0,
            blockers: ['Budget too low for likely supply/price'],
            required_budget: `${Math.round((supply * price) / 500)} ${currency || 'USD'}`,
          },
        },
        resources: {},
        confidence: 0.9,
        assumptions: [`History size: ${(context.history || []).length}`],
        citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
        actions: ['Recalibrate budget or reduce supply/price'],
        metrics: { latencyMs: 0, tokens: 0, ragHits: ragChunks.length },
        errors: ['budget_vs_goal_conflict'],
        mock: true,
      };
    }

    const prompt = this.buildPrompt({
      input,
      ragChunks,
      journey: context.journey,
      orchestrationMode: context.orchestrationMode || 'AEPO',
      projectSpecs: normalizedSpecs // Pass this explicitly or use context inside buildPrompt definition
    });

    const llmRes = await this.llm.generate({
      prompt,
      traceId,
      agentId: this.id,
      maxTokens: constraints.maxTokens || 1200,
      temperature: 0.4
    });

    let parsed = { growth_plan: {}, resources: {}, actions: [], summary: "Growth analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
    }

    // Capture Status Override from LLM
    const finalStatus = parsed.status === 'RISK_REPORT' ? 'RISK' : 'OK';
    const finalSummary = parsed.summary || 'Growth strategy proposed';

    return {
      traceId,
      agentId: this.id,
      status: finalStatus,
      summary: finalSummary,
      details: parsed.growth_plan || parsed.details || {},
      resources: parsed.resources || {},
      confidence: 0.85,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Launch waiting list'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = GrowthAgent;
