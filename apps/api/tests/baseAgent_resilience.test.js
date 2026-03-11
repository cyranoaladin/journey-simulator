/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../src/llm/OpenAIClient', () => {
  let callCount = 0;
  return {
    DEFAULT_MODEL: 'mock',
    DEFAULT_TEMPERATURE: 0,
    DEFAULT_MAX_TOKENS: 100,
    callLLM: async ({ messages }) => {
      callCount += 1;
      if (callCount === 1) {
        return { content: '{"status":"ERROR","summary":"bad output"}' }; // callLLM returns { content: string } usually
      }
      return {
        content: JSON.stringify({
          status: 'OK',
          reasoning: 'Auto-corrected after error',
          summary: 'Fixed',
          resources: { diagram: { content: 'graph TD; A-->B;' } },
        }),
      };
    },
    __reset: () => {
      callCount = 0;
    },
  };
});

jest.mock('@mocks/utils', () => ({
  findOrCreateAgentRun: jest.fn().mockResolvedValue({ run: null, isNew: true }),
  generateIdempotencyKey: jest.fn().mockReturnValue('idempo'),
}));

jest.mock('../src/rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([]),
}));

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
  const { __reset } = require('../src/llm/OpenAIClient');

  beforeEach(() => {
    __reset();
  });

  it('re-prompts once when status is ERROR and returns corrected payload', async () => {
    const agent = new TestAgent();
    const res = await agent.run({ userId: 'u1', journeyId: 'j1' }, { useCache: false });
    expect(res.status).toBe('OK');
    expect(res.reasoning).toContain('Auto-corrected');
    expect(res.resources.diagram.content).toMatch(/^graph\s+TD/);
  });
});
