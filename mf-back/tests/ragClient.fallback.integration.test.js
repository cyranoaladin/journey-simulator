/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

describe('ragClient local fallback scenarios', () => {
  let tempDir;
  let ragClient;
  let warnSpy;

  beforeEach(() => {
    axios.post.mockReset();
    axios.post.mockRejectedValue(new Error('offline'));
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-fallback-'));
    process.env.RAG_SEARCH_URL = 'http://remote/search';
    process.env.RAG_INGEST_URL = 'http://remote/ingest';
    process.env.RAG_API_KEY = '';
    process.env.RAG_COLLECTION = 'fallback';
  });

  afterEach(() => {
    warnSpy.mockRestore();
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.RAG_DATA_PATH;
    delete process.env.RAG_SEARCH_URL;
    delete process.env.RAG_INGEST_URL;
    delete process.env.RAG_API_KEY;
    delete process.env.RAG_COLLECTION;
  });

  it('returns an empty array when the fallback directory does not exist', async () => {
    process.env.RAG_DATA_PATH = path.join(tempDir, 'missing');
    delete require.cache[require.resolve('../rag/ragClient')];
    ragClient = require('../src/rag/ragClient');

    const results = await ragClient.getRagSnippets('anything');
    expect(results).toEqual([]);
  });

  it('serves locally persisted documents through the fallback search', async () => {
    process.env.RAG_DATA_PATH = tempDir;
    delete require.cache[require.resolve('../rag/ragClient')];
    ragClient = require('../src/rag/ragClient');

    await ragClient.ingestDocument('Local DAO handbook', {
      title: 'DAO Local',
      type: 'text/plain'
    });

    axios.post.mockClear();
    axios.post.mockRejectedValue(new Error('offline')); // ensure search uses fallback

    const results = await ragClient.getRagSnippets('dao');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((snippet) => snippet.title.includes('dao-local'))).toBe(true);
  });

  it('skips remote persistence when no content is provided to ingestDocument', async () => {
    process.env.RAG_DATA_PATH = tempDir;
    delete require.cache[require.resolve('../rag/ragClient')];
    ragClient = require('../src/rag/ragClient');

    const response = await ragClient.ingestDocument('', { title: 'EmptyDoc', type: 'text/plain' });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(response).toEqual([]);
  });
});
