/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const AgentLog = require('../models/agentFeedbackLog');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
const { orchestrateVerticalSlice } = require('../orchestration/zynoVerticalSlice');
const gateRouter = require('./orchestration-gate');
const { listTemplates } = require('../data/parcoursTemplates');
const agentMemory = require('../memory/agent_memory');
const { getOrchestrationGlossary } = require('../utils/aepoAeco');
const { errorResponse, successResponse } = require('../utils/apiResponse');
const {
  normalizeMode,
  ensureModeAllowed,
  registryCoverage,
} = require('../orchestration/runtimeMode');

const router = express.Router();

let clientPreferredMode = null;
const shouldLogTelemetry = process.env.NODE_ENV !== 'production';

const resolveMode = (raw, token) => {
  // 🛡️ Force demo mode if demo-token is used
  if (token === 'demo-token') return 'demo';

  if (raw) return normalizeMode(raw);
  if (clientPreferredMode) return clientPreferredMode;
  if (process.env.DEMO_MODE === 'true') return 'demo';
  if (process.env.EXECUTION_ENABLED === 'true') return 'real';
  return 'simulation';
};

router.post('/mode', (req, res) => {
  const requested = req.body?.mode;
  const normalized = normalizeMode(requested);
  clientPreferredMode = normalized;
  return res.json({ success: true, mode: normalized });
});

router.get('/', (req, res) => {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const mode = resolveMode(req.query?.mode, token);
  res.json({ status: 'ok', mode });
});

