// 🔁 Zyno Orchestrator (full logic)

const agentRegistry = require('./agentsRegistry');
const { loadTemplateForIntent } = require('../data/parcoursTemplates');
const computeAEPO = require('../metrics/computeAEPO');
const { saveMetric } = require('../memory/agent_metrics');
const agentMemory = require('../memory/agent_memory');

function normalizeReferences(agentResult = {}) {
  if (Array.isArray(agentResult.sources)) {
    return agentResult.sources;
  }
  if (Array.isArray(agentResult.references)) {
    return agentResult.references;
  }
  if (Array.isArray(agentResult.ragEnriched)) {
    return agentResult.ragEnriched;
  }
  if (Array.isArray(agentResult.ragSnippets)) {
    return agentResult.ragSnippets;
  }
  return [];
}

function summarizeOutput(output) {
  if (output == null) {
    return '';
  }
  if (typeof output === 'string') {
    return output.slice(0, 280);
  }
  try {
    return JSON.stringify(output).slice(0, 280);
  } catch (error) {
    return '';
  }
}

function normalizeAgentResponse(agentName, agentResult = {}, context = {}, metadata = {}) {
  const {
    phase = null,
    intent = null,
    input: contextInput = null,
    objective = null,
  } = context;

  const promptSent = agentResult.prompt ?? agentResultPrompt(agentResult) ?? contextInput ?? objective ?? null;
  const references = normalizeReferences(agentResult);
  const durationMs = metadata.durationMs ?? agentResult?.metrics?.durationMs ?? null;
  const startedAt = metadata.startedAt ?? null;
  const completedAt = metadata.completedAt ?? null;

  const metrics = {
    ...(agentResult.metrics || {}),
    durationMs,
    startedAt,
    completedAt,
  };

  const reasoning = agentResult.reasoning ?? agentResult.ae_summary ?? agentResult.summary ?? null;
  const action = agentResult.action ?? agentResult.ae_outcome ?? null;
  const structuredOutput = agentResult.output ?? agentResult.payload ?? null;
  const response = agentResult.response ?? agentResult.rawResponse ?? agentResult.payload ?? null;

  return {
    agent: agentName,
    phase,
    intent,
    prompt: promptSent,
    reasoning,
    action,
    sources: references,
    references,
    ragSnippets: references,
    ragEnriched: references,
    output: structuredOutput,
    response,
    feedback: {
      ae_summary: agentResult.ae_summary ?? null,
      ae_outcome: agentResult.ae_outcome ?? null,
      aepo: metrics?.aepo ?? null,
      aeco: metrics?.aeco ?? null,
    },
    metrics,
    raw: agentResult,
  };
}

function agentResultPrompt(agentResult = {}) {
  if (typeof agentResult.prompt === 'string') {
    return agentResult.prompt;
  }
  if (agentResult?.meta?.prompt) {
    return agentResult.meta.prompt;
  }
  if (agentResult?.payload?.prompt) {
    return agentResult.payload.prompt;
  }
  return null;
}

async function detectIntent(userInput = '') {
  const normalized = (userInput || '').toLowerCase();
  if (normalized.includes('launchpad')) return 'launchpad_readiness';
  if (normalized.includes('dao')) return 'launch_dao';
  if (normalized.includes('audit')) return 'dao_audit';
  if (normalized.includes('nft')) return 'launch_nft';
  if (normalized.includes('token')) return 'token_launch';
  if (normalized.includes('pitch')) return 'investor_pitch';
  if (normalized.includes('build') || normalized.includes('prototype')) return 'product_build';
  if (normalized.includes('onboard')) return 'user_onboarding';
  if (normalized.includes('growth')) return 'growth_strategy';
  if (normalized.includes('réflexion') || normalized.includes('reflection')) return 'reflection_phase';
  return 'default';
}

function determineExecutionMode(intent) {
  const modes = {
    launch_dao: 'sequential',
    launch_nft: 'parallel',
    investor_pitch: 'parallel',
    product_build: 'sequential',
    user_onboarding: 'sequential',
    growth_strategy: 'parallel',
    reflection_phase: 'sync',
    default: 'sync'
  };
  return modes[intent] || 'sync';
}

function mapIntentToAgents(intent) {
  const taskMap = require('./journey-tasks.json');
  return taskMap[intent]?.agents || [];
}

