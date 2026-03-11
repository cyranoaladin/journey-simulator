const MintingAgent = require('../../src/agents/MintingAgent');
const TokenAgent = require('../../src/agents/TokenAgent');

describe('Testnet v0: Web3 Agents Simulation Compliance', () => {
    // This test suite focuses on the CONTENT of the simulation logic, ensuring it allows 'planning' 
    // but marks it as simulated.

    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV, MFAI_ONCHAIN_MODE: 'connect-only', NODE_ENV: 'test' };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    test('MintingAgent simulates deployment (returns specs but no tx)', async () => {
        const agent = new MintingAgent();
        agent.llm = {
            generate: jest.fn().mockResolvedValue({
                text: JSON.stringify({
                    status: 'OK',
                    mint_specs: { price: 1 },
                    resources: {},
                    actions: ['Deploy Candy Machine'] // Agent suggests action
                }),
                latencyMs: 1,
                tokensUsed: 10
            })
        };

        const res = await agent.run({ traceId: 'sim-test', input: 'Deploy a collection' });

        expect(res.status).toBe('OK');
        expect(res.actions).toContain('Deploy Candy Machine'); // Action implies intent
        expect(res.onchainExecuted).toBe(false); // BUT executed is FALSE
        expect(res.mode).toBe('simulated');
    });

    test('TokenAgent simulates airdrop (returns model but no tx)', async () => {
        const agent = new TokenAgent();
        agent.llm = {
            generate: jest.fn().mockResolvedValue({
                text: JSON.stringify({
                    status: 'OK',
                    token_model: { supply: 1000 },
                    actions: ['Execute Airdrop']
                }),
                latencyMs: 1,
                tokensUsed: 10
            })
        };

        const res = await agent.run({ traceId: 'sim-test-2', input: 'Airdrop to 100 users' });

        expect(res.onchainExecuted).toBe(false);
        expect(res.mode).toBe('simulated');
    });
});
