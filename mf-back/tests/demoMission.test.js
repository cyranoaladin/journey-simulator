/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

jest.mock('../src/rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([
    { title: 'demo knowledge base', content: 'Guidance for the demo mission.' }
  ]),
  ingestDocument: jest.fn().mockResolvedValue([]),
  ingestDocumentsIfNeeded: jest.fn().mockResolvedValue([])
}));

jest.mock('../src/utils/openaiClient', () => ({
  callGpt5: jest.fn().mockResolvedValue({
    message: { content: JSON.stringify({ global_score: 10, feedback: "Mock feedback", axes: [], reasoning: "Mock reasoning" }) }
  }),
  DEFAULT_LLM_MODEL: 'gpt-mock',
  DEFAULT_LLM_TEMPERATURE: 0,
  DEFAULT_LLM_MAX_OUTPUT_TOKENS: 100
}));

const ragClient = require('../src/rag/ragClient');
const { orchestrateZyno } = require('../src/orchestration/zynoOrchestrator');

const fixturePath = path.join(__dirname, 'fixtures', 'demo_mission.json');
const missionFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

describe('Demo mission orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('replays the demo mission scenario and returns structured agent outputs', async () => {
    const result = await orchestrateZyno(missionFixture.input, missionFixture.context);

    expect(result.intent).toBe(missionFixture.expectedIntent);
    expect(result.mode).toBe(missionFixture.expectedMode);
    expect(result.executedAgents).toBeDefined();
    missionFixture.expectedAgents.forEach(agent => {
      expect(result.executedAgents).toContain(agent);
    });

    expect(result.results).toBeDefined();
    missionFixture.expectedAgents.forEach(agent => {
      expect(Object.keys(result.results)).toContain(agent);
    });

    expect(result.timeline.length).toBeGreaterThan(0);
    const timelineAgents = result.timeline.map((entry) => entry.agent);
    missionFixture.expectedAgents.forEach((agent) => {
      expect(timelineAgents).toContain(agent);
    });

    expect(result.currentStep).not.toBeNull();
    if (result.currentStep) {
      expect(missionFixture.expectedAgents).toContain(result.currentStep.agent);
      expect(result.currentStep.reasoning || result.currentStep.action).toBeTruthy();
    }

    expect(ragClient.getRagSnippets).toHaveBeenCalled();
  });
});
