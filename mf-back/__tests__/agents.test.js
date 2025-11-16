jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([{ title: 'playbook', content: 'Use fallback knowledge.' }])
}));

const { getRagSnippets } = require('../rag/ragClient');

const agentModules = {
  AuditAgent: '../agents/AuditAgent',
  BuilderAgent: '../agents/BuilderAgent',
  CoachAgent: '../agents/CoachAgent',
  CommunityAgent: '../agents/CommunityAgent',
  DAOAgent: '../agents/DAOAgent',
  DevAgent: '../agents/DevAgent',
  GrowthAgent: '../agents/GrowthAgent',
  GuideAgent: '../agents/GuideAgent',
  InvestorAgent: '../agents/InvestorAgent',
  LaunchpadAgent: '../agents/LaunchpadAgent',
  NFTAgent: '../agents/NFTAgent',
  OnboardingAgent: '../agents/OnboardingAgent',
  PitchAgent: '../agents/PitchAgent',
  ProductAgent: '../agents/ProductAgent',
  ReflectionAgent: '../agents/ReflectionAgent',
  TokenAgent: '../agents/TokenAgent',
  Web3LegalAgent: '../agents/Web3LegalAgent'
};

describe('Agent outputs stay consistent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sharedContext = {
    userId: 'agent-user',
    phase: 'Build',
    objective: 'Stress test the orchestrator'
  };

  for (const [agentName, modulePath] of Object.entries(agentModules)) {
    it(`returns structured payload for ${agentName}`, async () => {
      const agent = require(modulePath);
      const result = await agent({}, sharedContext);

      expect(result.agent).toBe(agentName);
      expect(result.phase).toBe(sharedContext.phase);
      expect(result.ragEnriched).toBeTruthy();
      expect(result.references).toEqual([{ title: 'playbook', content: 'Use fallback knowledge.' }]);
      expect(result.payload).toBeDefined();
      expect(getRagSnippets).toHaveBeenCalled();
    });
  }
});
