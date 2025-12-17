require('dotenv').config({ quiet: true });

// jest.mock('../rag/ragClient'); // Removed to use real RAG

describe('orchestrateZyno', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('normalizes agent outputs, including references and AEPO metrics', async () => {
    const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');

    const result = await orchestrateZyno('Time to build a working prototype', {
      userId: 'user-3',
      phase: 'Build',
      journey: { id: 'journey-42' }
    });

    expect(result.executedAgents.length).toBeGreaterThan(0);
    expect(result.timeline.length).toBeGreaterThan(0);

    const agentName = result.executedAgents[0];
    const normalizedAgent = result.results[agentName];
    expect(normalizedAgent).toBeDefined();
    expect(Array.isArray(normalizedAgent.sources)).toBe(true);
    expect(normalizedAgent.metrics?.aepo).toBeGreaterThan(0);

    const timelineEntry = result.timeline.find((step) => step.agent === agentName);
    expect(timelineEntry).toBeDefined();
    expect(Array.isArray(timelineEntry.sources)).toBe(true);
    expect(timelineEntry.sources.length).toBe(normalizedAgent.sources.length);
    expect(timelineEntry.feedback?.aepo).toBeGreaterThan(0);
    expect(typeof timelineEntry.summary).toBe('string');
    expect(timelineEntry.summary.length).toBeGreaterThan(0);
  }, 60000);
});
