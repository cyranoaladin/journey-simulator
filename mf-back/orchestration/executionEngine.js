/**
 * Dry-run execution engine: simulates tool execution without side effects.
 * No network, no DB, no external calls.
 */

const simulate = ({ executionPlan = [], traceId }) => {
  const steps = executionPlan.map((tool) => {
    if (tool.unexecutable || !tool.toolId) {
      return {
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED',
        notes: 'Unexecutable action (no tool mapping).',
      };
    }

    const notes = [];
    notes.push('Dry-run only, no side effects.');
    if (tool.requiresConfirmation || tool.sideEffects === 'external' || tool.sideEffects === 'irreversible') {
      notes.push('Requires real execution later.');
    }

    return {
      toolId: tool.toolId,
      action: tool.action,
      sourceAgent: tool.sourceAgent,
      priority: tool.priority,
      status: 'SIMULATED',
      notes: notes.join(' '),
    };
  });

  return {
    traceId,
    mode: 'DRY_RUN',
    steps,
    overallStatus: 'SIMULATED',
  };
};

const REAL_EXECUTABLE_TOOLS = new Set(['enable_checklist']);

const execute = ({ executionPlan = [], traceId, gateApproved }) => {
  const enabled = process.env.EXECUTION_ENABLED === 'true';
  if (!enabled) {
    throw new Error('EXECUTION_DISABLED');
  }
  if (!gateApproved) {
    throw new Error('GATE_NOT_APPROVED');
  }

  const steps = executionPlan.map((tool) => {
    if (tool.unexecutable || !tool.toolId) {
      return {
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED_REAL_EXECUTION',
        notes: 'Unexecutable action (no tool mapping).',
      };
    }
    const isAllowed = REAL_EXECUTABLE_TOOLS.has(tool.toolId);
    if (!isAllowed) {
      return {
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'SKIPPED_REAL_EXECUTION',
        notes: 'Real execution not authorized for this tool; dry-run only.',
      };
    }

    try {
      // Minimal, idempotent, no-op real execution (no I/O).
      const notes = 'Executed in guarded mode (no external side effects).';
      return {
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'EXECUTED',
        notes,
      };
    } catch (error) {
      return {
        toolId: tool.toolId,
        action: tool.action,
        sourceAgent: tool.sourceAgent,
        priority: tool.priority,
        status: 'FAILED',
        notes: `Execution error: ${error.message}`,
      };
    }
  });

  return {
    traceId,
    mode: 'REAL',
    steps,
    overallStatus: 'EXECUTED',
  };
};

module.exports = {
  simulate,
  execute,
};
