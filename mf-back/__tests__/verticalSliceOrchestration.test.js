jest.mock('../orchestration/ragClient', () => {
  const searchMock = jest.fn(async () => ({
    chunks: [{ id: 'doc1', title: 'doc', text: 'content', source: 'mock' }],
    source: 'mock',
    latencyMs: 1,
  }));
  return {
    RAGClient: jest.fn().mockImplementation(() => ({
      search: searchMock,
    })),
    __mockSearch: searchMock,
  };
});

const { __mockSearch: ragSearchMock, RAGClient } = require('../orchestration/ragClient');
const { orchestrateVerticalSlice } = require('../orchestration/zynoVerticalSlice');

describe('Vertical Slice Orchestration', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = ''; // force mock LLM
    process.env.RAG_SEARCH_URL = ''; // force local RAG
  });

  beforeEach(() => {
    ragSearchMock.mockClear();
  });

  it('executes single agent for security intent', async () => {
    const traceId = 'trace-single';
    const res = await orchestrateVerticalSlice({
      traceId,
      runId: 'run-single',
      intent: 'security.audit',
      input: 'security audit',
      constraints: { maxTokens: 200 },
    });

    expect(res.traceId).toBe(traceId);
    expect(res.intent).toBe('security_audit');
    expect(res.agents).toHaveLength(1);
    expect(res.agents[0].agentId).toBe('SecurityAuditAgent');
    expect(res.metrics.agentsCount).toBe(1);
    expect(typeof res.summary).toBe('string');
    expect(ragSearchMock).toHaveBeenCalledTimes(1);
  });

  it('executes two agents for composite intent and calls RAG once', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-composite',
      runId: 'run-composite',
      intent: 'security.audit+product.spec',
      input: 'composite request',
    });

    expect(res.agents).toHaveLength(2);
    expect(res.intent).toBe('security_audit+product_spec');
    expect(res.metrics.agentsCount).toBe(2);
    expect(ragSearchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to ProductSpecAgent on unknown intent', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-fallback',
      runId: 'run-fallback',
      intent: 'unknown.intent',
      input: 'fallback',
    });
    expect(res.agents).toHaveLength(1);
    expect(res.agents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intent).toBe('unknown_intent');
    expect(res.metrics.agentsCount).toBe(1);
  });
});
