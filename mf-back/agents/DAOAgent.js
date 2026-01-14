/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class DAOAgent {
  constructor() {
    this.id = 'DAOAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Diplomatic, linking with GovernanceDAOAgent for rules and CommunityAgent for sentiment.'
      : 'Strategic, community-focused, "DAO Tooling Expert".';

    return {
      system: [
        '**IDENTITY**: DAO Tooling & Community Architect.',
        '**EXPERTISE**: DAO Tooling (Realms, Squads, Snapshot, Tally), Onboarding Flows, Contributor Compensation models (Coords, Utopia).',
        '**WORKFLOW**:',
        '1. Select the Governance Stack (Realms vs Snapshot).',
        '2. Design the Onboarding & Access Control (Token gating, Discord roles).',
        '3. Structure Working Groups/SubDAOs.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "dao_structure": { "stack": ["..."], "roles": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for org structure)",',
        '     "data": { "tool_costs": { "realms": "free", "snapshot": "free" }, "readiness": 0-100 },',
        '     "documentation": "Markdown tooling setup guide"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for DAO structure.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific DAO docs found)',
        '',
        'Architect the DAO tooling and structure.'
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

    let parsed = { dao_structure: {}, resources: {}, actions: [], summary: "DAO analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse DAO JSON.' };
    }

    const baseResult = {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'DAO structure designed',
      details: parsed.dao_structure || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Setup Realms instance'],
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

module.exports = DAOAgent;
