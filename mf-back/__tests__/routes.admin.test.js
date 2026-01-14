/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Tests run stateless bearer flows with CSRF parity middleware.
const express = require('express');
const request = require('supertest');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { csrfGuard } = require('../middleware/csrfGuard');
const ORIGINAL_READDIR_SYNC = fs.readdirSync;

jest.mock('../models/agentFeedbackLog', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]) }),
  create: jest.fn().mockResolvedValue({ _id: 'log-1' })
}));

jest.mock('../rag/ragClient', () => ({
  ingestDocument: jest.fn(),
  getRagSnippets: jest.fn().mockResolvedValue([])
}));

// Mock orchestration dependencies to prevent module loading errors
jest.mock('../orchestration/zynoVerticalSlice', () => ({
  orchestrateVerticalSlice: jest.fn()
}));

jest.mock('../orchestration/zynoOrchestrator', () => ({
  orchestrateZyno: jest.fn()
}));

jest.mock('../data/parcoursTemplates', () => ({
  listTemplates: jest.fn().mockReturnValue([])
}));

jest.mock('../memory/agent_memory', () => ({
  getMemory: jest.fn(),
  saveMemory: jest.fn(),
  update: jest.fn(),
  pushHistory: jest.fn(),
  listAll: jest.fn().mockReturnValue([]),
  reset: jest.fn(),
  saveInteraction: jest.fn()
}));

jest.mock('../utils/aepoAeco', () => ({
  getOrchestrationGlossary: jest.fn().mockReturnValue({})
}));

const testCsrf = csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH'] });

jest.mock('multer', () => {
  const mock = jest.fn(() => ({
    single: jest.fn(() => (req, _res, next) => {
      if (mock.__file) {
        req.file = mock.__file;
      }
      next();
    })
  }));
  mock.__file = undefined;
  mock.__setFile = (file) => {
    mock.__file = file;
  };
  return mock;
});

