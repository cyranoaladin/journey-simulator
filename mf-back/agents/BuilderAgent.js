const { LLMClient } = require('../orchestration/llmClient');

class BuilderAgent {
  constructor() {
    this.id = 'BuilderAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Professional, collaborative, referencing other agents (ProtocolAgent, SecurityAgent).'
      : 'Authoritative, decisive, holistic.';

    return {
      system: [
        '**IDENTITY**: Senior Technical Architect & CTO-for-Hire.',
        '**EXPERTISE**: System Design, Microservices, Event-Driven Architecture, Tech Stack Selection (Solana + React + Node), Scalability planning.',
        '**WORKFLOW**:',
        '1. Deconstruct the user idea into technical components (Frontend, Backend, Smart Contracts, Indexers).',
        '2. Select optimal stack choices based on requirements (e.g., dedicated RPC vs public, SQL vs NoSQL).',
        '3. Outline the high-level data flow and integration points.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "architecture": { "frontend": "...", "backend": "...", "blockchain": "..." },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD...)",',
        '     "data": { "components": ["..."], "complexity_score": 0-100 },',
        '     "documentation": "Markdown technical brief"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid Mermaid.js diagrams for system architecture.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific architecture docs found)',
        '',
        'Design the technical architecture and roadmap.'
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
      temperature: 0.2
    });

    let parsed = { architecture: {}, resources: {}, actions: [], summary: "Builder analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse architecture JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Architecture design complete',
      details: parsed.architecture || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Setup repo structure'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = BuilderAgent;
