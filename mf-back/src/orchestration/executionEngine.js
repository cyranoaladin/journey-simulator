/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Dry-run execution engine: simulates tool execution without side effects.
 * No network, no DB, no external calls.
 */

const toolsRegistry = require('./toolsRegistry');

const simulate = ({ executionPlan = [], traceId, runId, tenantId = 'default', gateApproved = false }) => {
  const steps = executionPlan.map((tool, index) => {
    const step = index + 1;
    if (tool.unexecutable || !tool.toolId) {
      return {
        step,
        toolId: tool.toolId || null,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED',
        notes: 'Unexecutable action (no tool mapping).',
        effects: [],
        warnings: ['unknown_action_tool'],
        mappingReason: tool.mappingReason,
        mappingConfidence: tool.mappingConfidence,
      };
    }

    const toolDef = toolsRegistry.getTool(tool.toolId);
    if (!toolDef) {
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED',
        notes: `Tool ${tool.toolId} not found in registry.`,
        effects: [],
        warnings: ['tool_not_found'],
        mappingReason: tool.mappingReason,
        mappingConfidence: tool.mappingConfidence,
      };
    }

    // Check gate requirement
    const requiresGate = toolDef.requiresGate || tool.requiresConfirmation;
    if (requiresGate && !gateApproved) {
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'BLOCKED_BY_GATE',
        notes: 'Requires gate approval before execution.',
        effects: [],
        warnings: ['gate_required'],
        mappingReason: tool.mappingReason,
        mappingConfidence: tool.mappingConfidence,
      };
    }

    // Simulate using tool's simulate function
    const simulationContext = {
      action: tool.action,
      traceId,
      runId,
      tenantId,
      gateApproved,
    };

    let simulationResult;
    if (typeof toolDef.simulate === 'function') {
      simulationResult = toolDef.simulate(tool.toolId, simulationContext);
    } else {
      simulationResult = { status: 'SIMULATED_OK', effects: ['Dry-run only, no side effects.'], warnings: [] };
    }

    const notes = [];
    notes.push('Dry-run only, no side effects.');
    if (tool.requiresConfirmation || tool.sideEffects === 'external' || tool.sideEffects === 'irreversible') {
      notes.push('Requires real execution later.');
    }

    // Determine status from simulation result
    let stepStatus = 'SKIPPED';
    switch (simulationResult.status) {
      case 'SIMULATED_OK':
        stepStatus = 'SIMULATED_OK';
        break;
      case 'BLOCKED_BY_GATE':
        stepStatus = 'BLOCKED_BY_GATE';
        break;
      case 'SIMULATED_FAIL':
        stepStatus = 'SIMULATED_FAIL';
        break;
    }

    return {
      step,
      toolId: tool.toolId,
      action: tool.action,
      sourceAgent: tool.sourceAgent,
      priority: tool.priority,
      status: stepStatus,
      notes: notes.join(' '),
      effects: simulationResult.effects || [],
      warnings: simulationResult.warnings || [],
      mappingReason: tool.mappingReason,
      mappingConfidence: tool.mappingConfidence,
    };
  });

  const blockedCount = steps.filter((s) => s.status === 'BLOCKED_BY_GATE').length;
  const failedCount = steps.filter((s) => s.status === 'SIMULATED_FAIL').length;
  const skippedCount = steps.filter((s) => s.status === 'SKIPPED').length;
  const okCount = steps.filter((s) => s.status === 'SIMULATED_OK').length;

  let overallStatus = 'SIMULATED';
  if (blockedCount > 0) overallStatus = 'BLOCKED';
  else if (failedCount > 0) overallStatus = 'FAILED';
  else if (skippedCount === steps.length) overallStatus = 'SKIPPED';

  return {
    traceId,
    mode: 'DRY_RUN',
    steps,
    overallStatus,
    summary: {
      total: steps.length,
      ok: okCount,
      blocked: blockedCount,
      failed: failedCount,
      skipped: skippedCount,
    },
  };
};

const REAL_EXECUTABLE_TOOLS = new Set(['enable_checklist']);