async function triggerAgents(agentNames, mode, context, intent) {
  const results = {};
  const timeline = [];
  const missionInput = context.input || context.objective || '';
  const buildAgentInput = () => ({
    user: context.user || { id: context.userId },
    journey: context.journey || {},
    phase: context.phase || 'Learn',
    input: missionInput,
    objective: context.objective || missionInput,
  });

  const resolveAgent = (name) => {
    const implementation = agentRegistry[name];
    if (!implementation) {
      console.warn(`Agent ${name} is not registered.`);
      return null;
    }
    return implementation;
  };

  const userId = context.userId || (context.user && context.user.id) || 'unknown_user';
  const missionId = context.missionId || context.journey?.missionId || null;

  const executeAgent = async (agentName) => {
    const agent = resolveAgent(agentName);
    if (!agent) {
      return null;
    }

    const startedAt = Date.now();
    try {
      const agentResult = await agent(buildAgentInput(), context);
      const durationMs = Date.now() - startedAt;
      const errorCount = Array.isArray(agentResult?.errors)
        ? agentResult.errors.length
        : agentResult?.error
          ? 1
          : 0;
      const success = agentResult?.success === false ? false : !agentResult?.error;
      const aepoScore = computeAEPO({ duration: durationMs, success, retries: errorCount });

      const metricPayload = {
        score: aepoScore,
        durationMs,
        success,
        errorCount
      };

      saveMetric(agentName, userId, 'AEPO', metricPayload, missionId);
      agentMemory.saveInteraction(agentName, userId, {
        type: 'AEPO',
        missionId,
        score: aepoScore,
        durationMs,
        success,
        errorCount,
        ae_summary: agentResult?.ae_summary ?? null,
        ae_outcome: agentResult?.ae_outcome ?? null,
        payload: agentResult?.payload ?? null
      });
      const completedAt = new Date();
      const normalized = normalizeAgentResponse(
        agentName,
        {
          ...agentResult,
          metrics: {
            ...(agentResult?.metrics || {}),
            aepo: aepoScore,
            durationMs,
            success,
            errorCount
          }
        },
        { ...context, intent },
        {
          durationMs,
          startedAt: new Date(startedAt).toISOString(),
          completedAt: completedAt.toISOString()
        }
      );

      timeline.push({
        agent: agentName,
        phase: context.phase ?? null,
        intent,
        status: success ? 'completed' : 'failed',
        startedAt: normalized.metrics.startedAt ?? new Date(startedAt).toISOString(),
        completedAt: normalized.metrics.completedAt ?? completedAt.toISOString(),
        durationMs,
        prompt: normalized.prompt,
        reasoning: normalized.reasoning,
        action: normalized.action,
        summary: summarizeOutput(normalized.output ?? normalized.response),
        sources: normalized.sources,
        feedback: normalized.feedback,
      });

      return normalized;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const aepoScore = computeAEPO({ duration: durationMs, success: false, retries: 1 });
      saveMetric(agentName, userId, 'AEPO', {
        score: aepoScore,
        durationMs,
        success: false,
        errorCount: 1,
        error: error.message
      }, missionId);
      agentMemory.saveInteraction(agentName, userId, {
        type: 'AEPO',
        missionId,
        score: aepoScore,
        durationMs,
        success: false,
        errorCount: 1,
        error: error.message
      });
      timeline.push({
        agent: agentName,
        phase: context.phase ?? null,
        intent,
        status: 'failed',
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        prompt: context.input ?? context.objective ?? null,
        reasoning: null,
        action: null,
        summary: error?.message ?? 'Erreur non spécifiée',
        sources: [],
        feedback: {
          ae_summary: null,
          ae_outcome: null,
          aepo: aepoScore,
          aeco: null,
        },
      });
      throw error;
    }
  };

  if (mode === 'sync') {
    const agentName = agentNames[0];
    const agentResult = await executeAgent(agentName);
    if (agentResult) {
      results[agentName] = agentResult;
    }
  } else if (mode === 'parallel') {
    const executions = agentNames.map((name) =>
      executeAgent(name).then((res) => ({ name, res }))
    );
    const responses = await Promise.all(executions);
    responses.forEach(({ name, res }) => {
      if (res) {
        results[name] = res;
      }
    });
  } else if (mode === 'sequential') {
    for (const name of agentNames) {
      const agentResult = await executeAgent(name);
      if (agentResult) {
        results[name] = agentResult;
      }
    }
  }
  return { resultMap: results, timeline };
}

async function orchestrateZyno(userInput, context = {}) {
  const intent = await detectIntent(userInput);
  const agents = mapIntentToAgents(intent);
  const mode = determineExecutionMode(intent);
  const template = loadTemplateForIntent(intent);

  if (agents.length === 0) {
    return {
      executedAgents: [],
      intent,
      mode,
      parcoursTemplate: template,
      results: {},
      timeline: [],
      currentStep: null
    };
  }

  const executionResult = await triggerAgents(agents, mode, {
    ...context,
    input: context.input || userInput,
    objective: context.objective || userInput
  }, intent);

  const { resultMap, timeline } = executionResult;
  const currentStep = timeline.length ? timeline[timeline.length - 1] : null;

  if (currentStep && context.userId) {
    agentMemory.update(context.userId, {
      lastStep: currentStep,
      lastIntent: intent,
      lastTimeline: timeline.slice(-5),
    });
  }

  return {
    executedAgents: agents,
    intent,
    mode,
    parcoursTemplate: template,
    results: resultMap,
    timeline,
    currentStep
  };
}

module.exports = { orchestrateZyno };

