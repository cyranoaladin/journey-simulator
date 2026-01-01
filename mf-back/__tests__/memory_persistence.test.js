const agentMemory = require('../memory/agent_memory');

let capturedContext = null;

jest.mock('../orchestration/agentsRegistry', () => ({
  MemoryProbeAgent: class {
    async run(input, context) {
      capturedContext = context;
      return {
        summary: context.history?.[0]?.note || 'missing history',
        response: context.history?.[0]?.note || 'missing history',
        metrics: {},
      };
    }
  },
}));

jest.mock('../orchestration/journey-tasks.json', () => ({
  default: { agents: ['MemoryProbeAgent'] },
  memory_check: { agents: ['MemoryProbeAgent'] },
}), { virtual: true });

describe('Memory persistence into agent context', () => {
  beforeEach(() => {
    capturedContext = null;
    agentMemory.reset();
  });

  it('injects history from agentMemory into orchestrateZyno context', async () => {
    const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
    const userId = 'memory-user';
    const historyNote = "Le projet s'appelle MFAI-Solana";
    agentMemory.update(userId, { history: [{ note: historyNote }] });

    await orchestrateZyno('memory_check', { userId, input: 'Comment s’appelle mon projet ?' });

    expect(capturedContext?.history?.[0]?.note).toContain('MFAI-Solana');
    expect(capturedContext?.userId).toBe(userId);
  });
});
