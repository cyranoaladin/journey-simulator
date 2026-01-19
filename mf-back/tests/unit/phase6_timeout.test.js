const { LLMClient } = require('../../orchestration/llmClient');
jest.mock('../../utils/openaiClient', () => ({
    callGpt5: jest.fn(),
    DEFAULT_LLM_MODEL: 'gpt-4.1-mini'
}));
const { callGpt5 } = require('../../utils/openaiClient');

describe('Phase 6 B4: Timeout Chaos', () => {
    let llm;
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...ORIGINAL_ENV, NODE_ENV: 'test', FORCE_REAL_LLM: 'true', OPENAI_API_KEY: 'sk-test' };
        llm = new LLMClient({ provider: 'openai', model: 'gpt-4o-chaos' });
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    test('Should handle upstream timeout gracefully', async () => {
        // Mock a timeout error thrown by openaiClient
        callGpt5.mockRejectedValue(new Error('Timeout awaiting response'));

        const result = await llm.generate({
            prompt: { system: 'sys', user: 'usr' },
            traceId: 'chaos-b4-timeout',
            agentId: 'SlowAgent'
        });

        expect(result.status).toBe('FAIL');
        expect(result.text).toContain('LLM_FAIL');
        expect(result.error).toMatch(/Timeout/i);
        console.log('SCENARIO_PASS: Timeout caught and reported');
    });
});
