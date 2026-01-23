/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { orchestrateVerticalSlice } = require('../../orchestration/zynoVerticalSlice');
const fs = require('node:fs');
const path = require('node:path');

const fixturesDir = path.join(__dirname, '../../__fixtures__/golden');

function sanitizeForComparison(response) {
  const sanitized = structuredClone(response);

  // Remove or normalize dynamic fields
  const removeDynamic = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach((key) => {
      if (key === 'timestamp' || key === 'durationMs' || key === 'latencyMs') {
        obj[key] = 0;
      } else if (key === 'traceId' || key === 'runId') {
        obj[key] = 'GOLDEN_' + key.toUpperCase();
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach(removeDynamic);
      } else if (typeof obj[key] === 'object') {
        removeDynamic(obj[key]);
      }
    });
  };

  removeDynamic(sanitized);
  return sanitized;
}

function loadGolden(name) {
  const filePath = path.join(fixturesDir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Golden fixture not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Golden Outputs', () => {
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    process.env.OPENAI_API_KEY = '';
    process.env.RAG_SEARCH_URL = '';
  });

  it('matches simple_intent golden snapshot', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-simple',
      runId: 'test-simple',
      intent: 'security.audit',
      input: 'simple audit request',
    });
    const sanitized = sanitizeForComparison(response);
    const golden = loadGolden('simple_intent');

    expect(sanitized).toMatchObject({
      decision: expect.objectContaining({
        overallStatus: expect.any(String),
      }),
      systemStatus: expect.any(Object),
      ops: expect.any(Object),
    });

    // Compare key fields (allowing for minor variations in dynamic content)
    expect(sanitized.decision.overallStatus).toBe(golden.decision.overallStatus);
    expect(sanitized.systemStatus.llm).toBe(golden.systemStatus.llm);
    expect(sanitized.ops.execution.mode).toBe(golden.ops.execution.mode);
  });

  it('matches composite_intent golden snapshot', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-composite',
      runId: 'test-composite',
      intent: 'security.audit+product.spec',
      input: 'composite request',
    });
    const sanitized = sanitizeForComparison(response);
    const golden = loadGolden('composite_intent');

    expect(sanitized.decision.overallStatus).toBe(golden.decision.overallStatus);
    expect(sanitized.agents.length).toBeGreaterThanOrEqual(golden.agents.length);
    // Ensure expected agents are present even if additional agents run in latest registry
    const agentIds = sanitized.agents.map((a) => a.agentId);
    golden.agents.forEach((ga) => {
      expect(agentIds).toContain(ga.agentId);
    });
    expect(sanitized.ops.execution.mode).toBe(golden.ops.execution.mode);
  });

  it('matches preset_audit_dao golden snapshot', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-preset',
      runId: 'test-preset',
      preset: 'audit-dao',
      input: 'audit our DAO',
    });
    const sanitized = sanitizeForComparison(response);
    const golden = loadGolden('preset_audit_dao');

    expect(sanitized.decision.overallStatus).toBe(golden.decision.overallStatus);
    if (golden.systemStatus.presetMeta) {
      expect(sanitized.systemStatus.presetMeta).toBeDefined();
    }
    expect(sanitized.ops.execution.mode).toBe(golden.ops.execution.mode);
  });

  it('matches demo_mode golden snapshot', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-demo',
      runId: 'test-demo',
      intent: 'security.audit',
      input: 'demo request',
    });
    const sanitized = sanitizeForComparison(response);
    const golden = loadGolden('demo_mode');

    expect(sanitized.decision.overallStatus).toBe(golden.decision.overallStatus);
    expect(sanitized.systemStatus.llm).toBe('mock');
    expect(sanitized.ops.execution.mode).toBe(golden.ops.execution.mode);
  });

  it('matches quota_warn golden snapshot structure', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-quota',
      runId: 'test-quota',
      intent: 'security.audit',
      input: 'quota test',
      tenantId: 'test-tenant',
    });
    const sanitized = sanitizeForComparison(response);

    // Check that response has quota-related fields
    expect(sanitized.ops).toBeDefined();
    expect(sanitized.ops.fallbacks).toBeDefined();
    expect(sanitized.ops.execution).toBeDefined();
  });

  it('matches cost_block golden snapshot structure', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-cost',
      runId: 'test-cost',
      intent: 'security.audit+product.spec+governance.dao',
      input: 'high cost request',
    });
    const sanitized = sanitizeForComparison(response);

    // Check that response has cost-related fields
    expect(sanitized.ops).toBeDefined();
    expect(sanitized.ops.costGuards).toBeDefined();
    expect(sanitized.ops.execution).toBeDefined();
  });

  it('matches web3_block golden snapshot structure', async () => {
    const response = await orchestrateVerticalSlice({
      traceId: 'test-web3',
      runId: 'test-web3',
      intent: 'security.audit',
      input: 'mint token',
      web3: { action: 'mint' },
    });
    const sanitized = sanitizeForComparison(response);

    // Check that response has web3-related fields
    expect(sanitized.systemStatus.web3).toBeDefined();
    expect(sanitized.systemStatus.web3Pipeline).toBeDefined();
    expect(sanitized.ops.execution.blockReasons).toBeDefined();
  });
});
