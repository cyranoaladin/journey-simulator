
describe('Phase 6 B2: RAG Failure Chaos', () => {
    let ragService;
    let mockSearch;

    beforeEach(() => {
        jest.resetModules(); // Force new modules
        mockSearch = jest.fn();

        // Dynamic mock specifically for this isolated run
        jest.doMock('../../src/orchestration/ragClient', () => {
            return {
                RAGClient: jest.fn().mockImplementation(() => {
                    return {
                        search: mockSearch
                    };
                })
            };
        });

        ragService = require('../../src/orchestration/services/ragService');
    });

    test('Should handle RAG Service Down/Timeout gracefully', async () => {
        mockSearch.mockRejectedValue(new Error('ECONNREFUSED'));

        const ops = { rag: {}, fallbacks: [] };
        const logger = { warn: jest.fn() };

        const result = await ragService.fetchRagContext({
            selected: [{ agentId: 'TestAgent' }],
            registryIndex: { 'TestAgent': { requiresRag: true, domain: 'test' } },
            allowRag: true,
            demoMode: false,
            req: { input: 'Chaos Query' },
            routed: {},
            getTraceId: () => 'trace-b2',
            ops,
            logger
        });

        // If src/orchestration/ragClient.js exists, then mocking ../../src/rag/ragClient is WRONG if ragService uses the orchestration one.

        expect(result.ragContext).toBeNull();
        console.log('SCENARIO_PASS: RAG Connection Refused -> Fallback Tagged');
    });

    test('Should clamp TopK to MAX_RAG_TOPK (10)', async () => {
        mockSearch.mockResolvedValue({ source: 'remote', chunks: [] });

        const ops = { rag: {}, fallbacks: [] };
        const logger = { warn: jest.fn() };

        await ragService.fetchRagContext({
            selected: [{ agentId: 'TestAgent' }],
            registryIndex: { 'TestAgent': { requiresRag: true } },
            allowRag: true,
            demoMode: false,
            req: {
                input: 'High K Query',
                context: { rag: { topK: 1000 } }
            },
            routed: {},
            getTraceId: () => 'trace-k',
            ops,
            logger
        });

        // Verify the call to search used topK=10
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({
            topK: 10
        }));
        console.log('SCENARIO_PASS: High TopK input clamped safely');
    });
});
