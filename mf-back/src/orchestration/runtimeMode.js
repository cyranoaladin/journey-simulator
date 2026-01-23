/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const registry = require('../agents/registry');

const VALID_MODES = ['demo', 'simulation', 'real'];

const normalizeMode = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (VALID_MODES.includes(normalized)) return normalized;
  return 'simulation';
};

const runtimeHealth = () => {
  const llmKeyPresent = Boolean(process.env.OPENAI_API_KEY);
  const ragUrlConfigured = Boolean(process.env.RAG_SEARCH_URL);
  const ragKeyPresent = Boolean(process.env.RAG_API_KEY);
  const executionEnabled = process.env.EXECUTION_ENABLED === 'true';

  return {
    llm: {
      provider: llmKeyPresent ? 'openai' : 'mock',
      hasKey: llmKeyPresent,
    },
    rag: {
      mode: ragUrlConfigured ? 'remote' : 'local',
      remoteConfigured: ragUrlConfigured,
      hasKey: ragKeyPresent,
    },
    execution: {
      enabled: executionEnabled,
    },
  };
};

const ensureModeAllowed = (mode) => {
  const health = runtimeHealth();
  const issues = [];

  if (mode === 'real') {
    if (!health.llm.hasKey) {
      issues.push('Missing LLM key: OPENAI_API_KEY');
    }
    if (health.rag.remoteConfigured && !health.rag.hasKey) {
      issues.push('Missing RAG key: RAG_API_KEY for defined RAG_SEARCH_URL');
    }
    if (!health.execution.enabled) {
      issues.push('EXECUTION_ENABLED must be true for real mode');
    }
  }

  return {
    mode,
    allowed: issues.length === 0,
    issues,
    health,
  };
};

const registryCoverage = () => {
  const intentsMap = new Map();

  registry.forEach((agent) => {
    const envFlag = process.env[`AGENT_${agent.agentId?.toUpperCase?.() || ''}_ENABLED`];
    let enabled = agent.enabled !== false;
    if (envFlag === 'false') enabled = false;
    if (envFlag === 'true') enabled = true;
    (agent.intents || []).forEach((intent) => {
      if (!intent) return;
      const list = intentsMap.get(intent) || [];
      list.push({ agentId: agent.agentId, enabled });
      intentsMap.set(intent, list);
    });
  });

  const intents = Array.from(intentsMap.entries()).map(([intent, agents]) => ({
    intent,
    agents,
    enabledAgents: agents.filter((a) => a.enabled).map((a) => a.agentId),
  }));

  return {
    totalAgents: registry.length,
    intents,
  };
};

module.exports = {
  normalizeMode,
  ensureModeAllowed,
  runtimeHealth,
  registryCoverage,
};
