/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../utils/openaiClient', () => {
  let callCount = 0;
  return {
    DEFAULT_LLM_MODEL: 'mock',
    DEFAULT_LLM_TEMPERATURE: 0,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS: 100,
    callGpt5: async ({ messages }) => {
      callCount += 1;
      if (callCount === 1) {
        return { message: { content: '{"status":"ERROR","summary":"bad output"}' } };
      }
      return {
        message: {
          content: JSON.stringify({
            status: 'OK',
            reasoning: 'Auto-corrected after error',
            summary: 'Fixed',
            resources: { diagram: { content: 'graph TD; A-->B;' } },
          }),
        },
      };
    },
    __reset: () => {
      callCount = 0;
    },
  };
});

jest.mock('../utils/agent-idempotence', () => ({
  findOrCreateAgentRun: jest.fn().mockResolvedValue({ run: null, isNew: true }),
  generateIdempotencyKey: jest.fn().mockReturnValue('idempo'),
}));

jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([]),
}));

const BaseAgent = require('../agents/BaseAgent');

class TestAgent extends BaseAgent {
  constructor() {
    super('TestAgent');
  }
  buildSystemPrompt() { return 'system'; }
  buildUserPrompt() { return 'user'; }
  parseOutput(text) { return JSON.parse(text); }
}

describe('BaseAgent resilience with auto-reprompt', () => {
  const { __reset } = require('../utils/openaiClient');

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
