const express = require('express');
const router = express.Router();
const AgentLog = require('../models/agentFeedbackLog');
const agentRunController = require('../controllers/agent-run-controller');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/agents/runs - List agent runs (Admin/Internal or User scoped)
// Currently restricting to admin for broad queries, but could be user-scoped.
// For now, let's allow authenticated users to see their own runs if we filter by userId?
// The controller handles filtering. Let's protect it.
router.get('/runs', protect, agentRunController.getAgentRuns);

// GET /api/agents/runs/:id - Get run details
router.get('/runs/:id', protect, agentRunController.getAgentRunDetails);

// GET /api/agents/logs - Retrieve agent logs for a specific user/journey
router.get('/logs', async (req, res) => {
  try {
    const { journeyId, userId, limit = 20 } = req.query;

    const filters = {};

    // Use either journeyId or userId (often they may be the same in this context)
    if (journeyId || userId) {
      filters.userId = journeyId || userId;
    }

    const logs = await AgentLog.find(filters)
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 20);

    res.json(logs);
  } catch (error) {
    console.error('Agent logs error:', error);
    res.status(500).json({ error: 'Unable to retrieve agent logs.' });
  }
});

module.exports = router;
