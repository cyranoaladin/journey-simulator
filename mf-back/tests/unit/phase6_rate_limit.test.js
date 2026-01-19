const { LLMClient } = require('../../orchestration/llmClient');
jest.mock('../../utils/openaiClient', () => ({
    callGpt5: jest.fn(),
    DEFAULT_LLM_MODEL: 'gpt-4.1-mini'
}));
const { callGpt5 } = require('../../utils/openaiClient');

describe('Phase 6 B3: Rate Limit Chaos (429)', () => {
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

    test('Should detect 429 and return proper status', async () => {
        // Mock fail
        callGpt5.mockRejectedValue({
            message: 'Rate limit exceeded',
            status: 429
        });

        const start = Date.now();
        const result = await llm.generate({
            prompt: { system: 'sys', user: 'usr' },
            traceId: 'chaos-b3-429',
            agentId: 'RateLimitedAgent'
        });
        const duration = Date.now() - start;

        expect(result.status).toBe('FAIL');
        expect(result.text).toContain('LLM_FAIL');
        expect(result.error).toMatch(/limit/i);
        console.log(`SCENARIO_PASS: 429 handled. Duration: ${duration}ms`);
    });
});
