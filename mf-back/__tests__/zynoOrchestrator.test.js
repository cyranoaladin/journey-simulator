require('dotenv').config();

// jest.mock('../rag/ragClient'); // Removed to use real RAG

describe('orchestrateZyno', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('executes sequential agents, connects to OpenAI, and includes RAG context', async () => {
    jest.doMock('../utils/openaiClient', () => {
      const actual = jest.requireActual('../utils/openaiClient');
      const passthrough = async (options) => actual.callGpt5(options);
      return {
        ...actual,
        callGpt5: jest.fn(passthrough),
      };
    });

    const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
    const openaiClient = require('../utils/openaiClient');

    const result = await orchestrateZyno('Time to build a working prototype', {
      userId: 'user-3',
      phase: 'Build',
      journey: { id: 'journey-42' }
    });

    expect(result.executedAgents.length).toBeGreaterThan(0);
    expect(openaiClient.callGpt5).toHaveBeenCalled();

    const callArg = openaiClient.callGpt5.mock.calls.find((args) => {
      const messages = args[0]?.messages || [];
      return messages.some((msg) => msg.role === 'system' && msg.content.includes('--- RAG CONTEXT ---'));
    });

    expect(callArg).toBeDefined();

    const systemMessage = callArg[0].messages.find((msg) => msg.role === 'system');
    expect(systemMessage.content).toContain('--- RAG CONTEXT ---');
  }, 60000);
});
