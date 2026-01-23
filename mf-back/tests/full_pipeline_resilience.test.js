/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../utils/agent-idempotence', () => ({
  findOrCreateAgentRun: jest.fn().mockResolvedValue({ run: null, isNew: true }),
  generateIdempotencyKey: jest.fn().mockReturnValue('idempo'),
}));

jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([]),
}));

jest.mock('../utils/openaiClient', () => {
  let callGpt5Mock = jest.fn();
  return {
    DEFAULT_LLM_MODEL: 'mock',
    DEFAULT_LLM_TEMPERATURE: 0.1,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS: 256,
    callGpt5: (...args) => callGpt5Mock(...args),
    __setCallImpl: (fn) => { callGpt5Mock = fn; },
    __getCallMock: () => callGpt5Mock,
  };
});

const BaseAgent = require('../agents/BaseAgent');

class TestAgent extends BaseAgent {
  constructor() {
    super('TestAgent');
  }
  buildSystemPrompt() { return 'system'; }
  buildUserPrompt() { return 'user'; }
  parseOutput(text) { return JSON.parse(text); }
}

describe('full pipeline resilience', () => {
  beforeEach(() => {
    const { __setCallImpl, __getCallMock } = require('../utils/openaiClient');
    const mock = __getCallMock();
    if (mock?.mockReset) mock.mockReset();
    __setCallImpl(jest.fn());
  });

  it('retries on transient OpenAI error (500) then succeeds', async () => {
    const { __setCallImpl, __getCallMock } = require('../utils/openaiClient');
    const mock = __getCallMock();
    mock
      .mockImplementationOnce(() => {
      const err = new Error('server error');
      err.status = 500;
      throw err;
      })
      .mockResolvedValueOnce({
        message: { content: '{"status":"OK","reasoning":"retired success","summary":"ok"}' }
      });
    __setCallImpl(mock);

    const agent = new TestAgent();
    const res = await agent.run({ userId: 'u1', journeyId: 'j1' }, { useCache: false });
    expect(res.status).toBe('OK');
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('self-refines when first payload is status ERROR', async () => {
    const { __setCallImpl, __getCallMock } = require('../utils/openaiClient');
    const mock = __getCallMock();
    mock
      .mockResolvedValueOnce({ message: { content: '{"status":"ERROR","summary":"bad"}' } })
      .mockResolvedValueOnce({ message: { content: '{"status":"OK","reasoning":"fixed","summary":"good","resources":{"diagram":{"content":"graph TD;A-->B;"}}}' } });
    __setCallImpl(mock);

    const agent = new TestAgent();
    const res = await agent.run({ userId: 'u2', journeyId: 'j2' }, { useCache: false });
    expect(res.status).toBe('OK');
    expect(res.reasoning).toContain('fixed');
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('retries when Mermaid content is unsafe then fixes output', async () => {
    const { __setCallImpl, __getCallMock } = require('../utils/openaiClient');
    const mock = __getCallMock();
    mock
      .mockResolvedValueOnce({
        message: {
          content: '{"status":"OK","reasoning":"first","summary":"bad mermaid","resources":{"diagram":{"content":"graph TD;A-->B;<script>alert(1)</script>"}}}'
        }
      })
      .mockResolvedValueOnce({
        message: {
          content: '{"status":"OK","reasoning":"second","summary":"clean","resources":{"diagram":{"content":"graph TD;A-->B;"}}}'
        }
      });
    __setCallImpl(mock);

    const agent = new TestAgent();
    const res = await agent.run({ userId: 'u3', journeyId: 'j3' }, { useCache: false });
    expect(res.status).toBe('OK');
    expect(res.resources.diagram.content).toContain('graph TD');
    expect(res.reasoning).toContain('second');
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
