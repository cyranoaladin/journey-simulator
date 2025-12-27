const executionEngine = require('../executionEngine');
const executionGate = require('../executionGate');
const actionToolMapper = require('../actionToolMapper');
const logger = require('../../utils/logger').createLogger(__filename);

/**
 * Service d'exécution pour l'orchestration
 * Réduit la complexité cognitive en isolant toute la logique d'exécution
 */
class ExecutionService {
  /**
   * Construit le plan d'exécution à partir des actions recommandées
   */
  static buildExecutionPlan(actionPlanSteps, ops) {
    const executionTools = actionPlanSteps.map((step, index) => {
      const mapped = actionToolMapper.mapActionToTool(step.action);
      const tool = mapped.tool;
      if (!tool || mapped.toolId === 'noop') {
        if (mapped.reason === 'unknown_action' && step.action && step.action.trim()) {
          if (!ops.warnings.includes('unknown_action_tool')) {
            ops.warnings.push('unknown_action_tool');
          }
        }
        return {
          toolId: 'noop',
          action: step.action,
          sourceAgent: step.sourceAgent,
          priority: step.priority,
          unexecutable: true,
          requiresConfirmation: false,
          requiresGate: false,
          risk: 'LOW',
          web3: false,
          mappingConfidence: mapped.confidence,
          mappingReason: mapped.reason,
        };
      }
      return {
        toolId: tool.toolId || tool.id,
        action: step.action,
        sourceAgent: step.sourceAgent,
        priority: step.priority,
        requiresConfirmation: tool.requiresConfirmation || tool.sideEffects === 'external' || tool.sideEffects === 'irreversible',
        requiresGate: tool.requiresGate || false,
        sideEffects: tool.sideEffects || 'none',
        risk: tool.risk || 'LOW',
        web3: tool.web3 || false,
        mappingConfidence: mapped.confidence,
        mappingReason: mapped.reason,
      };
    });
    return executionTools;
  }

  /**
   * Gère le gate d'exécution (approbation humaine)
   */
  static handleExecutionGate(executionTools, previous, req, payload, getTraceId) {
    let executionGateInfo = null;
    let gateId = previous?.executionGateId || null;
    const needsGate = executionTools.some((t) => t.requiresConfirmation);
    const existingGate = gateId ? executionGate.get(gateId) : null;

    if (existingGate && (existingGate.status === 'APPROVED' || existingGate.status === 'PENDING' || existingGate.status === 'REJECTED')) {
      executionGateInfo = {
        gateId,
        status: existingGate.status,
        requiresHuman: true,
      };
    } else if (needsGate) {
      gateId = executionGate.submit({ traceId: getTraceId(req, payload), runId: req?.runId || payload?.runId || 'unknown', executionPlan: executionTools });
      executionGateInfo = { gateId, status: 'PENDING', requiresHuman: true };
    }
    return { executionGateInfo, gateId };
  }

  /**
   * Simule l'exécution du plan
   */
  static simulateExecution(executionTools, traceId, runId, tenantId, gateApproved) {
    return executionEngine.simulate({
      executionPlan: executionTools,
      traceId,
      runId,
      tenantId,
      gateApproved,
    });
  }

  /**
   * Exécute réellement le plan (si autorisé)
   */
  static executePlan(executionTools, traceId, runId, tenantId, gateApproved) {
    return executionEngine.execute({
      executionPlan: executionTools,
      traceId,
      runId,
      tenantId,
      gateApproved,
    });
  }

  /**
   * Gère l'exécution avec tous les modes (REAL, DRY_RUN, SHADOW)
   */
  static handleExecution(executionTools, executionGateInfo, guardDecision, req, payload, tenantId, getTraceId, ops) {
    const executionGate = require('../executionGate');
    const shadowMode = process.env.REAL_EXECUTION_MODE === 'shadow';
    ops.execution.shadow = shadowMode;
    let executionResult = null;

    if (executionGateInfo?.gateId) {
      const state = executionGate.get(executionGateInfo.gateId);
      if (state?.status === 'APPROVED' && guardDecision.realExecutionAllowed) {
        executionResult = this._executeWithGate(executionTools, state, shadowMode, req, payload, tenantId, getTraceId, ops);
      } else if (state?.status === 'APPROVED' && !guardDecision.realExecutionAllowed) {
        executionResult = this.simulateExecution(executionTools, getTraceId(req, payload), req.runId || req.traceId || 'unknown', tenantId, true);
        ops.execution.attempted = true;
        ops.execution.mode = 'DRY_RUN';
        ops.execution.blocked = true;
      }
    } else if (executionTools.length > 0) {
      executionResult = this._executeWithoutGate(executionTools, guardDecision, shadowMode, req, payload, tenantId, getTraceId, ops);
    }

    return executionResult;
  }

