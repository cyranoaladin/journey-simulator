process.env.JWT_SECRET = 'test-secret';

jest.mock('../models/agent-run', () => {
  const mock = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
  };
  return mock;
});

jest.mock('../utils/agent-idempotence', () => ({
    findOrCreateAgentRun: jest.fn(),
    generateIdempotencyKey: jest.fn().mockReturnValue('mock-key')
}));

// Mock getRagSnippets and callGpt5
jest.mock('../rag/ragClient', () => ({
    getRagSnippets: jest.fn().mockResolvedValue([])
}));

jest.mock('../utils/openaiClient', () => ({
    callGpt5: jest.fn().mockResolvedValue({ message: { content: '{"status":"ok"}' } }),
    DEFAULT_LLM_MODEL: 'gpt-5-turbo',
    DEFAULT_LLM_TEMPERATURE: 0.7,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS: 1000
}));

const AgentRun = require('../models/agent-run');
const BaseAgent = require('../agents/BaseAgent');
const agentRunController = require('../controllers/agent-run-controller');
const { findOrCreateAgentRun } = require('../utils/agent-idempotence');

describe('Agent Runs Logging', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('logs agent run start and success', async () => {
        class TestAgent extends BaseAgent {
            buildSystemPrompt() { return 'sys'; }
            buildUserPrompt() { return 'user'; }
        }
        const agent = new TestAgent('TestAgent');
        
        const mockAgentRun = {
            status: 'started',
            save: jest.fn().mockResolvedValue(true)
        };
        findOrCreateAgentRun.mockResolvedValue({ run: mockAgentRun, isNew: true });

        await agent.run({ userId: 'u1', journeyId: 'j1', phaseId: 'p1' });

        expect(findOrCreateAgentRun).toHaveBeenCalledWith(expect.objectContaining({
            agentName: 'TestAgent',
            journeyId: 'j1'
        }));
        expect(mockAgentRun.status).toBe('succeeded');
        expect(mockAgentRun.save).toHaveBeenCalled();
    });

    it('logs agent run failure', async () => {
        class TestAgent extends BaseAgent {
            buildSystemPrompt() { return 'sys'; }
            buildUserPrompt() { return 'user'; }
        }
        const agent = new TestAgent('TestAgent');
        
        // Mock failure in callGpt5
        require('../utils/openaiClient').callGpt5.mockRejectedValueOnce(new Error('LLM Error'));

        const mockAgentRun = {
            status: 'started',
            save: jest.fn().mockResolvedValue(true)
        };
        findOrCreateAgentRun.mockResolvedValue({ run: mockAgentRun, isNew: true });

        await expect(agent.run({ userId: 'u1', journeyId: 'j1' })).rejects.toThrow('LLM Error');

        expect(mockAgentRun.status).toBe('failed');
        expect(mockAgentRun.error).toEqual(expect.objectContaining({ message: 'LLM Error' }));
        expect(mockAgentRun.save).toHaveBeenCalled();
    });
});

describe('Agent Runs Controller', () => {
    it('gets agent runs with pagination', async () => {
        const req = { query: { journeyId: 'j1', page: 1, limit: 10 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        AgentRun.find.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(['run1'])
        });
        AgentRun.countDocuments.mockResolvedValue(1);

        await agentRunController.getAgentRuns(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: ['run1']
        }));
    });
});
