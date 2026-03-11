/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour ragClient - utilisé dans tous les tests
 */

module.exports = {
  getRagSnippets: jest.fn().mockResolvedValue([
    { title: 'Mock RAG Document', content: 'Mock content for testing' }
  ]),
  queryRAG: jest.fn().mockResolvedValue({
    success: true,
    documents: [
      { title: 'Mock Doc 1', content: 'Content 1', relevance: 0.95 },
      { title: 'Mock Doc 2', content: 'Content 2', relevance: 0.88 }
    ]
  }),
  ingestDocumentsIfNeeded: jest.fn().mockResolvedValue({ success: true })
};
