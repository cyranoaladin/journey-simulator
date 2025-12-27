const crypto = require('node:crypto');

const DEFAULT_TTL_MS = Number(process.env.WEB3_PIPELINE_TTL_MS || 10 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.WEB3_PIPELINE_MAX_ENTRIES || 200);

const tenants = new Map(); // tenantId -> { store: Map(key -> entry), order: [] }

function makeKey(runId = 'default', tenantId = 'default') {
  // Simplify nested template literal
  const tenantPart = tenantId || 'default';
  const runPart = runId || 'default';
  return `${tenantPart}::${runPart}`;
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
    if (entry && entry.expiresAt && entry.expiresAt < now) {
      toDelete.push(key);
    }
  });
  toDelete.forEach((key) => {
    tenant.store.delete(key);
    const idx = tenant.order.indexOf(key);
    if (idx >= 0) tenant.order.splice(idx, 1);
  });
  while (tenant.order.length > MAX_ENTRIES) {
    const oldest = tenant.order.shift();
    tenant.store.delete(oldest);
  }
}

function generateDeterministicHash(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex').substring(0, 16);
}

function generateProofHash(runId, tenantId) {
  // Simplify nested template literal
  const hashInput = `${tenantId}|${runId}|proof`;
  return generateDeterministicHash(hashInput);
}

function generateAnchorId(runId, tenantId) {
  // Simplify nested template literal
  const hashInput = `${tenantId}|${runId}|anchor`;
  const hash = generateDeterministicHash(hashInput);
  return `anchor_${hash}`;
}

function generateTokenId(runId, tenantId) {
  // Simplify nested template literal
  const hashInput = `${tenantId}|${runId}|mint`;
  const hash = generateDeterministicHash(hashInput);
  return `token_${hash}`;
}

function getState({ tenantId = 'default', runId = 'default' }) {
  prune(tenantId);
  const tenant = ensureTenant(tenantId);
  const key = makeKey(runId, tenantId);
  const entry = tenant.store.get(key);
  if (!entry) {
    return {
      state: 'NONE',
      proof: null,
      anchor: null,
      mint: null,
      history: [],
    };
  }
  return {
    state: entry.state,
    proof: entry.proof || null,
    anchor: entry.anchor || null,
    mint: entry.mint || null,
    history: entry.history || [],
  };
}

function applyAction(action, { tenantId = 'default', runId = 'default' }) {
  prune(tenantId);
  const tenant = ensureTenant(tenantId);
  const key = makeKey(runId, tenantId);
  let entry = tenant.store.get(key);
  if (!entry) {
    entry = {
      state: 'NONE',
      proof: null,
      anchor: null,
      mint: null,
      history: [],
      expiresAt: Date.now() + DEFAULT_TTL_MS,
    };
    tenant.store.set(key, entry);
    if (!tenant.order.includes(key)) tenant.order.push(key);
  }

  const currentState = entry.state;
  const now = Date.now();

  // Check if action already applied (idempotence)
  const lastAction = entry.history.length > 0 ? entry.history[entry.history.length - 1] : null;
  if (lastAction && lastAction.action === action) {
    return {
      success: true,
      idempotent: true,
      state: entry.state,
      proof: entry.proof,
      anchor: entry.anchor,
      mint: entry.mint,
      history: entry.history,
    };
  }

  // Validate transitions
  const validTransitions = {
    proof: ['NONE'],
    anchor: ['PROOF_CREATED'],
    mint: ['ANCHOR_CREATED'],
  };

  const allowedStates = validTransitions[action] || [];
  if (!allowedStates.includes(currentState)) {
    return {
      success: false,
      level: 'WARN',
      reason: 'invalid_web3_transition',
      expected: allowedStates.join(' or '),
      actual: currentState,
      state: currentState,
      proof: entry.proof,
      anchor: entry.anchor,
      mint: entry.mint,
      history: entry.history,
    };
  }

  // Apply transition
  if (action === 'proof') {
    entry.state = 'PROOF_CREATED';
    entry.proof = {
      hash: generateProofHash(runId, tenantId),
      createdAt: now,
    };
    entry.history.push({ action: 'proof', at: now });
  } else if (action === 'anchor') {
    entry.state = 'ANCHOR_CREATED';
    entry.anchor = {
      anchorId: generateAnchorId(runId, tenantId),
      status: 'CONFIRMED',
      createdAt: now,
    };
    entry.history.push({ action: 'anchor', at: now });
  } else if (action === 'mint') {
    entry.state = 'MINT_READY';
    entry.mint = {
      tokenId: generateTokenId(runId, tenantId),
      status: 'READY',
      createdAt: now,
    };
    entry.history.push({ action: 'mint', at: now });
  }

  entry.expiresAt = Date.now() + DEFAULT_TTL_MS;
  tenant.store.set(key, entry);

  return {
    success: true,
    idempotent: false,
    state: entry.state,
    proof: entry.proof,
    anchor: entry.anchor,
    mint: entry.mint,
    history: entry.history,
  };
}

function snapshot({ tenantId = 'default', runId = 'default' }) {
  return getState({ tenantId, runId });
}

function reset({ tenantId = 'default', runId = 'default' }) {
  const tenant = ensureTenant(tenantId);
  const key = makeKey(runId, tenantId);
  tenant.store.delete(key);
  const idx = tenant.order.indexOf(key);
  if (idx >= 0) tenant.order.splice(idx, 1);
}

function summary() {
  const allStates = {};
  tenants.forEach((tenant, tenantId) => {
    tenant.store.forEach((entry) => {
      const state = entry.state || 'NONE';
      allStates[state] = (allStates[state] || 0) + 1;
    });
  });
  return {
    tenants: tenants.size,
    totalEntries: Array.from(tenants.values()).reduce((sum, t) => sum + t.store.size, 0),
    states: allStates,
  };
}

module.exports = {
  getState,
  applyAction,
  snapshot,
  reset,
  summary,
};
