const { LLMClient } = require('../orchestration/llmClient');

class AnalyticsAgent {
  constructor() {
    this.id = 'AnalyticsAgent';
    this.llm = new LLMClient({});
  }

  buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
    const citations = (ragChunks || [])
      .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
      .join('\n');

    const phase = journey?.phaseId || 'unknown';
    const isCollaborative = orchestrationMode === 'AECO';

    const tone = isCollaborative
      ? 'Data-centric, feeding GrowthAgent with metrics and CoachAgent with KPIs.'
      : 'Quantitative, precise, "Data Scientist".';

    return {
      system: [
        '**IDENTITY**: Web3 Data Analyst & Metric Architect.',
        '**EXPERTISE**: On-chain Data Indexing (The Graph/Dune), Cohort Analysis, Token Velocity Tracking, User Segmentation.',
        '**WORKFLOW**:',
        '1. Define Tracking Schema (Events to log).',
        '2. Analyze Retention Cohorts (D1/D7/D30).',
        '3. Visualize Token Distribution.',
        '',
        `**TONE**: ${tone}`,
        '**OUTPUT FORMAT**: STRICT JSON: {',
        '  "status": "OK",',
        '  "summary": "...",',
        '  "analytics_plan": { "events": ["..."], "kpis": ["..."] },',
        '  "resources": {',
        '     "diagram": "Mermaid diagram string (graph TD... for data pipeline)",',
        '     "data": { "dau_mau_ratio": 0.0, "churn_rate": "..." },',
        '     "documentation": "Markdown tracking plan"',
        '  },',
        '  "actions": ["..."]',
        '}',
        '**RESOURCES**: Must output valid JSON data for metrics.'
      ].join('\n'),
      user: [
        `User Input: ${input}`,
        `Current Phase: ${phase}`,
        `Mode: ${orchestrationMode}`,
        'RAG Context:',
        citations || '- (no specific analytics docs found)',
        '',
        'Design the data analytics strategy.'
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
      temperature: 0.2
    });

    let parsed = { analytics_plan: {}, resources: {}, actions: [], summary: "Analytics analysis failed to parse" };
    try {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(llmRes.text);
      }
    } catch (e) {
      parsed.details = llmRes.text;
      parsed.resources = { documentation: '### Error\nCould not parse Analytics JSON.' };
    }

    return {
      traceId,
      agentId: this.id,
      status: 'OK',
      summary: parsed.summary || 'Analytics plan designed',
      details: parsed.analytics_plan || {},
      resources: parsed.resources || {},
      confidence: 0.9,
      assumptions: [`RAG hits: ${ragChunks.length}`],
      citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
      actions: parsed.actions || ['Setup Dune dashboard'],
      metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
      errors: [],
      mock: llmRes.mock || false,
    };
  }
}

module.exports = AnalyticsAgent;
