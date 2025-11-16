const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { ingestDocument } = require('../rag/ragClient');

const router = express.Router();
const upload = multer();
const ragDataPath = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../data/rag-documents');

router.post('/admin/rag/upload', upload.single('document'), async (req, res) => {
  const apiKey = req.header('x-api-key');
  if (!process.env.ADMIN_API_KEY) {
    console.warn('ADMIN_API_KEY is not configured. Rejecting upload.');
    return res.status(503).json({ error: 'RAG upload service unavailable.' });
  }

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No document provided.' });
  }

  try {
    const { buffer, originalname, mimetype } = req.file;
    const content = buffer.toString();

    const details = await ingestDocument(content, {
      title: originalname,
      type: mimetype,
    });

    return res.status(200).json({ status: 'success', details });
  } catch (error) {
    console.error('RAG Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/admin/rag/documents', async (req, res) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    if (!fs.existsSync(ragDataPath)) {
      return res.json({ documents: [] });
    }

    const documents = fs.readdirSync(ragDataPath)
      .filter((file) => /\.(md|txt)$/i.test(file))
      .map((file) => ({
        name: file,
        path: path.join(ragDataPath, file)
      }));

    return res.json({ documents });
  } catch (error) {
    console.error('RAG list error:', error);
    return res.status(500).json({ error: 'Unable to list documents' });
  }
});

module.exports = router;
