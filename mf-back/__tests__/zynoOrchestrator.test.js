jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([{ title: 'demo', content: 'Sample knowledge' }]),
  ingestDocument: jest.fn().mockResolvedValue([]),
  ingestDocumentsIfNeeded: jest.fn().mockResolvedValue([{ title: 'Intro Build', content: 'Phase actuelle : Build' }])
}));

const ragClient = require('../rag/ragClient');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');

describe('orchestrateZyno', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs all launch_nft agents in parallel and returns the template metadata', async () => {
    const result = await orchestrateZyno('We need an NFT drop', {
      userId: 'user-1',
      phase: 'Build',
      objective: 'Ship the NFT collection'
    });

    expect(result.intent).toBe('launch_nft');
    expect(result.mode).toBe('parallel');
    expect(result.executedAgents).toEqual(['NFTAgent', 'TokenAgent', 'CommunityAgent']);
    expect(result.parcoursTemplate?.templateId).toBe('nft_track');
    expect(Object.keys(result.results)).toEqual(
      expect.arrayContaining(['NFTAgent', 'TokenAgent', 'CommunityAgent'])
    );
    expect(result.results.NFTAgent.agent).toBe('NFTAgent');
    expect(ragClient.getRagSnippets).toHaveBeenCalled();
  });

  it('falls back to the default coach when no intent matches', async () => {
    const result = await orchestrateZyno('Just exploring the journey', {
      userId: 'user-2',
      phase: 'Discover'
    });

    expect(result.intent).toBe('default');
    expect(result.mode).toBe('sync');
    expect(result.executedAgents).toEqual(['CoachAgent']);
    expect(result.results.CoachAgent.agent).toBe('CoachAgent');
    expect(result.parcoursTemplate?.templateId).toBe('demo_day_track');
    expect(ragClient.getRagSnippets).toHaveBeenCalled();
  });

  it('executes sequential agents for product builds and returns ordered outputs', async () => {
    ragClient.getRagSnippets.mockResolvedValueOnce([{ title: 'deck', content: 'Pitch guidance' }]);

    const result = await orchestrateZyno('Time to build a working prototype', {
      userId: 'user-3',
      phase: 'Build',
      journey: { id: 'journey-42' }
    });

    expect(result.intent).toBe('product_build');
    expect(result.mode).toBe('sequential');
    expect(result.executedAgents).toEqual(['BuilderAgent', 'ProductAgent', 'DevAgent', 'AuditAgent']);
    expect(Object.keys(result.results)).toEqual(
      expect.arrayContaining(['BuilderAgent', 'ProductAgent', 'DevAgent', 'AuditAgent'])
    );
    expect(result.results.BuilderAgent.references[0].title).toBe('deck');
    expect(result.parcoursTemplate?.templateId).toBe('demo_day_track');
  });
});
