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

    // Determine status from simulation result (extracted from nested ternary)
    let stepStatus = 'SKIPPED';
    if (simulationResult.status === 'SIMULATED_OK') {
      stepStatus = 'SIMULATED_OK';
    } else if (simulationResult.status === 'BLOCKED_BY_GATE') {
      stepStatus = 'BLOCKED_BY_GATE';
    } else if (simulationResult.status === 'SIMULATED_FAIL') {
      stepStatus = 'SIMULATED_FAIL';
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

module.exports = {
  simulate,
  execute,
};