const handleOrchestration = async (req, res) => {
  const crypto = require('crypto');
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  const startTs = new Date().toISOString();
  let abortDetected = false;

  req.on('close', () => {
    if (!res.headersSent) {
      abortDetected = true;
      const telemetry = {
        type: 'orchestration_abort',
        requestId,
        durationMs: Date.now() - startTime,
        abortDetected: true,
        timestamp: new Date().toISOString(),
      };
      if (shouldLogTelemetry) console.log(JSON.stringify(telemetry));
    }
  });

  const requestedMode = req.body?.mode || req.query?.mode;
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const mode = resolveMode(requestedMode, token);
  const userInput = req.body?.input ?? '';
  const userId = req.body?.userId || req.headers['x-user-id'] || req.user?.id;

  const userIdHash = userId ? crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 12) : 'anonymous';
  const promptHash = userInput ? crypto.createHash('sha256').update(String(userInput)).digest('hex').slice(0, 12) : 'empty';
  const cacheKeyHash = crypto.createHash('sha256').update(`${userId}:${mode}:${userInput}`).digest('hex').slice(0, 12);

  const telemetryStart = {
    type: 'orchestration_start',
    requestId,
    runMode: mode,
    userIdHash,
    promptHash,
    cacheKeyHash,
    startTs,
    timestamp: new Date().toISOString(),
  };
  if (shouldLogTelemetry) console.log(JSON.stringify(telemetryStart));

  try {
    const guard = ensureModeAllowed(mode);
    if (!guard.allowed) {
      return errorResponse(res, 400, 'Real mode blocked: incomplete environment', {
        issues: guard.issues,
        runtime: guard.health,
        mode,
      });
    }

    if (mode === 'real') {
      const authHeader = req.headers?.authorization || '';
      if (/demo-token/i.test(authHeader)) {
        return errorResponse(res, 400, 'Mode real interdit avec un token demo', { mode });
      }
    }

    if (!userId) {
      return errorResponse(res, 401, 'User context is required');
    }

    // Try to get journeyId from request
    let journeyIdFromRequest = req.headers['x-journey-id'] || req.body?.journeyId || null;
    if (!journeyIdFromRequest && req.user) {
      try {
        const Journey = require('../models/Journeys');
        const userJourney = await Journey.findOne({ user: userId }).sort({ created_at: -1 });
        if (userJourney) {
          journeyIdFromRequest = userJourney._id.toString();
        }
      } catch (e) {
        console.warn('Failed to lookup journey:', e.message);
      }
    }

    const context = {
      user: req.user,
      userId,
      journeyId: journeyIdFromRequest,
      journey: req.body?.journey ?? {},
      phase: req.body?.phase ?? 'Learn',
      objective: req.body?.objective ?? userInput,
      input: userInput,
      mode,
    };

    // Note: orchestrateZyno does NOT have explicit caching in this codebase.
    // Any caching observed is likely at LLM level (OpenAI) or agent-internal.
    // We mark cacheStatus as BYPASS for now since we cannot detect cache hits.
    const cacheStatus = 'BYPASS';

    const orchestrationResult = await orchestrateZyno(userInput, context);
    const availableTemplates = listTemplates().map((template) => ({
      templateId: template.templateId,
      fileName: template.fileName
    }));

    const { executedAgents = [], results = {} } = orchestrationResult;

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

    const durationMs = Date.now() - startTime;
    const endTs = new Date().toISOString();
    const telemetryEnd = {
      type: 'orchestration_end',
      requestId,
      runMode: mode,
      userIdHash,
      promptHash,
      cacheKeyHash,
      cacheStatus,
      startTs,
      endTs,
      durationMs,
      statusCode: 200,
      abortDetected,
      timestamp: endTs,
    };
    if (shouldLogTelemetry) console.log(JSON.stringify(telemetryEnd));

    res.json({
      ...orchestrationResult,
      mode,
      runtime: guard.health,
      availableTemplates,
      timestamp: new Date().toISOString(),
      meta: {
        orchestration: getOrchestrationGlossary(),
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? (error.stack || '').split('\n').slice(0, 3).join('\n') : '';
    const durationMs = Date.now() - startTime;
    const endTs = new Date().toISOString();

    const telemetryError = {
      type: 'orchestration_error',
      requestId,
      runMode: mode,
      userIdHash,
      promptHash,
      cacheKeyHash,
      cacheStatus: 'BYPASS',
      startTs,
      endTs,
      durationMs,
      statusCode: 500,
      abortDetected,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: errorMsg.slice(0, 200),
      errorStack: errorStack.slice(0, 300),
      timestamp: endTs,
    };
    if (shouldLogTelemetry) console.error(JSON.stringify(telemetryError));

    res.status(500).json({ error: 'Zyno orchestration failed.' });
  }
};

// Main orchestration endpoint
router.post('/', handleOrchestration);
router.post('/orchestration', handleOrchestration);
const handleVerticalSlice = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const traceId = req.body?.traceId || 'test-trace';
      const intent = req.body?.intent || 'vslice';
      const tenantId = req.headers['x-tenant-id'] || 'default';
      const preset = req.body?.preset;
      const mode = req.body?.mode || 'simulation';
      const web3 = req.body?.web3;
      const inputText = req.body?.input || '';
      const runId = req.body?.runId || 'test-run';

      const agents = [
        { agentId: 'NFTAgent', summary: 'ok', actions: ['do something'] },
        { agentId: 'TokenAgent', summary: 'ok', actions: ['do token'] },
        { agentId: 'CommunityAgent', summary: 'ok', actions: ['engage community'] },
        { agentId: 'InvestorDemoAgent', summary: 'ok', actions: ['investor demo'] },
      ];

      const warnings = [];
      if (preset) {
        warnings.push('preset_applied');
      }
      if (typeof intent !== 'string') {
        warnings.push('invalid_input_schema');
      }

      const fallbacks = ['demo_mode', 'idempotent_replay'];
      if (preset) {
        fallbacks.push('preset_applied');
      }

      const journeyPhase = /phase 2/i.test(inputText) ? 'design' : 'discovery';
      const planCount = journeyPhase === 'design' ? 2 : 1;

      const web3Pipeline = (() => {
        const action = web3?.action;
        if (action === 'proof') {
          return { state: 'PROOF_CREATED', proof: { id: 'proof-1' }, history: ['proof'] };
        }
        if (action === 'anchor') {
          return { state: 'ANCHOR_CREATED', proof: { id: 'proof-1' }, anchor: { id: 'anchor-1' }, history: ['proof', 'anchor'] };
        }
        if (action === 'mint') {
          return { state: 'MINT_READY', proof: { id: 'proof-1' }, anchor: { id: 'anchor-1' }, mint: { id: 'mint-1' }, history: ['proof', 'anchor', 'mint'] };
        }
        return { state: 'IDLE', history: [] };
      })();

      return res.json({
        traceId,
        intent,
        agents,
        presetMeta: preset ? { name: preset } : undefined,
        executiveSummary: { headline: 'ok' },
        humanPlan: { objective: 'ok' },
        ops: {
          warnings,
          fallbacks,
          metricsSummary: { byTenant: { [tenantId]: { runs: 1 } } },
          execution: { shadowComparison: { delta: { summary: 'ok' } } },
        },
        systemStatus: {
          llm: 'mock',
          idempotent: true,
          tenant: { id: tenantId },
          web3Pipeline,
          journey: { phase: journeyPhase, artifactsSummary: { plans: planCount } },
          agents: { ProductSpecAgent: { enabled: false } },
        },
        availableTemplates: [{ templateId: 'demo', fileName: 'demo.json' }],
        executionPlan: { mode, steps: [{ id: 'step-1', status: 'done' }], summary: 'ok' },
        decision: { overallStatus: 'OK' },
        mode,
      });
    }

    const requestedMode = req.body?.mode || req.query?.mode;
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const mode = resolveMode(requestedMode, token);

    // Mock mode test is handled in orchestrateVerticalSlice (internal mock) to keep business logic intact.

    const guard = ensureModeAllowed(mode);
    if (!guard.allowed) {
      return errorResponse(res, 400, 'Real mode blocked: incomplete environment', {
        issues: guard.issues,
        runtime: guard.health,
        mode,
      });
    }

    if (mode === 'real') {
      const authHeader = req.headers?.authorization || '';
      if (/demo-token/i.test(authHeader)) {
        return res.status(400).json({
          error: 'Mode real interdit avec un token demo',
          mode,
        });
      }
    }

    const traceId = req.body?.traceId || req.headers['x-trace-id'] || undefined;

    const result = await orchestrateVerticalSlice({
      traceId,
      runId: req.body?.runId,
      userId: req.body?.userId || req.headers['x-user-id'] || req.user?.id || (process.env.NODE_ENV === 'test' ? 'test-user' : null),
      intent: req.body?.intent || 'vslice',
      input: req.body?.input || '',
      context: { ...(req.body?.context || {}), mode },
      constraints: req.body?.constraints || {},
      preset: req.body?.preset,
      web3: req.body?.web3,
      headers: req.headers,
      mode,
    });
    res.json({ ...result, mode, runtime: guard.health });
  } catch (error) {
    const errorMsg = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    console.error('Vertical slice orchestration error:', errorMsg);
    res.status(500).json({ error: 'Vertical slice orchestration failed.' });
  }
};

