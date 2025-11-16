const express = require('express');
const AgentLog = require('../models/agentFeedbackLog');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
const { listTemplates } = require('../data/parcoursTemplates');
const agentMemory = require('../memory/agent_memory');

const router = express.Router();

router.post('/orchestration', async (req, res) => {
  try {
    const userInput = req.body?.input ?? '';
    const userId = req.body?.userId ?? 'demo_user';
    const context = {
      user: { id: userId },
      userId,
      journey: req.body?.journey ?? {},
      phase: req.body?.phase ?? 'Learn',
      objective: req.body?.objective ?? userInput,
      input: userInput,
    };

    const orchestrationResult = await orchestrateZyno(userInput, context);
    const availableTemplates = listTemplates().map((template) => ({
      templateId: template.templateId,
      fileName: template.fileName
    }));

    const { executedAgents = [], results = {} } = orchestrationResult;

    await Promise.all(
      executedAgents.map(async (agentName) => {
        const data = results[agentName];
        if (!data) {
          return;
        }

        await AgentLog.create({
          userId,
          agentName,
          payload: data.payload,
          ragSnippets: data.references ?? [],
          ae_summary: data.ae_summary ?? '',
          ae_outcome: data.ae_outcome ?? '',
        });
      })
    );

    res.json({
      ...orchestrationResult,
      availableTemplates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Zyno orchestration failed.' });
  }
});

router.get('/admin/agent-logs', async (req, res) => {
  try {
    const { userId, agentName } = req.query;
    const filters = {};

    if (userId) {
      filters.userId = { $regex: userId, $options: 'i' };
    }

    if (agentName) {
      filters.agentName = { $regex: agentName, $options: 'i' };
    }

    const logs = await AgentLog.find(filters).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Agent logs error:', error);
    res.status(500).json({ error: 'Unable to retrieve agent logs.' });
  }
});

router.get('/admin/agent-scoreboard', (req, res) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const users = agentMemory.listAll().map((entry) => ({
      userId: entry.userId,
      aepo: entry.aepo ?? 0,
      aeco: entry.aeco ?? 0,
      historyCount: Array.isArray(entry.history) ? entry.history.length : 0,
      profile: entry.profile ?? {},
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : null
    })).sort((a, b) => b.aepo - a.aepo || b.aeco - a.aeco);

    return res.json({ users });
  } catch (error) {
    console.error('Agent scoreboard error:', error);
    return res.status(500).json({ error: 'Unable to retrieve agent scoreboard' });
  }
});

module.exports = router;
