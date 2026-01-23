/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const RAGOpsAgent = require('../agents/RAGOpsAgent');

describe('RAGOpsAgent strict grounding', () => {
  it('fails when no RAG citations are provided', async () => {
    const agent = new RAGOpsAgent();
    const res = await agent.run({ input: 'Test grounding without chunks', ragContext: { chunks: [] } });
    expect(res.status).toBe('FAIL');
    expect(res.errors).toContain('insufficient_rag_context');
    expect(res.summary).toMatch(/Insufficient information/);
  });

  it('accepts when RAG citations exist', async () => {
    const agent = new RAGOpsAgent();
    const res = await agent.run({
      input: 'Test grounding with chunks',
      ragContext: { chunks: [{ id: '1', title: 'Doc', source: 'local', text: 'content', score: 0.9 }] },
    });
    expect(res.status).toBe('OK');
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.details.rag.avgScore).toBeGreaterThanOrEqual(0);
  });

  it('fails when average score is below threshold', async () => {
    const agent = new RAGOpsAgent();
    const res = await agent.run({
      input: 'Low score test',
      ragContext: {
        chunks: [
          { id: '1', title: 'Doc', source: 'local', text: 'content', score: 0.4, file_path: '/tmp/a.md' },
          { id: '2', title: 'Doc2', source: 'local', text: 'content', score: 0.5, file_path: '/tmp/b.md' },
        ],
      },
    });
    expect(res.status).toBe('FAIL');
    expect(res.summary).toMatch(/Insufficient information/);
    expect(res.details.rag.avgScore).toBeLessThan(0.6);
  });
});
