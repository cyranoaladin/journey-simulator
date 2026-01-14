const { RAGClient } = require('../../orchestration/ragClient'); // Import for class reference if needed, but we mock module

describe('Phase 5 RAG Contracts (Isolated)', () => {
    let mockSearch;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        mockSearch = jest.fn();
    });

    test('Contract: RAG_MAX_TOPK clamp (999 -> 10)', async () => {
        await jest.isolateModules(async () => {
            // Mock RAGClient class
            jest.doMock('../../orchestration/ragClient', () => {
                return {
                    RAGClient: jest.fn().mockImplementation(() => ({
                        search: mockSearch.mockResolvedValue({ source: 'mock_remote', chunks: [] })
                    }))
                };
            });

            // Re-import service to force fresh instantiation with mocked client
            const { fetchRagContext } = require('../../orchestration/services/ragService');

            const req = { input: 'test', context: { rag: { topK: 999 } } };
            const selected = [{ agentId: 'TestAgent' }];
            const registryIndex = { TestAgent: { domain: 'test_domain', requiresRag: true } };
            const ops = { rag: {}, fallbacks: [] };

            await fetchRagContext({
                selected, registryIndex, allowRag: true, demoMode: false,
                req, routed: {}, payload: {}, getTraceId: () => 'trace-1', ops, logger: { warn: jest.fn() }
            });

            const searchCall = mockSearch.mock.calls[0][0];
            expect(searchCall.topK).toBe(10);
            expect(searchCall.topK).not.toBe(999);
        });
    });

    test('Contract: Collection Routing', async () => {
        await jest.isolateModules(async () => {
            jest.doMock('../../orchestration/ragClient', () => {
                return {
                    RAGClient: jest.fn().mockImplementation(() => ({
                        search: mockSearch.mockResolvedValue({ source: 'mock_remote', chunks: [] })
                    }))
                };
            });

            const { fetchRagContext } = require('../../orchestration/services/ragService');

            const req = { input: 'test' };
            const selected = [{ agentId: 'AgentA' }, { agentId: 'AgentB' }];
            const registryIndex = {
                AgentA: { domain: 'web3', requiresRag: true },
                AgentB: { domain: 'security', requiresRag: true }
            };
            const ops = { rag: {}, fallbacks: [] };

            await fetchRagContext({
                selected, registryIndex, allowRag: true, demoMode: false,
                req, routed: {}, payload: {}, getTraceId: () => 'trace-2', ops, logger: { warn: jest.fn() }
            });

            const searchCall = mockSearch.mock.calls[0][0];
            expect(searchCall.domain).toContain('web3');
            expect(searchCall.domain).toContain('security');
        });
    });

    test('Contract: Fallback Tagging on Error', async () => {
        await jest.isolateModules(async () => {
            jest.doMock('../../orchestration/ragClient', () => {
                return {
                    RAGClient: jest.fn().mockImplementation(() => ({
                        search: mockSearch.mockRejectedValue(new Error('RAG Down'))
                    }))
                };
            });

            const { fetchRagContext } = require('../../orchestration/services/ragService');

            const req = { input: 'test' };
            const selected = [{ agentId: 'TestAgent' }];
            const registryIndex = { TestAgent: { domain: 'test', requiresRag: true } };
            const ops = { rag: {}, fallbacks: [] };

            const result = await fetchRagContext({
                selected, registryIndex, allowRag: true, demoMode: false,
                req, routed: {}, payload: {}, getTraceId: () => 'trace-3', ops, logger: { warn: jest.fn() }
            });

            expect(ops.rag.mode).toBe('disabled');
            expect(ops.fallbacks).toContain('rag_disabled');
            expect(result.ragContext).toBeNull();
        });
    });
});
