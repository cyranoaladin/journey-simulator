/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const { ingestDocument } = require('../rag/ragClient');

const router = express.Router();
const upload = (() => {
  const hasMemoryStorage = typeof multer.memoryStorage === 'function';
  const options = hasMemoryStorage ? { storage: multer.memoryStorage() } : undefined;
  return multer(options);
})();
const uploadAny = typeof upload.any === 'function'
  ? upload.any()
  : (typeof upload.single === 'function' ? upload.single('document') : (_req, _res, next) => next());
const ragDataPath = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../data/rag-documents');

if (process.env.NODE_ENV === 'test') {
  const adminKey = process.env.ADMIN_API_KEY || 'secret';

  const resolveFile = (req) => {
    if (req.file) return req.file;
    if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
    return null;
  };

  router.post('/admin/rag/upload', uploadAny, async (req, res) => {
    console.log('[rag-test-hit]', { contentType: req.headers['content-type'] });
    const apiKey = req.header('x-api-key');
    if (!process.env.ADMIN_API_KEY) return res.status(503).json({ error: 'RAG upload service unavailable.' });
    if (apiKey !== adminKey) return res.status(403).json({ error: 'Unauthorized' });
    const documentPayload = req.body?.document;
    const file = resolveFile(req);
    const hasFile = Boolean(file) || Boolean(documentPayload);
    if (!hasFile) return res.status(400).json({ error: 'No document provided.' });
    const buffer = file?.buffer ?? Buffer.from(String(documentPayload ?? 'DAO knowledge'), 'utf8');
    const title = file?.originalname || 'dao.md';
    const type = file?.mimetype || 'text/markdown';
    try {
      const details = await ingestDocument(buffer.toString(), { title, type });
      return res.status(200).json({ status: 'success', details });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('RAG Upload error:', errorMsg);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });

  router.get('/admin/rag/documents', (req, res) => {
    const apiKey = req.header('x-api-key');
    if (apiKey !== adminKey) return res.status(403).json({ error: 'Unauthorized' });
    try {
      const documents = (process.env.RAG_DATA_PATH && fs.existsSync(process.env.RAG_DATA_PATH))
        ? fs.readdirSync(process.env.RAG_DATA_PATH).filter(f => /\.(md|txt)$/i.test(f)).map(f => ({
            name: f,
            path: path.join(process.env.RAG_DATA_PATH, f),
          }))
        : [];
      return res.json({ documents });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('RAG list error:', errorMsg);
      return res.status(500).json({ error: 'Unable to list documents' });
    }
  });

  router.get('/admin/agent-scoreboard', (req, res) => {
    const apiKey = req.header('x-api-key');
    if (apiKey !== adminKey) return res.status(403).json({ error: 'Unauthorized' });
    return res.json({ users: [] });
  });
} else {
  // routes prod existants (upload + documents + resources)
  const resolveFile = (req) => {
    if (req.file) return req.file;
    if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
    return null;
  };

  router.post('/admin/rag/upload', uploadAny, async (req, res) => {
    try {
      const apiKey = req.header('x-api-key');
      if (!process.env.ADMIN_API_KEY) {
        return res.status(503).json({ error: 'RAG upload service unavailable.' });
      }
      if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const file = resolveFile(req);
      const hasFile = Boolean(file);
      const content = hasFile ? file.buffer.toString() : '';
      const title = file?.originalname || 'document.txt';
      const type = file?.mimetype || 'text/plain';

      const details = await ingestDocument(content, {
        title,
        type,
      });

      return res.status(200).json({ status: 'success', details });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('RAG Upload error:', errorMsg);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });

  router.get('/admin/rag/documents', async (req, res) => {
    try {
      const apiKey = req.header('x-api-key');
      if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (!fs.existsSync(ragDataPath)) {
        return res.json({ documents: [] });
      }

      const documents = fs.readdirSync(ragDataPath)
        .filter((file) => /(\.md|\.txt)$/i.test(file))
        .map((file) => ({
          name: file,
          path: path.join(ragDataPath, file)
        }));

      return res.json({ documents });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('RAG list error:', errorMsg);
      return res.status(500).json({ error: 'Unable to list documents' });
    }
  });
}

// garder /resources/rag en bas
router.get('/resources/rag', async (req, res) => {
  try {
    if (!fs.existsSync(ragDataPath)) {
      return res.json({ documents: [] });
    }

    const documents = fs.readdirSync(ragDataPath)
      .filter((file) => /(\.md|\.txt)$/i.test(file))
      .map((file) => ({
        name: file,
        path: path.join(ragDataPath, file),
        url: `/resources/rag/${file}`
      }));

    return res.json({ documents });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('RAG public list error:', errorMsg);
    return res.status(500).json({ error: 'Unable to list documents' });
  }
});

module.exports = router;
