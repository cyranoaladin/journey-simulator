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

module.exports = {
  simulate,
};
