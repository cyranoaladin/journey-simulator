/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const request = require('supertest');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

jest.mock('../src/rag/ragClient', () => ({
  ingestDocument: jest.fn()
}));

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined)
  };
});

// Mock orchestration dependencies to prevent module loading errors when app.js loads routes
jest.mock('../src/orchestration/vsliceSchema', () => ({
  validateRequest: jest.fn((payload) => ({
    req: payload || {},
    warnings: []
  })),
  sanitizeAgentResponse: jest.fn((raw) => ({
    response: raw || {},
    warnings: []
  }))
}));

jest.mock('@mocks/orchestration', () => ({
  orchestrateVerticalSlice: jest.fn()
}));

jest.mock('../src/orchestration/zynoOrchestrator', () => ({
  orchestrateZyno: jest.fn()
}));

jest.mock('@mocks/orchestration-gate', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/gate/:gateId/review', (req, res) => {
    res.json({ status: 'mocked' });
  });
  return router;
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
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27018/test-e2e';

    // Re-require after env vars are set to ensure mocks are applied
    jest.resetModules();
    app = require('@mocks/app');
    const ragClient = require('../src/rag/ragClient');
    ingestDocument = ragClient.ingestDocument;

    // Ensure ingestDocument is a mock function
    if (typeof ingestDocument !== 'function' || !ingestDocument.mock) {
      throw new Error('ingestDocument is not properly mocked');
    }
  });

  afterEach(() => {
    // Only call mockReset if ingestDocument is actually a mock
    if (ingestDocument && typeof ingestDocument.mockReset === 'function') {
      ingestDocument.mockReset();
    } else if (ingestDocument && typeof ingestDocument.mockClear === 'function') {
      ingestDocument.mockClear();
    }
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

    delete require.cache[require.resolve('@mocks/app')];
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
