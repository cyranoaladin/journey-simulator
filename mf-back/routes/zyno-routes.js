const express = require('express');
const AgentLog = require('../models/agentFeedbackLog');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
const { orchestrateVerticalSlice } = require('../orchestration/zynoVerticalSlice');
const { listTemplates } = require('../data/parcoursTemplates');
const agentMemory = require('../memory/agent_memory');
const { getOrchestrationGlossary } = require('../utils/aepoAeco');

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

    const { executedAgents = [], results = {}, timeline = [] } = orchestrationResult;

    await Promise.all(
      executedAgents.map(async (agentName, index) => {
        const data = results[agentName];
        if (!data) {
          return;
        }

        await AgentLog.create({
          userId,
          agentName,
          intent: orchestrationResult.intent ?? null,
          phaseId: data.phase ?? null,
          promptSent: data.prompt ?? null,
          reasoning: data.reasoning ?? null,
          actionTaken: data.action ?? null,
          response: data.response ?? data.output ?? data.raw ?? null,
          output: data.output ?? null,
          sources: data.sources ?? [],
          metrics: data.metrics ?? {},
          feedback: data.feedback ?? {},
          timelineIndex: index,
          payload: data.raw ?? data,
          ragSnippets: Array.isArray(data.sources) ? data.sources : [],
          ae_summary: data.feedback?.ae_summary ?? data.ae_summary ?? '',
          ae_outcome: data.feedback?.ae_outcome ?? data.ae_outcome ?? '',
        });
      })
    );

    res.json({
      ...orchestrationResult,
      availableTemplates,
      timestamp: new Date().toISOString(),
      // Non-breaking metadata for developers/investors: unified AEPO/AECO definitions.
      meta: {
        orchestration: getOrchestrationGlossary(),
      },
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Zyno orchestration failed.' });
  }
});

// Vertical slice orchestrator (SecurityAuditAgent + ProductSpecAgent)
// Mounted at /orchestration → final path: POST /orchestration/vslice
router.post('/vslice', async (req, res) => {
  try {
    const traceId = req.body?.traceId || req.headers['x-trace-id'] || undefined;
    const result = await orchestrateVerticalSlice({
      traceId,
      runId: req.body?.runId,
      userId: req.body?.userId,
      intent: req.body?.intent || 'vslice',
      input: req.body?.input || '',
      context: req.body?.context || {},
      constraints: req.body?.constraints || {},
    });
    res.json(result);
  } catch (error) {
    console.error('Vertical slice orchestration error:', error);
    res.status(500).json({ error: 'Vertical slice orchestration failed.' });
  }
});

router.get('/orchestration/logs', async (req, res) => {
  try {
    const { userId, intent, limit = 50 } = req.query;
    const filters = {};

    if (userId) {
      filters.userId = { $regex: userId, $options: 'i' };
    }

    if (intent) {
      filters.intent = { $regex: intent, $options: 'i' };
    }

    const logs = await AgentLog.find(filters)
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit) || 50, 200));

    res.json({
      count: logs.length,
      items: logs,
    });
  } catch (error) {
    console.error('Agent logs fetch error:', error);
    res.status(500).json({ error: 'Unable to retrieve orchestration logs.' });
  }
});

router.get('/orchestration/current-step', async (req, res) => {
  try {
    const userId = req.query?.userId ?? 'demo_user';

    const latest = await AgentLog.findOne({ userId })
      .sort({ timestamp: -1 })
      .lean();

    if (!latest) {
      return res.json({ currentStep: null });
    }

    res.json({
      currentStep: {
        agent: latest.agentName,
        phase: latest.phaseId ?? null,
        intent: latest.intent ?? null,
        prompt: latest.promptSent ?? null,
        reasoning: latest.reasoning ?? latest.ae_summary ?? null,
        action: latest.actionTaken ?? latest.ae_outcome ?? null,
        response: latest.response ?? latest.output ?? null,
        sources: latest.sources ?? latest.ragSnippets ?? [],
        metrics: latest.metrics ?? null,
        feedback: latest.feedback ?? {
          ae_summary: latest.ae_summary ?? null,
          ae_outcome: latest.ae_outcome ?? null,
        },
        timestamp: latest.timestamp,
      }
    });
  } catch (error) {
    console.error('Current step retrieval error:', error);
    res.status(500).json({ error: 'Unable to retrieve current step.' });
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
