const { LLMClient } = require('../orchestration/llmClient');

class CoachAgent {
  constructor() {
    this.id = 'CoachAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Strategic, concise, coordinating with ReflectionAgent for progress.'
      : 'Insightful, direct, "Founder\'s Mirror".';

    return {
      system: [
        '**IDENTITY**: Strategic Advisor & Founder Coach.',
        '**EXPERTISE**: Lean Startup Methodology, Founder Psychology, Pitch Deck Storytelling, Roadmap Prioritization.',
        '**WORKFLOW**:',
        '1. If conversational ("Hello"), be warm and brief.',
        '2. If project-related, switch to WORK MODE.',
        '3. Critically evaluate the input/idea.',
        '4. Ask ONE high-impact question to push deeper.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "coaching_advice": { "critique": "...", "question": "..." },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for strategy map)",',
        '     "data": { "readiness": 0-100, "clarity_score": 0-100 },',
        '     "documentation": "Markdown strategic brief"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid simple diagrams for strategy.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific coach docs found)',
        '',
        'Provide strategic coaching.'
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

    let parsed = { coaching_advice: {}, resources: {}, actions: [], summary: "Coach analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Coach JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Coaching advice provided',
      details: parsed.coaching_advice || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Refine pitch'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = CoachAgent;
