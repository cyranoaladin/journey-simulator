const { LLMClient } = require('../../src/orchestration/llmClient');
jest.mock('../../src/utils/openaiClient', () => ({
    callGpt5: jest.fn(),
    DEFAULT_LLM_MODEL: 'gpt-4.1-mini'
}));
const { callGpt5 } = require('../../src/utils/openaiClient');

describe('Phase 6 B1: LLM Failure Chaos', () => {
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

    test('Should handle 403 Forbidden safely without crashing', async () => {
        callGpt5.mockRejectedValue({
            message: 'Forbidden: Invalid API Key',
            response: { status: 403 }
        });

        const result = await llm.generate({
            prompt: { system: 'sys', user: 'usr' },
            traceId: 'chaos-b1-403',
            agentId: 'ChaosAgent'
        });

        expect(result.status).toBe('FAIL');
        expect(result.text).toContain('LLM_FAIL');
        expect(result.error).toContain('Forbidden');
        console.log('SCENARIO_PASS: 403 handled gracefully');
    });

    test('Should handle Model Not Found safely', async () => {
        callGpt5.mockRejectedValue({
            message: 'Model not found',
            response: { status: 404 }
        });

        const result = await llm.generate({
            prompt: { system: 'sys', user: 'usr' },
            traceId: 'chaos-b1-404',
            agentId: 'ChaosAgent'
        });

        expect(result.status).toBe('FAIL');
        expect(result.text).toContain('LLM_FAIL');
        console.log('SCENARIO_PASS: 404 Model Not Found handled');
    });
});
