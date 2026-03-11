/**
 * Mock pour dao-routes
 */
const express = require('express');
const router = express.Router();

router.get('/dao', (req, res) => {
  res.json({ daos: [] });
});

router.post('/dao', (req, res) => {
  res.json({ success: true, dao: { id: 'mock-dao-id', ...req.body } });
});

router.get('/dao/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Mock DAO' });
});

module.exports = router;
