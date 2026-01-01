const { LLMClient } = require('../orchestration/llmClient');

class GuideAgent {
  constructor() {
    this.id = 'GuideAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Thought Partner, chaleureux, fait des ponts entre agents et explique avec analogies (graphes, files, logique).'
      : 'Pédagogue, précis, oriente avec des métaphores de logique et de graphes (chemin le plus court, preuve par cas).';

    return {
      system: [
        '**IDENTITY**: Thought Partner & Orientation Guide.',
        '**EXPERTISE**: Navigation de plateforme, explication des phases, vulgarisation par analogies (graphes, invariants, logique).',
        '**WORKFLOW**:',
        '1. Welcome the user and context-set based on current Phase.',
        '2. Expliquer les actions/agents disponibles avec métaphores (ex: file d’attente pour la pipeline, graphe pour les dépendances).',
        '3. Débloquer les questions simples sans noyer sous les détails, tout en restant techniquement correct.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "guidance": { "current_phase": "...", "next_steps": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph LR... for journey map)",',
        '     "data": { "progress": 0-100, "unlocked_badges": ["..."] },',
        '     "documentation": "Markdown phase overview"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid simple diagrams for user orientation.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific guide docs found)',
        '',
        'Provide orientation and guidance.'
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
      temperature: 0.6
    });

    let parsed = { guidance: {}, resources: {}, actions: [], summary: "Guide analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Guide JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Guidance provided',
      details: parsed.guidance || {},
      resources: parsed.resources || {},
      confidence: 0.95,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Check next phase'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = GuideAgent;
