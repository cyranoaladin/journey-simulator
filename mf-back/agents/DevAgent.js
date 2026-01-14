/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class DevAgent {
  constructor() {
    this.id = 'DevAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Code-focused but context-aware, referencing BuilderAgent specs.'
      : 'Precise, code-heavy, implementer.';

    return {
      system: [
        '**IDENTITY**: Senior Rust & Typescript Developer (Implementation Specialist).',
        '**EXPERTISE**: Anchor Framework, Solana Web3.js, React Hooks for Solana, CI/CD pipeline configuration.',
        '**WORKFLOW**:',
        '1. Receive the architectural spec.',
        '2. Generate the actual code implementation (Rust or JS).',
        '3. Provide unit test skeletons (Mocha/Chai or Rust #[test]).',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "code_snippets": { "file_name.rs": "...", "client.ts": "..." },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (classDiagram or flow)",',
        '     "data": { "lines_of_code": 0, "complexity": "Low|Medium|High" },',
        '     "documentation": "Markdown README section for the code"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for code structure.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific code docs found)',
        '',
        'Implement the requested logic.'
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
      temperature: 0.1 // Exact code generation
    });

    let parsed = { code_snippets: {}, resources: {}, actions: [], summary: "DevAgent analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Code JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Implementation drafted',
      details: parsed.code_snippets || {},
      resources: parsed.resources || {},
      confidence: 0.95,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Run cargo test'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = DevAgent;