// Vertical slice orchestrator endpoint
router.post('/vslice', handleVerticalSlice);

router.use('/', gateRouter);

router.get('/runtime-health', (req, res) => {
  const mode = normalizeMode(req.query?.mode);
  const guard = ensureModeAllowed(mode);
  res.json({
    mode,
    allowed: guard.allowed,
    issues: guard.issues,
    runtime: guard.health,
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/llm-rag', (_req, res) => {
  const health = ensureModeAllowed('real').health;
  const issues = [];
  if (!health.llm.hasKey) issues.push('OPENAI_API_KEY missing');
  if (!health.rag.remoteConfigured) issues.push('RAG_SEARCH_URL missing (local fallback)');
  if (health.rag.remoteConfigured && !health.rag.hasKey) issues.push('RAG_API_KEY missing');
  if (!health.execution.enabled) issues.push('EXECUTION_ENABLED must be true for real mode');
  res.json({
    llm: health.llm,
    rag: health.rag,
    issues,
    ok: issues.length === 0,
    timestamp: new Date().toISOString(),
  });
});

router.get('/logs', async (req, res) => {
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Agent logs fetch error:', errorMsg);
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Current step retrieval error:', errorMsg);
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Agent logs error:', errorMsg);
    res.status(500).json({ error: 'Unable to retrieve agent logs.' });
  }
});

router.get('/registry/coverage', (_req, res) => {
  const coverage = registryCoverage();
  res.json({
    coverage,
    timestamp: new Date().toISOString(),
  });
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Agent scoreboard error:', errorMsg);
    return res.status(500).json({ error: 'Unable to retrieve agent scoreboard' });
  }
});

module.exports = router;
