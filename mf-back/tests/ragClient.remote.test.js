/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('axios');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('ragClient remote success paths', () => {
  let ragClient;
  let tempDir;
  let axios;

  beforeEach(() => {
    jest.resetModules();
    axios = require('axios');
    axios.post.mockReset();

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-remote-'));
    process.env.RAG_DATA_PATH = tempDir;
    process.env.RAG_SEARCH_URL = 'http://remote/search';
    process.env.RAG_INGEST_URL = 'http://remote/ingest';
    process.env.RAG_API_KEY = 'remote-key';
    process.env.RAG_COLLECTION = 'remote-collection';

    ragClient = require('../rag/ragClient');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.RAG_DATA_PATH;
    delete process.env.RAG_SEARCH_URL;
    delete process.env.RAG_INGEST_URL;
    delete process.env.RAG_API_KEY;
    delete process.env.RAG_COLLECTION;
  });

  it('returns remote snippets when the upstream service succeeds', async () => {
    axios.post.mockResolvedValueOnce({ data: { snippets: [{ title: 'remote doc', content: 'From API' }] } });

    const results = await ragClient.getRagSnippets({ query: 'launch dao', userContext: { id: 'user-99' } });

    expect(axios.post).toHaveBeenCalledWith(
      'http://remote/search',
      {
        q: 'launch dao',
        collection: 'remote-collection',
        k: 5,
        include_documents: true,
        metadata: { user: 'user-99' }
      },
      { headers: { 'x-api-key': 'remote-key' }, timeout: 5000 }
    );
    expect(results[0]).toEqual(expect.objectContaining({
      title: 'remote doc',
      content: 'From API',
      text: 'From API',
      source: 'remote-collection'
    }));
  });

  it('returns remote ingestion metadata when the ingest service succeeds', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        documents: [
          {
            title: 'DAO Guide',
            content: 'A remote document'
          }
        ]
      }
    });

    const result = await ragClient.ingestDocument('A remote document', {
      title: 'DAO Guide',
      type: 'text/markdown'
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://remote/ingest',
      {
        collection: 'remote-collection',
        documents: [
          {
            title: 'DAO Guide',
            content: 'A remote document',
            metadata: {
              title: 'DAO Guide',
              type: 'text/markdown',
              uploadedAt: expect.any(String)
            }
          }
        ]
      },
      { headers: { 'x-api-key': 'remote-key' } }
    );
    expect(result).toEqual([
      {
        title: 'DAO Guide',
        content: 'A remote document'
      }
    ]);

    const storedFiles = fs.readdirSync(tempDir);
    expect(storedFiles.some((file) => file.includes('dao-guide'))).toBe(true);
  });

  it('ingests mission context documents when requested', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        documents: [
          {
            title: 'Intro Build',
            content: 'Phase actuelle : Build'
          }
        ]
      }
    });

    const result = await ragClient.ingestDocumentsIfNeeded({ userId: 'user-123', phase: 'Build' });

    expect(axios.post).toHaveBeenCalledWith(
      'http://remote/ingest',
      {
        collection: 'remote-collection',
        documents: [
          {
            title: 'Intro Build',
            content: 'Phase actuelle : Build',
            metadata: { userId: 'user-123', phase: 'Build' }
          }
        ]
      },
      { headers: { 'x-api-key': 'remote-key' } }
    );
    expect(result).toEqual([
      {
        title: 'Intro Build',
        content: 'Phase actuelle : Build'
      }
    ]);
  });
});
