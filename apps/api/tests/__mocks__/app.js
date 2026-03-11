/**
 * Mock pour l'application Express principale
 */
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/journey', (req, res) => {
  res.json({ success: true, journeyId: 'mock-journey-id' });
});

app.get('/api/journey/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'active' });
});

app.post('/api/agent/run', (req, res) => {
  res.json({ success: true, result: 'mock-result' });
});

app.post('/api/rag/upload', (req, res) => {
  res.json({ success: true, documentId: 'mock-doc-id' });
});

app.get('/api/rag/documents', (req, res) => {
  res.json({ documents: [] });
});

module.exports = app;
