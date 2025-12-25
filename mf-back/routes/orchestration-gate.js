const express = require('express');
const executionGate = require('../orchestration/executionGate');

const router = express.Router();

router.post('/gate/:gateId/review', (req, res) => {
  const { gateId } = req.params;
  const { approve, overrides } = req.body || {};
  if (typeof approve !== 'boolean') {
    return res.status(400).json({ error: 'approve is required and must be boolean' });
  }
  const result = executionGate.review(gateId, { approve, overrides });
  if (!result) return res.status(404).json({ error: 'gate not found' });
  return res.json(result);
});

module.exports = router;
