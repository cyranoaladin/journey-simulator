/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');
const { getRagSnippets } = require('../rag/ragClient');
const { callGpt5 } = require('../utils/openaiClient');

/* GET home page. */
router.get('/', function(req, res, next) {
  // This API service does not ship server-side rendered views in production.
  // Returning JSON avoids 500s when no view engine is configured.
  res.status(200).json({ ok: true, service: 'mf-back', status: 'running' });
});

router.get('/api/health', async function(req, res) {
  const mongoOk = mongoose.connection && mongoose.connection.readyState === 1;
  let llmOk = false;
  let ragStatus = 'unknown';
  let diskWritable = false;

  try {
    await callGpt5({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 16, useCache: false });
    llmOk = true;
  } catch (e) {
    llmOk = false;
  }

  try {
    const rag = await getRagSnippets({ query: 'healthcheck' });
    ragStatus = Array.isArray(rag) && rag.length > 0 ? 'OK' : 'DEGRADED';
  } catch (e) {
    ragStatus = 'FAIL';
  }

  try {
    const tmpPath = path.join(__dirname, '..', 'memory', '.healthcheck');
    fs.writeFileSync(tmpPath, 'ok');
    fs.unlinkSync(tmpPath);
    diskWritable = true;
  } catch (e) {
    diskWritable = false;
  }

  res.json({
    mongo: mongoOk ? 'OK' : 'FAIL',
    llm: llmOk ? 'OK' : 'FAIL',
    rag: ragStatus,
    disk: diskWritable ? 'WRITABLE' : 'READONLY',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
