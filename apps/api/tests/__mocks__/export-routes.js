/**
 * Mock pour export-routes
 */
const express = require('express');
const router = express.Router();

router.get('/export/journey/:id', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      journeyId: req.params.id,
      exportedAt: new Date().toISOString()
    } 
  });
});

router.post('/export/batch', (req, res) => {
  res.json({ success: true, exported: req.body.ids || [] });
});

module.exports = router;
