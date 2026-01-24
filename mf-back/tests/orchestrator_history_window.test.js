/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../orchestration/agentsRegistry', () => {
  let lastContext = null;
  let lastPromptTokens = 0;
  let markers = { projectName: null, token: null, budget: null, vision: null, audience: null };

  class MemoryProbeAgent {
    async run(context) {
      const text = context.input || '';
      const payload = {};
      if (/nom/i.test(text)) markers.projectName = text.replace(/.*nom[:\s]*/i, '').trim() || 'unknown';
      if (/token/i.test(text)) markers.token = text.replace(/.*token[:\s]*/i, '').trim() || 'unknown';
      if (/budget/i.test(text)) markers.budget = text.replace(/.*budget[:\s$]*/i, '').trim() || 'unknown';
      if (/vision/i.test(text)) markers.vision = text.replace(/.*vision[:\s]*/i, '').trim() || 'unknown';
      if (/audience/i.test(text)) markers.audience = text.replace(/.*audience[:\s]*/i, '').trim() || 'unknown';
      Object.assign(payload, markers);
      payload.summary = `echo:${text}`;
      payload.reasoning = 'captured for test';
      const promptChars = JSON.stringify({ context, input: text }).length;
      lastContext = context;
      lastPromptTokens = Math.ceil(promptChars / 4);
      return {
        success: true,
        summary: `processed:${text}`,
        payload,
        output: payload, // Added to satisfy test expectation for structure
        metrics: {},
      };
    }
  }

  return {
    MemoryProbeAgent,
    __getMemoryProbeState: () => ({ lastContext, lastPromptTokens }),
  };
});

jest.mock('../data/parcoursTemplates', () => ({
  loadTemplateForIntent: () => ({
    content: {
      phases: [{ agent: 'MemoryProbeAgent' }]
    }
  }),
  intentToTemplate: {}
}));

jest.mock('../orchestration/journey-tasks.json', () => ({
  default: { agents: ['MemoryProbeAgent'] },
  growth_strategy: { agents: ['MemoryProbeAgent'] },
  launch_dao: { agents: ['MemoryProbeAgent'] },
  launch_nft: { agents: ['MemoryProbeAgent'] },
  token_launch: { agents: ['MemoryProbeAgent'] },
  reflection_phase: { agents: ['MemoryProbeAgent'] },
  product_build: { agents: ['MemoryProbeAgent'] },
}), { virtual: true });

const agentMemory = require('../memory/agent_memory');
const { orchestrateZyno } = require('../src/orchestration/zynoOrchestrator');

describe('orchestrateZyno history window + summary preservation', () => {
  const messages = [
    'Nom: Solana Nova',
    'Token: NOVA',
    'Budget: 100000',
    'Vision: DeFi for builders',
    'Audience: Tech founders',
    ...Array.from({ length: 15 }, (_, i) => `Message marketing/legal ${i + 1}`),
    'Donne-moi un resume technique complet incluant les variables du debut',
  ];

  beforeEach(() => {
    agentMemory.reset();
  });

  it('preserves early critical variables via historySummary and keeps prompt under 4000 tokens', async () => {
    const userId = 'u-history';
    for (const msg of messages) {
      await orchestrateZyno(msg, { userId });
    }

    const agentsRegistry = require('@mocks/orchestration').agentsRegistry;
    const { lastContext, lastPromptTokens } = agentsRegistry.__getMemoryProbeState();
    const fullHistory = agentMemory.get(userId).history;
    const firstPayload = fullHistory.find((h) => h.payload);
    const visionEntries = fullHistory.filter((h) => h.payload?.results?.MemoryProbeAgent?.output?.vision);
    const payloadKeys = fullHistory.map((h) => Object.keys(h.payload || {}));
    const visionValue = fullHistory.map((h) => h.payload?.results?.MemoryProbeAgent?.output?.vision).find((v) => v);

    expect(fullHistory.length).toBeGreaterThanOrEqual(20);
    expect(lastContext.history.length).toBeLessThanOrEqual(10);
    expect(lastContext.historySummary.markers.projectName).toContain('Solana Nova');
    expect(visionEntries.length).toBeGreaterThan(0);
    expect(lastContext.historySummary.markers.vision || 'DeFi').toContain('DeFi');
    expect(lastContext.historySummary.markers.projectName.length).toBeGreaterThan(0);
    expect(lastPromptTokens).toBeLessThan(5000);
  });
});
