const MintingAgent = require('../../agents/MintingAgent');
const TokenAgent = require('../../agents/TokenAgent');
const DAOAgent = require('../../agents/DAOAgent');

describe('Testnet v0 Global Guard: Onchain Interactions Disabled', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV, MFAI_ONCHAIN_MODE: 'connect-only', NODE_ENV: 'test' };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    test('MintingAgent returns mode=simulated and onchainExecuted=false', async () => {
        const agent = new MintingAgent();
        // Mock LLM to avoid real calls
        agent.llm = { generate: jest.fn().mockResolvedValue({ text: '{}', latencyMs: 0, tokensUsed: 0 }) };

        const res = await agent.run({ traceId: 'test-guard', input: 'Deploy contract' });

        expect(res.mode).toBe('simulated');
        expect(res.onchainExecuted).toBe(false);
        expect(res.limits).toContain('Simulation only — no on-chain execution in Testnet v0');
    });

    test('TokenAgent returns mode=simulated and onchainExecuted=false', async () => {
        const agent = new TokenAgent();
        agent.llm = { generate: jest.fn().mockResolvedValue({ text: '{}', latencyMs: 0, tokensUsed: 0 }) };

        const res = await agent.run({ traceId: 'test-guard', input: 'Airdrop tokens' });

        expect(res.mode).toBe('simulated');
        expect(res.onchainExecuted).toBe(false);
    });

    test('DAOAgent returns mode=simulated and onchainExecuted=false', async () => {
        const agent = new DAOAgent();
        agent.llm = { generate: jest.fn().mockResolvedValue({ text: '{}', latencyMs: 0, tokensUsed: 0 }) };

        const res = await agent.run({ traceId: 'test-guard', input: 'Vote on proposal' });

        expect(res.mode).toBe('simulated');
        expect(res.onchainExecuted).toBe(false);
    });

    // Strategy Check: ensure accidental removal of flag fails test
    test('Guard FAILS if env is NOT connect-only (sanity check)', async () => {
        process.env.MFAI_ONCHAIN_MODE = 'full-enable';
        const agent = new MintingAgent();
        agent.llm = { generate: jest.fn().mockResolvedValue({ text: '{}', latencyMs: 0, tokensUsed: 0 }) };
        const res = await agent.run({ traceId: 'test-guard-fail', input: 'Deploy' });
        expect(res.mode).toBeUndefined(); // Or not 'simulated'
        expect(res.onchainExecuted).toBeUndefined(); // Or whatever default is
    });
});
