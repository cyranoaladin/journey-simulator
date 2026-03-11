/**
 * Mock pour orchestration-gate routes
 */
const express = require('express');
const router = express.Router();

router.post('/gate/:gateId/review', (req, res) => {
  res.json({ success: true, gateId: req.params.gateId });
});

router.get('/gate/:gateId', (req, res) => {
  res.json({ gateId: req.params.gateId, status: 'open' });
});

module.exports = router;
