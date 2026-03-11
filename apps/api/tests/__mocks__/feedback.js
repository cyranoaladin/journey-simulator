/**
 * Mock pour feedback routes
 */
const express = require('express');
const router = express.Router();

router.post('/api/feedback', (req, res) => {
  res.json({ success: true, feedbackId: 'mock-feedback-id' });
});

router.get('/api/feedback/:id', (req, res) => {
  res.json({ id: req.params.id, rating: 5, comment: 'Mock feedback' });
});

module.exports = router;
