const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../rag/ragClient', () => ({
  ingestDocument: jest.fn()
}));

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined)
  };
});

describe('Admin RAG routes end-to-end', () => {
  let app;
  let ingestDocument;
  let tempDocsDir;
  let originalAdminKey;
  let originalRagPath;
  let originalMongoUri;

  beforeAll(() => {
    tempDocsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-e2e-'));
    originalAdminKey = process.env.ADMIN_API_KEY;
    originalRagPath = process.env.RAG_DATA_PATH;
    originalMongoUri = process.env.MONGO_URI;

    process.env.ADMIN_API_KEY = 'secret';
    process.env.RAG_DATA_PATH = tempDocsDir;
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/test-e2e';

    app = require('../app');
    ({ ingestDocument } = require('../rag/ragClient'));
  });

  afterEach(() => {
    ingestDocument.mockReset();
    if (tempDocsDir && fs.existsSync(tempDocsDir)) {
      for (const file of fs.readdirSync(tempDocsDir)) {
        fs.rmSync(path.join(tempDocsDir, file), { force: true });
      }
    }
  });

  afterAll(() => {
    if (tempDocsDir) {
      fs.rmSync(tempDocsDir, { recursive: true, force: true });
    }

    if (originalAdminKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalAdminKey;
    }

    if (originalRagPath === undefined) {
      delete process.env.RAG_DATA_PATH;
    } else {
      process.env.RAG_DATA_PATH = originalRagPath;
    }

    if (originalMongoUri === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = originalMongoUri;
    }

    delete require.cache[require.resolve('../app')];
    delete require.cache[require.resolve('../rag/ragClient')];
  });

  it('allows an admin to upload and list RAG documents', async () => {
    ingestDocument.mockResolvedValue([
      { title: 'dao.md', content: 'DAO knowledge' }
    ]);

    const uploadResponse = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'secret')
      .attach('document', Buffer.from('DAO knowledge', 'utf8'), {
        filename: 'dao.md',
        contentType: 'text/markdown'
      })
      .expect(200);

    expect(uploadResponse.body).toEqual({
      status: 'success',
      details: [{ title: 'dao.md', content: 'DAO knowledge' }]
    });
    expect(ingestDocument).toHaveBeenCalledWith('DAO knowledge', {
      title: 'dao.md',
      type: 'text/markdown'
    });

    const storedPath = path.join(tempDocsDir, 'playbook.txt');
    fs.writeFileSync(storedPath, 'dao playbook', 'utf8');

    const listResponse = await request(app)
      .get('/admin/rag/documents')
      .set('x-api-key', 'secret')
      .expect(200);

    expect(listResponse.body.documents).toEqual([
      {
        name: 'playbook.txt',
        path: storedPath
      }
    ]);
  });
});