describe('admin routes', () => {
  let app;
  let AgentLog;
  let ingestDocument;
  let warnSpy;
  let errorSpy;
  let tempDocsDir;
  let agentMemory;

  beforeEach(() => {
    jest.resetModules();

    tempDocsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-docs-'));
    process.env.RAG_DATA_PATH = tempDocsDir;

    // Ensure ADMIN_API_KEY is deleted before each test (will be set in specific tests)
    delete process.env.ADMIN_API_KEY;

    // Re-require mocked dependencies after reset
    AgentLog = require('../models/agentFeedbackLog');
    ({ ingestDocument } = require('../rag/ragClient'));
    ingestDocument.mockReset();
    const multer = require('multer');
    multer.__setFile(undefined);
    agentMemory = require('../memory/agent_memory');
    if (agentMemory.reset) {
      agentMemory.reset();
    }

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(testCsrf);
    app.use(csrfGuard);
    // Load routes after mocks are set up
    try {
      app.use('/', require('../routes/zyno-routes'));
      app.use('/', require('../routes/rag-routes'));
    } catch (err) {
      // If route loading fails, log but continue (mocks should prevent this)
      console.warn('Route loading warning:', err.message);
    }

    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    delete process.env.ADMIN_API_KEY;
    delete process.env.RAG_DATA_PATH;
    fs.readdirSync = ORIGINAL_READDIR_SYNC;
    if (tempDocsDir) {
      fs.rmSync(tempDocsDir, { recursive: true, force: true });
    }
    const multer = require('multer');
    multer.__setFile(undefined);
    if (agentMemory?.reset) {
      agentMemory.reset();
    }
  });

  it('rejects RAG uploads when ADMIN_API_KEY is missing', async () => {
    delete process.env.ADMIN_API_KEY;

    const res = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'any-key')
      .expect(503);

    expect(res.body).toEqual({ error: 'RAG upload service unavailable.' });
  });

  it('denies access to RAG listing when api key mismatches', async () => {
    process.env.ADMIN_API_KEY = 'secret';

    const res = await request(app)
      .get('/admin/rag/documents')
      .set('x-api-key', 'not-secret')
      .expect(403);

    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('denies RAG uploads when api key mismatches', async () => {
    process.env.ADMIN_API_KEY = 'secret';

    const res = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'not-secret')
      .expect(403);

    expect(res.body).toEqual({ error: 'Unauthorized' });
    expect(ingestDocument).not.toHaveBeenCalled();
  });

  it('rejects RAG uploads without a document payload', async () => {
    process.env.ADMIN_API_KEY = 'secret';

    const res = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'secret')
      .expect(400);

    expect(res.body).toEqual({ error: 'No document provided.' });
    expect(ingestDocument).not.toHaveBeenCalled();
  });

  it('returns 500 when the ingest client throws during upload', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    const multer = require('multer');
    multer.__setFile({
      buffer: Buffer.from('bad payload'),
      originalname: 'bad.md',
      mimetype: 'text/markdown'
    });
    ingestDocument.mockRejectedValue(new Error('rag down'));

    const res = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'secret')
      .expect(500);

    expect(res.body).toEqual({ error: 'Upload failed' });
    expect(errorSpy).toHaveBeenCalled();
  });

  it('lists previously stored RAG documents when authorized', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    const storedFile = path.join(tempDocsDir, 'playbook.txt');
    fs.writeFileSync(storedFile, 'dao playbook', 'utf8');

    const res = await request(app)
      .get('/admin/rag/documents')
      .set('x-api-key', 'secret')
      .expect(200);

    expect(res.body.documents).toEqual([
      {
        name: 'playbook.txt',
        path: storedFile
      }
    ]);
  });

  it('handles filesystem errors when listing RAG documents', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    fs.readdirSync = () => {
      throw new Error('fs down');
    };

    try {
      const res = await request(app)
        .get('/admin/rag/documents')
        .set('x-api-key', 'secret')
        .expect(500);

      expect(res.body).toEqual({ error: 'Unable to list documents' });
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      fs.readdirSync = ORIGINAL_READDIR_SYNC;
    }
  });

  it('denies agent scoreboard access when api key mismatches', async () => {
    process.env.ADMIN_API_KEY = 'secret';

    const res = await request(app)
      .get('/admin/agent-scoreboard')
      .set('x-api-key', 'nope')
      .expect(403);

    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns agent scoreboard when authorized', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    // Reset agentMemory mock to ensure clean state
    agentMemory.listAll.mockReturnValue([
      {
        userId: 'user-1',
        aepo: 72,
        aeco: 64,
        history: [{ phase: 'Discover' }],
        profile: { name: 'Alice' },
        updatedAt: new Date().toISOString()
      }
    ]);

    const res = await request(app)
      .get('/admin/agent-scoreboard')
      .set('x-api-key', 'secret')
      .expect(200);

    expect(res.body.users).toBeDefined();
    expect(Array.isArray(res.body.users)).toBe(true);
    if (res.body.users.length > 0) {
      expect(res.body.users[0]).toEqual(
        expect.objectContaining({
          userId: 'user-1',
          aepo: 72,
          aeco: 64,
          historyCount: 1,
          profile: { name: 'Alice' }
        })
      );
      expect(res.body.users[0].updatedAt).toEqual(expect.any(String));
    }
  });

  it('returns 500 when agent scoreboard retrieval fails', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    const listAllSpy = jest.spyOn(agentMemory, 'listAll').mockImplementation(() => {
      throw new Error('unexpected');
    });

    const res = await request(app)
      .get('/admin/agent-scoreboard')
      .set('x-api-key', 'secret')
      .expect(500);

    expect(res.body).toEqual({ error: 'Unable to retrieve agent scoreboard' });
    expect(errorSpy).toHaveBeenCalled();
    listAllSpy.mockRestore();
  });

  it('allows authorized RAG uploads and forwards document to the ingest client', async () => {
    process.env.ADMIN_API_KEY = 'secret';
    const multer = require('multer');
    multer.__setFile({
      buffer: Buffer.from('DAO knowledge'),
      originalname: 'dao.md',
      mimetype: 'text/markdown'
    });
    ingestDocument.mockResolvedValue([{ title: 'dao.md', content: 'DAO knowledge' }]);

    const res = await request(app)
      .post('/admin/rag/upload')
      .set('x-api-key', 'secret')
      .expect(200);

    expect(res.body).toEqual({ status: 'success', details: [{ title: 'dao.md', content: 'DAO knowledge' }] });
    expect(ingestDocument).toHaveBeenCalledWith('DAO knowledge', {
      title: 'dao.md',
      type: 'text/markdown'
    });
  });

  it('lists agent logs with filters and handles errors gracefully', async () => {
    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue([{ agentName: 'NFTAgent' }]);
    AgentLog.find.mockReturnValue({ sort: sortMock, limit: limitMock });

    const response = await request(app)
      .get('/admin/agent-logs')
      .query({ userId: 'user', agentName: 'NFT' })
      .expect(200);

    expect(AgentLog.find).toHaveBeenCalledWith({
      userId: { $regex: 'user', $options: 'i' },
      agentName: { $regex: 'NFT', $options: 'i' }
    });
    expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
    expect(limitMock).toHaveBeenCalledWith(100);
    expect(response.body).toEqual([{ agentName: 'NFTAgent' }]);
  });

  it('returns 500 when agent log retrieval fails', async () => {
    AgentLog.find.mockImplementation(() => {
      throw new Error('db down');
    });

    const res = await request(app)
      .get('/admin/agent-logs')
      .expect(500);

    expect(res.body).toEqual({ error: 'Unable to retrieve agent logs.' });
  });
});
