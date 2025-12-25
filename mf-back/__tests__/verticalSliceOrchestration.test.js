const { orchestrateVerticalSlice } = require('../orchestration/zynoVerticalSlice');

describe('Vertical Slice Orchestration', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = ''; // force mock LLM
    process.env.RAG_SEARCH_URL = ''; // force local RAG
  });

  it('routes to two agents, preserves traceId, and works in mock mode', async () => {
    const traceId = 'trace-test-123';
    const runId = 'run-test-123';
    const input = 'Audit sécurité API et spécification produit onboarding';

    const result = await orchestrateVerticalSlice({
      traceId,
      runId,
      intent: 'vslice',
      input,
      context: { rag: { topK: 2 } },
      constraints: { maxTokens: 200 },
    });

    expect(result.traceId).toBe(traceId);
    expect(result.runId).toBe(runId);
    expect(Array.isArray(result.agents)).toBe(true);
    expect(result.agents.length).toBe(2);

    for (const agent of result.agents) {
      expect(agent.traceId).toBe(traceId);
      expect(agent.status).toBe('OK');
      expect(agent.metrics).toHaveProperty('latencyMs');
      expect(agent.metrics).toHaveProperty('ragHits');
    }

    // mock LLM should mark mock:true somewhere
    const anyMock = result.agents.some((a) => a.mock === true || a.details?.includes('[MOCK]'));
    expect(anyMock).toBe(true);
  });
});
