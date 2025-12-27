const DEFAULT_TTL_MS = Number(process.env.ARTIFACT_TTL_MS || 10 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.ARTIFACT_MAX_ENTRIES || 200);

const tenants = new Map(); // tenantId -> { store: Map(key -> entry), order: [] }

function makeKey(runId = 'default', journey = 'default') {
  return `${runId}::${journey}`;
}

function baseArtifacts() {
  return {
    requirements: [],
    risks: [],
    decisions: [],
    plans: [],
    proofs: [],
    executions: [],
    audits: [],
  };
}

function ensureTenant(tenantId = 'default') {
  if (!tenants.has(tenantId)) {
    tenants.set(tenantId, { store: new Map(), order: [] });
  }
  return tenants.get(tenantId);
}

function prune(tenantId = 'default') {
  const tenant = ensureTenant(tenantId);
  const now = Date.now();
  const toDelete = [];
  tenant.order.forEach((key) => {
    const entry = tenant.store.get(key);
    if (!entry) return;
    if (now - entry.updated > DEFAULT_TTL_MS) {
      toDelete.push(key);
    }
  });
  toDelete.forEach((key) => tenant.store.delete(key));
  tenant.order = tenant.order.filter((k) => !toDelete.includes(k));
  while (tenant.store.size > MAX_ENTRIES) {
    const oldest = tenant.order.shift();
    if (oldest) tenant.store.delete(oldest);
  }
}

function getEntry({ tenantId = 'default', runId = 'default', journey = 'default' }) {
  prune(tenantId);
  const tenant = ensureTenant(tenantId);
  const key = makeKey(runId, journey);
  if (!tenant.store.has(key)) return null;
  return tenant.store.get(key);
}

function ensureEntry({ tenantId = 'default', runId = 'default', journey = 'default' }) {
  const tenant = ensureTenant(tenantId);
  const key = makeKey(runId, journey);
  if (!tenant.store.has(key)) {
    tenant.store.set(key, {
      runId,
      journey,
      phases: new Map(), // phase -> { ts, responseSnapshot }
      artifacts: baseArtifacts(),
      updated: Date.now(),
    });
    tenant.order.push(key);
  }
  tenant.order = tenant.order.filter((k) => k !== key).concat(key);
  prune(tenantId);
  return tenant.store.get(key);
}

function extractArtifactsFromAgents(agentResults = []) {
  const artifacts = baseArtifacts();
  agentResults.forEach((r) => {
    if (Array.isArray(r.findings)) {
      r.findings.forEach((f) => {
        const item = f?.item || f?.detail || r.summary;
        if (item) {
          artifacts.requirements.push(item);
          if ((f?.severity || '').toLowerCase() === 'high' || (f?.status || '').toLowerCase() === 'warn') {
            artifacts.risks.push(item);
          }
        }
      });
    }
    if (Array.isArray(r.actions)) {
      r.actions.forEach((a) => {
        if (!a) return;
        const val = typeof a === 'string' ? a : a.action || JSON.stringify(a);
        artifacts.plans.push(val);
      });
    }
    if (Array.isArray(r.citations)) {
      r.citations.forEach((c) => {
        if (!c) return;
        const val = typeof c === 'string' ? c : c.text || JSON.stringify(c);
        artifacts.proofs.push(val);
      });
    }
    if (Array.isArray(r.errors) && r.errors.length > 0) {
      artifacts.audits.push(...r.errors);
    }
  });
  return artifacts;
}

function appendArtifacts({ tenantId = 'default', runId = 'default', journey = 'default', phase, agentResults = [], responseSnapshot }) {
  const entry = ensureEntry({ tenantId, runId, journey });
  const delta = extractArtifactsFromAgents(agentResults);
  Object.keys(delta).forEach((k) => {
    entry.artifacts[k] = (entry.artifacts[k] || []).concat(delta[k] || []);
  });
  entry.updated = Date.now();
  if (phase) {
    entry.phases.set(phase, {
      ts: Date.now(),
      responseSnapshot,
      artifactsDelta: delta,
      agents: agentResults.map((a) => a.agentId),
    });
  }
}

function getArtifacts({ tenantId = 'default', runId = 'default', journey = 'default' }) {
  const entry = getEntry({ tenantId, runId, journey });
  return entry ? entry.artifacts : baseArtifacts();
}

function getPhaseSnapshot({ tenantId = 'default', runId = 'default', journey = 'default', phase }) {
  const entry = getEntry({ tenantId, runId, journey });
  if (!entry) return null;
  return entry.phases.get(phase)?.responseSnapshot || null;
}

function phasesCompleted({ tenantId = 'default', runId = 'default', journey = 'default' }) {
  const entry = getEntry({ tenantId, runId, journey });
  if (!entry) return [];
  return Array.from(entry.phases.keys());
}

function summary() {
  const byTenant = {};
  tenants.forEach((tenantData, tenantId) => {
    prune(tenantId);
    byTenant[tenantId] = {
      entries: tenantData.store.size,
    };
  });
  return { byTenant, ttlMs: DEFAULT_TTL_MS, maxEntries: MAX_ENTRIES };
}

module.exports = {
  appendArtifacts,
  getArtifacts,
  getPhaseSnapshot,
  phasesCompleted,
  summary,
};