const execute = ({ executionPlan = [], traceId, runId, tenantId = 'default', gateApproved }) => {
  const enabled = process.env.EXECUTION_ENABLED === 'true';
  if (!enabled) {
    throw new Error('EXECUTION_DISABLED');
  }
  if (!gateApproved) {
    throw new Error('GATE_NOT_APPROVED');
  }

  const steps = executionPlan.map((tool, index) => {
    const step = index + 1;
    if (tool.unexecutable || !tool.toolId) {
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED_REAL_EXECUTION',
        notes: 'Unexecutable action (no tool mapping).',
        effects: [],
        warnings: ['unknown_action_tool'],
      };
    }
    const isAllowed = REAL_EXECUTABLE_TOOLS.has(tool.toolId);
    if (!isAllowed) {
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED_REAL_EXECUTION',
        notes: 'Real execution not authorized for this tool; dry-run only.',
        effects: [],
        warnings: ['real_execution_not_allowed'],
      };
    }

    try {
      // Minimal, idempotent, no-op real execution (no I/O).
      const notes = 'Executed in guarded mode (no external side effects).';
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'EXECUTED',
        notes,
        effects: ['Executed (simulated, no real side effects)'],
        warnings: [],
      };
    } catch (error) {
      return {
        step,
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'FAILED',
        notes: `Execution error: ${error.message}`,
        effects: [],
        warnings: [error.message],
      };
    }
  });

  const okCount = steps.filter((s) => s.status === 'EXECUTED').length;
  const failedCount = steps.filter((s) => s.status === 'FAILED').length;
  const skippedCount = steps.filter((s) => s.status === 'SKIPPED_REAL_EXECUTION').length;

  let overallStatus = 'EXECUTED';
  if (failedCount > 0) overallStatus = 'FAILED';
  else if (skippedCount === steps.length) overallStatus = 'SKIPPED';

  return {
    traceId,
    mode: 'REAL',
    steps,
    overallStatus,
    summary: {
      total: steps.length,
      executed: okCount,
      failed: failedCount,
      skipped: skippedCount,
    },
  };
};

const executeAgentWithRetry = async ({
  agentInstance,
  sel,
  meta,
  req,
  payload,
  routed,
  journeyName,
  currentPhase,
  phaseIndex,
  artifactsSoFar,
  tenantId,
  ragContext,
  timeoutMs,
  budget,
  ops,
  learningMap,
  registryIndex,
  getTraceId,
  timeoutGuard,
  sanitizeAgentResponse,
  computeScores,
  circuitBreaker,
  logger,
}) => {
  const traceId = getTraceId(req, payload);
  const start = Date.now();

  // Circuit Breaker Check
  if (circuitBreaker && !circuitBreaker.canProceed(tenantId, 'execution')) {
    if (logger) logger.warn('Agent execution blocked by circuit breaker (execution domain)', { agentId: sel.agentId, tenantId });
    return {
      agentId: sel.agentId,
      status: 'FAIL',
      summary: 'Circuit breaker open',
      actions: [],
      citations: [],
      metrics: { latencyMs: 0 },
      errors: ['circuit_breaker_open'],
      scores: { raw: 0, weighted: 0 },
      mock: true, // Treated as mock failure
    };
  }

  // Build Context for Agent
  const agentContext = {
    traceId,
    runId: req.runId || payload.runId || 'unknown',
    intent: routed.intentNormalized,
    input: req.input,
    context: {
      ...(req.context || {}),
      journey: {
        journeyType: journeyName,
        phaseId: currentPhase,
        phaseIndex,
        phasesExecuted: req.context?.journey?.phasesExecuted || [],
        artifacts: artifactsSoFar || [],
      },
      rag: ragContext,
      budget: budget ? (budget[sel.agentId] || {}) : {},
    },
  };

  let attempts = 0;
  const maxRetries = 1;

  while (attempts <= maxRetries) {
    attempts++;
    try {
      // 1. Run Agent directly
      if (typeof agentInstance.run !== 'function') {
        throw new Error(`Agent ${sel.agentId} has no run method`);
      }

      const executionPromise = agentInstance.run(agentContext);

      // 2. Timeout Guard
      const rawResult = await timeoutGuard(executionPromise, timeoutMs, sel.agentId, traceId);

      // 3. Sanitize
      const latencyMs = Date.now() - start;
      const sanitized = sanitizeAgentResponse(rawResult);
      const result = sanitized.response;

      // Add validation warnings if any
      if (sanitized.warnings && sanitized.warnings.length > 0 && ops && Array.isArray(ops.warnings)) {
        sanitized.warnings.forEach((w) => {
          if (!ops.warnings.includes(w)) ops.warnings.push(w);
        });
      }

      // 4. Compute Scores
      const { raw, weighted } = computeScores(result, meta, meta ? meta.confidenceWeight : 1);
      result.scores = { raw, weighted };
      result.metrics = { ...result.metrics, latencyMs };

      return result;

    } catch (error) {
      const isTimeout = error.message && (error.message.toLowerCase().includes('timeout') || error.message.includes('network'));

      if (attempts <= maxRetries && isTimeout) {
        if (ops && ops.retries) {
          ops.retries.attempted = true;
          ops.retries.count = (ops.retries.count || 0) + 1;
        }
        if (logger) logger.warn('Retrying agent execution due to timeout', { agentId: sel.agentId, attempt: attempts });
        continue;
      }

      const latencyMs = Date.now() - start;
      if (logger) logger.error('Agent execution failed', { agentId: sel.agentId, error: error.message });

      return {
        agentId: sel.agentId,
        status: isTimeout ? 'TIMEOUT' : 'FAIL',
        summary: 'Agent execution failed or threw error',
        actions: [],
        citations: [],
        metrics: { latencyMs },
        errors: [error.message],
        scores: { raw: 0, weighted: 0 },
        mock: false,
      };
    }
  }
};

module.exports = {
  simulate,
  execute,
  executeAgentWithRetry,
};
