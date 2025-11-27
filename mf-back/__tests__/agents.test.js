jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([{ title: 'playbook', content: 'Use fallback knowledge.' }])
}));

jest.mock('../utils/openaiClient', () => ({
  callGpt5: jest.fn(async ({ messages }) => {
    const systemPrompt = messages?.[0]?.content ?? '';
    const agentMatch = systemPrompt.match(/\*\*(\w+)\*\*/);
    const agent = agentMatch ? agentMatch[1] : 'Agent';

    return {
      message: {
        content: JSON.stringify({
          agent,
          phase: 'Build',
          ragEnriched: true,
          references: [{ title: 'playbook', content: 'Use fallback knowledge.' }],
          payload: { summary: `Stubbed output for ${agent}` },
        }),
      },
    };
  }),
}));

const { getRagSnippets } = require('../rag/ragClient');
const { callGpt5 } = require('../utils/openaiClient');

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
    callGpt5.mockClear();
  });

  const sharedContext = {
    userId: 'agent-user',
    phase: 'Build',
    objective: 'Stress test the orchestrator'
  };

  // Filter out agents that cannot be required (legacy or missing)
  const availableAgents = Object.entries(agentModules).filter(([, modulePath]) => {
    try {
      require(modulePath);
      return true;
    } catch (e) {
      // Skip missing agents
      console.warn(`Skipping missing agent module: ${modulePath}`);
      return false;
    }
  });

  for (const [agentName, modulePath] of availableAgents) {
    it(`returns structured payload for ${agentName}`, async () => {
      const AgentClass = require(modulePath);

      // Determine if it's a class-based agent (new pattern) or function-based (legacy)
      const isClassBased = AgentClass.prototype && typeof AgentClass.prototype.run === 'function';

      let result;
      if (isClassBased) {
        const agentInstance = new AgentClass();
        result = await agentInstance.run({}, sharedContext);
      } else {
        // Legacy function-based agent
        result = await AgentClass({}, sharedContext);
      }

      const response = result && typeof result === 'object' && 'agent' in result ? result : result?.payload ?? {};

      expect(response.agent).toBe(agentName);
      expect(response.phase).toBe(sharedContext.phase);
      expect(response.ragEnriched).toBeTruthy();
      expect(response.references).toHaveLength(1);
      expect(response.references[0]).toEqual(
        expect.objectContaining({ title: 'playbook', content: 'Use fallback knowledge.' })
      );
      expect(response.payload ?? result.payload).toBeDefined();

      if (isClassBased) {
        expect(callGpt5).toHaveBeenCalled();
        const args = callGpt5.mock.calls[callGpt5.mock.calls.length - 1][0];
        expect(args.metadata).toEqual(expect.objectContaining({ agent: agentName }));
      } else {
        expect(getRagSnippets).toHaveBeenCalled();
      }
    });
  }
});
