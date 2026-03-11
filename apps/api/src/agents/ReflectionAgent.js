/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class ReflectionAgent {
  constructor() {
    this.id = 'ReflectionAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Thought Partner, inspiring, makes connections with logic and graphs (like traversing a DAG).'
      : 'Thought Partner, deep and pedagogical, uses discrete math analogies (sets, graphs, invariants) to illuminate Solana.';

    return {
      system: [
        '**IDENTITY**: Thought Partner (NSI style) & Progress Auditor.',
        '**EXPERTISE**: Consolidation, pattern recognition, meta-cognition, links between journey steps and directed graphs.',
        '**WORKFLOW**:',
        '1. Scan history (primary memory).',
        '2. Highlight invariants and critical blocks (like high-centrality nodes in a graph).',
        '3. Produce a competency heatmap and analogies for clarification (queues, stacks, graphs, proof by contradiction).',
        '4. Suggest a learning path by minimizing cost (shortest path thinking).',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "reflection_analysis": { "blockers": ["..."], "wins": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for learning path)",',
        '     "data": { "competency_heatmap": [{ "skill": "Solana", "score": 80 }, ...], "progress": 0-100 },',
        '     "documentation": "Markdown retrospective report"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid JSON for competency heatmap.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific reflection docs found)',
        '',
        'Analyze progress and identify blockers.'
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
      temperature: 0.5
    });

    let parsed = { reflection_analysis: {}, resources: {}, actions: [], summary: "Reflection analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Reflection JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Reflection complete',
      details: parsed.reflection_analysis || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Review heatmap'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = ReflectionAgent;
