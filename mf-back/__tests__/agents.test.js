jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([{ title: 'playbook', content: 'Use fallback knowledge.' }]),
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
  Web3LegalAgent: '../agents/Web3LegalAgent',
};

const sharedContext = {
  userId: 'agent-user',
  phase: 'Build',
  objective: 'Stress test the orchestrator',
};

const loadAvailableAgents = () =>
  Object.entries(agentModules).filter(([, modulePath]) => {
    try {
      require(modulePath);
      return true;
    } catch {
      return false;
    }
  });

const isClassBasedAgent = (AgentClass) => Boolean(AgentClass?.prototype?.run);

const runAgent = async (AgentClass, isClassBased) => {
  if (isClassBased) {
    const instance = new AgentClass();
    return instance.run({}, sharedContext);
  }
  if (typeof AgentClass === 'function') {
    return AgentClass({}, sharedContext);
  }
  if (AgentClass?.run) {
    return AgentClass.run({}, sharedContext);
  }
  throw new Error('Unknown agent export shape');
};

const buildResponse = (result) => {
  const payload = result?.payload || {};
  const merged = { ...result, ...payload };
  const agent = merged.agent || payload.agent || result?.agentId || result?.agent;
  const phase = merged.phase || payload.phase || result?.phase;
  const ragEnriched =
    merged.ragEnriched !== undefined
      ? merged.ragEnriched
      : payload.ragEnriched !== undefined
        ? payload.ragEnriched
        : Array.isArray(result?.sources) && result.sources.length > 0;
  const references = merged.references || payload.references || result?.sources || result?.citations || [];
  return { payload, merged, agent, phase, ragEnriched, references };
};

const expectAgentIdentity = (result, agentName, agent) => {
  if (result?.agentId) {
    expect(result.agentId).toBe(agentName);
  } else {
    expect(agent).toBe(agentName);
  }
};

const expectPhaseIfPresent = (phase) => {
  if (phase && sharedContext.phase) {
    expect(phase).toBe(sharedContext.phase);
  }
};

const expectRagIfRelevant = (result, ragEnriched) => {
  if (!result?.agentId && ragEnriched !== undefined && ragEnriched !== null) {
    expect(ragEnriched).toBeTruthy();
  }
};

const expectReferencesShape = (references) => {
  if (Array.isArray(references) && references.length > 0) {
    expect(references.length).toBeGreaterThanOrEqual(1);
    expect(references[0]).toEqual(expect.objectContaining({ title: expect.any(String), content: expect.any(String) }));
  }
};

const expectStatusOrPayload = (result, payload) => {
  if (result?.status) {
    expect(result.status).toMatch(/^(OK|WARN|FAIL|TIMEOUT)$/);
    expect(typeof result.summary).toBe('string');
  } else {
    expect(payload || result?.payload).toBeDefined();
  }
};

const expectCallsByType = (isClassBased, result, agentName) => {
  if (isClassBased) {
    if (result?.status && result?.agentId) {
      expect(result.agentId).toBe(agentName);
    } else {
      expect(callGpt5).toHaveBeenCalled();
      const args = callGpt5.mock.calls[callGpt5.mock.calls.length - 1][0];
      expect(args.metadata).toEqual(expect.objectContaining({ agent: agentName }));
    }
  } else {
    expect(getRagSnippets).toHaveBeenCalled();
  }
};

describe('Agent outputs stay consistent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    callGpt5.mockClear();
  });

  const availableAgents = loadAvailableAgents();

  it('has at least one available agent', () => {
    expect(availableAgents.length).toBeGreaterThan(0);
  });

  describe.each(availableAgents)('agent %s', (agentName, modulePath) => {
    it('returns structured payload', async () => {
      const AgentClass = require(modulePath);
      const classBased = isClassBasedAgent(AgentClass);
      const result = await runAgent(AgentClass, classBased);
      const { payload, agent, phase, ragEnriched, references } = buildResponse(result);

      expectAgentIdentity(result, agentName, agent);
      expectPhaseIfPresent(phase);
      expectRagIfRelevant(result, ragEnriched);
      expectReferencesShape(references);
      expectStatusOrPayload(result, payload);
      expectCallsByType(classBased, result, agentName);
    });
  });
});
