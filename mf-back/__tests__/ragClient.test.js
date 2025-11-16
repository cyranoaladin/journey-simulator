const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

describe('ragClient resilience', () => {
  let tempDir;
  let ragClient;
  let warnSpy;

  beforeEach(() => {
    axios.post.mockReset();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-client-'));
    process.env.RAG_DATA_PATH = tempDir;
    process.env.RAG_SEARCH_URL = 'http://localhost/mock-search';
    process.env.RAG_INGEST_URL = 'http://localhost/mock-ingest';
    process.env.RAG_API_KEY = 'test-key';

    fs.writeFileSync(path.join(tempDir, 'fallback-guide.txt'), 'This fallback doc helps with DAO launches.', 'utf8');

    delete require.cache[require.resolve('../rag/ragClient')];
    ragClient = require('../rag/ragClient');
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.RAG_DATA_PATH;
    delete process.env.RAG_SEARCH_URL;
    delete process.env.RAG_INGEST_URL;
    delete process.env.RAG_API_KEY;
  });

  it('returns local snippets when the upstream RAG service fails', async () => {
    axios.post.mockRejectedValue(new Error('RAG search unavailable'));

    const snippets = await ragClient.getRagSnippets({ query: 'DAO' });

    expect(axios.post).toHaveBeenCalled();
    expect(snippets).toHaveLength(1);
    expect(snippets[0].title).toBe('fallback-guide');
    expect(snippets[0].content).toContain('fallback doc');
  });

  it('persists ingested documents locally if the remote service is down', async () => {
    axios.post.mockRejectedValue(new Error('RAG ingest offline'));

    const result = await ragClient.ingestDocument('DAO operations handbook', {
      title: 'DAO Playbook',
      type: 'text/plain'
    });

    expect(axios.post).toHaveBeenCalled();
    const fallbackSnippets = await ragClient.getRagSnippets({ query: 'DAO' });
    const storedSnippet = fallbackSnippets.find((snippet) =>
      snippet.content.includes('DAO operations handbook')
    );

    expect(storedSnippet).toBeDefined();
    expect(result[0].title).toBe('DAO Playbook');
    expect(result[0].content).toBe('DAO operations handbook');
  });
});