  /**
   * Exécution avec gate (privé)
   */
  static _executeWithGate(executionTools, state, shadowMode, req, payload, tenantId, getTraceId, ops) {
    const logger = require('../../utils/logger').createLogger(__filename);
    try {
      if (process.env.EXECUTION_ENABLED === 'true' && !shadowMode) {
        logger.info('Real execution enabled, attempting guarded execution', { traceId: getTraceId(req, payload), gateId: state.gateId });
        const result = this.executePlan(executionTools, getTraceId(req, payload), req?.runId || payload?.runId || 'unknown', tenantId, true);
        ops.execution.attempted = true;
        ops.execution.mode = 'REAL';
        return result;
      } else if (process.env.EXECUTION_ENABLED === 'true' && shadowMode) {
        return this._executeShadowMode(executionTools, req, payload, tenantId, getTraceId, ops);
      } else {
        const result = this.simulateExecution(executionTools, getTraceId(req, payload), req?.runId || payload?.runId || 'unknown', tenantId, true);
        ops.execution.attempted = true;
        ops.execution.mode = 'DRY_RUN';
        if (!ops.fallbacks.includes('real_disabled_flag')) {
          ops.fallbacks.push('real_disabled_flag');
        }
        return result;
      }
    } catch (err) {
      logger.warn('Execution (real) blocked or failed, falling back to dry-run', {
        traceId: getTraceId(req, payload),
        gateId: state?.gateId,
        error: err.message,
      });
      const result = this.simulateExecution(executionTools, getTraceId(req, payload), req?.runId || payload?.runId || 'unknown', tenantId, state?.status === 'APPROVED');
      ops.execution.attempted = true;
      ops.execution.mode = 'DRY_RUN';
      if (!ops.fallbacks.includes('execution_fallback')) {
        ops.fallbacks.push('execution_fallback');
      }
      return result;
    }
  }

  /**
   * Exécution sans gate (privé)
   */
  static _executeWithoutGate(executionTools, guardDecision, shadowMode, req, payload, tenantId, getTraceId, ops) {
    const baseSimulation = this.simulateExecution(executionTools, getTraceId(req, payload), req.runId || req.traceId || 'unknown', tenantId, false);
    if (guardDecision.realExecutionAllowed && process.env.EXECUTION_ENABLED === 'true' && shadowMode) {
      return this._executeShadowMode(executionTools, req, payload, tenantId, getTraceId, ops, baseSimulation);
    }
    ops.execution.attempted = true;
    ops.execution.mode = guardDecision.realExecutionAllowed ? ops.execution.mode : 'DRY_RUN';
    if (!guardDecision.realExecutionAllowed) ops.execution.blocked = true;
    return baseSimulation;
  }

  /**
   * Mode shadow: compare DRY_RUN et REAL simulé (privé)
   */
  static _executeShadowMode(executionTools, req, payload, tenantId, getTraceId, ops, baseSimulation = null) {
    const dryRun = baseSimulation || this.simulateExecution(executionTools, getTraceId(req, payload), req.runId || req.traceId || 'unknown', tenantId, false);
    const realSimulated = this.simulateExecution(executionTools, getTraceId(req, payload), req.runId || req.traceId || 'unknown', tenantId, true);

    const stepsChanged = [];
    const riskEscalation = [];
    const blockedByGate = [];
    dryRun.steps.forEach((dryStep, idx) => {
      const realStep = realSimulated.steps[idx];
      if (!realStep) return;
      if (dryStep.status !== realStep.status) {
        stepsChanged.push(idx + 1);
      }
      if (realStep.status === 'BLOCKED_BY_GATE') {
        blockedByGate.push(realStep.toolId || 'unknown');
      }
      const dryRisk = executionTools.find((t) => t.toolId === dryStep.toolId)?.risk || 'LOW';
      const realRisk = executionTools.find((t) => t.toolId === realStep.toolId)?.risk || 'LOW';
      const riskLevels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      if (riskLevels[realRisk] > riskLevels[dryRisk]) {
        riskEscalation.push(realStep.toolId || 'unknown');
      }
    });

    ops.execution.shadowComparison = {
      shadow: true,
      dryRun,
      realSimulated,
      delta: {
        stepsChanged: stepsChanged.length > 0 ? stepsChanged : null,
        riskEscalation: riskEscalation.length > 0 ? riskEscalation : null,
        blockedByGate: blockedByGate.length > 0 ? blockedByGate : null,
        summary: stepsChanged.length > 0 || riskEscalation.length > 0 || blockedByGate.length > 0 ? 'Differences detected between DRY_RUN and REAL simulated' : 'No differences',
      },
    };
    ops.fallbacks.push('shadow_mode');
    ops.execution.attempted = true;
    ops.execution.mode = 'DRY_RUN';
    return ops.execution.shadowComparison;
  }
}

module.exports = ExecutionService;
