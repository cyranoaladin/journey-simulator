/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


jest.mock('@mocks/models', () => ({
    AgentRun: {
        findOne: jest.fn(),
        create: jest.fn(),
    }
}));

const { AgentRun } = require('@mocks/models');
const { findOrCreateAgentRun } = require('../src/utils/agent-idempotence');

describe('Agent Idempotence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates new run if none exists', async () => {
        // findOne returns query object which has sort method
        const sortMock = jest.fn().mockResolvedValue(null);
        AgentRun.findOne.mockReturnValue({ sort: sortMock });
        
        AgentRun.create.mockResolvedValue({ id: 'new-run', status: 'started' });

        const result = await findOrCreateAgentRun({ idempotencyKey: 'key', data: 'test' });

        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(AgentRun.create).toHaveBeenCalled();
        expect(result.isNew).toBe(true);
    });

    it('reuses existing run if succeeded', async () => {
        const existingRun = { id: 'existing', status: 'succeeded' };
        const sortMock = jest.fn().mockResolvedValue(existingRun);
        AgentRun.findOne.mockReturnValue({ sort: sortMock });

        const result = await findOrCreateAgentRun({ idempotencyKey: 'key', data: 'test' });

        expect(AgentRun.create).not.toHaveBeenCalled();
        expect(result.isNew).toBe(false);
        expect(result.run).toBe(existingRun);
    });

    it('creates new run if existing failed', async () => {
        const failedRun = { id: 'failed', status: 'failed' };
        const sortMock = jest.fn().mockResolvedValue(failedRun);
        AgentRun.findOne.mockReturnValue({ sort: sortMock });

        AgentRun.create.mockResolvedValue({ id: 'retry-run', status: 'started' });

        const result = await findOrCreateAgentRun({ idempotencyKey: 'key', data: 'test' });

        expect(AgentRun.create).toHaveBeenCalled();
        expect(result.isNew).toBe(true);
        expect(result.run.id).toBe('retry-run');
    });

    it('reuses existing run if started (in progress)', async () => {
        const runningRun = { id: 'running', status: 'started' };
        const sortMock = jest.fn().mockResolvedValue(runningRun);
        AgentRun.findOne.mockReturnValue({ sort: sortMock });

        const result = await findOrCreateAgentRun({ idempotencyKey: 'key', data: 'test' });

        expect(AgentRun.create).not.toHaveBeenCalled();
        expect(result.isNew).toBe(false);
        expect(result.run).toBe(runningRun);
    });
});
