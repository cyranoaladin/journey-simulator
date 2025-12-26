const express = require('express');
const request = require('supertest');

// Mock all orchestration dependencies to prevent module loading errors
jest.mock('../orchestration/zynoVerticalSlice', () => ({
  orchestrateVerticalSlice: jest.fn()
}));

jest.mock('../orchestration/ragClient', () => ({
  RAGClient: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue({ chunks: [], source: 'mock', latencyMs: 0 })
  }))
}));

jest.mock('../orchestration/zynoOrchestrator', () => ({
  orchestrateZyno: jest.fn()
}));

jest.mock('../models/agentFeedbackLog', () => ({
  create: jest.fn().mockResolvedValue({ _id: 'log-1' })
}));

jest.mock('../data/parcoursTemplates', () => ({
  listTemplates: jest.fn()
}));

jest.mock('../memory/agent_memory', () => ({
  getMemory: jest.fn(),
  saveMemory: jest.fn()
}));

jest.mock('../utils/aepoAeco', () => ({
  getOrchestrationGlossary: jest.fn().mockReturnValue({})
}));

const AgentLog = require('../models/agentFeedbackLog');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
const { listTemplates } = require('../data/parcoursTemplates');

describe('Zyno orchestration route', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/', require('../routes/zyno-routes'));
  });

  it('returns orchestration response enriched with templates and logs agent output', async () => {
    const orchestrationPayload = {
      executedAgents: ['NFTAgent', 'TokenAgent'],
      intent: 'launch_nft',
      mode: 'parallel',
      parcoursTemplate: { templateId: 'nft_track', fileName: 'nft_track.json' },
      results: {
        NFTAgent: {
          agent: 'NFTAgent',
          payload: { output: 'Prototype ready' },
          references: [{ title: 'deck', content: 'Bring assets' }],
          ae_summary: 'summary',
          ae_outcome: 'outcome'
        },
        TokenAgent: {
          agent: 'TokenAgent',
          payload: { output: 'Token plan' },
          references: [],
          ae_summary: 'token summary',
          ae_outcome: 'token outcome'
        }
      }
    };

    orchestrateZyno.mockResolvedValue(orchestrationPayload);
    listTemplates.mockReturnValue([
      { templateId: 'nft_track', fileName: 'nft_track.json' },
      { templateId: 'dao_track', fileName: 'dao_track.json' }
    ]);

    const response = await request(app)
      .post('/orchestration')
      .send({ input: 'We need an NFT launch', userId: 'user-77', phase: 'Build', journey: { id: 'J-1' } })
      .expect(200);

    expect(orchestrateZyno).toHaveBeenCalledWith('We need an NFT launch', expect.objectContaining({
      userId: 'user-77',
      phase: 'Build',
      journey: { id: 'J-1' }
    }));

    expect(listTemplates).toHaveBeenCalled();
    expect(response.body.executedAgents).toEqual(['NFTAgent', 'TokenAgent']);
    expect(response.body.availableTemplates).toEqual([
      { templateId: 'nft_track', fileName: 'nft_track.json' },
      { templateId: 'dao_track', fileName: 'dao_track.json' }
    ]);
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.results.NFTAgent.payload.output).toBe('Prototype ready');

    expect(AgentLog.create).toHaveBeenCalledTimes(2);
    expect(AgentLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-77',
        agentName: 'NFTAgent',
        payload: expect.objectContaining({
          agent: 'NFTAgent',
          payload: expect.objectContaining({ output: 'Prototype ready' }),
        }),
      })
    );
  });
});
