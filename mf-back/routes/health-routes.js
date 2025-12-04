const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.get('/readyz', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const ready = mongoState === 1 || mongoState === 2;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not-ready',
    mongoState
  });
});

module.exports = router;
