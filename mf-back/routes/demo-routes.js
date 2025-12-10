const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demo-controller');
const { optionalAuth } = require('../middleware/auth');

/**
 * Demo routes
 * GET /demo/state - Get demo state (works with or without auth)
 * POST /demo/save - Save demo state (requires auth)
 */
router.get('/state', optionalAuth, demoController.getDemoState);
router.post('/save', optionalAuth, demoController.saveDemoState);

module.exports = router;
