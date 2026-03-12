/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../src/services/llmRouter', () => {
  let mockCallCount = 0;
  return {
    routeWithFallback: async (messages, options) => {
      mockCallCount += 1;
      // Simulate error on first call, success on retry
      if (mockCallCount === 1) {
        // First call returns an ERROR response
        return { 
          content: '{"status":"ERROR","summary":"bad output","reasoning":"Initial error"}',
          fallback: false,
        };
      }
      // Second call (retry) returns success
      return {
        content: JSON.stringify({
          status: 'OK',
          reasoning: 'Auto-corrected after error',
          summary: 'Fixed',
          resources: { diagram: { content: 'graph TD; A-->B;' } },
        }),
        fallback: false,
      };
    },
    buildMFAISystemMessage: () => ({ role: 'system', content: 'test' }),
    __resetMock: () => { mockCallCount = 0; },
  };
});

jest.mock('@mocks/utils', () => ({
  findOrCreateAgentRun: jest.fn().mockResolvedValue({ run: null, isNew: true }),
  generateIdempotencyKey: jest.fn().mockReturnValue('idempo'),
}));

jest.mock('../src/rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([]),
}));

const { __resetMock } = require('../src/services/llmRouter');
const BaseAgent = require('../src/agents/BaseAgent');

class TestAgent extends BaseAgent {
  constructor() {
    super('TestAgent');
  }
  buildSystemPrompt() { return 'system'; }
  buildUserPrompt() { return 'user'; }
  parseOutput(text) { return JSON.parse(text); }
}

describe('BaseAgent resilience with auto-reprompt', () => {
  beforeEach(() => {
    __resetMock();
  });

  it('re-prompts once when status is ERROR and returns corrected payload', async () => {
    const agent = new TestAgent();
    const res = await agent.run({ userId: 'u1', journeyId: 'j1' }, { useCache: false });
    expect(res.status).toBe('OK');
    expect(res.reasoning).toContain('Auto-corrected');
    expect(res.resources.diagram.content).toMatch(/^graph\s+TD/);
  });
});
