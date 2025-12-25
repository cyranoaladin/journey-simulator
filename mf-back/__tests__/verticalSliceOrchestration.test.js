let mockSecurityRun;
let mockProductRun;

jest.mock('../orchestration/ragClient', () => {
  const searchMock = jest.fn(async () => ({
    chunks: [{ id: 'doc1', title: 'doc', text: 'content', source: 'mock' }],
    source: 'mock',
    latencyMs: 1,
  }));
  return {
    RAGClient: jest.fn().mockImplementation(() => ({
      search: searchMock,
    })),
    __mockSearch: searchMock,
  };
});

jest.mock('../agents/SecurityAuditAgent', () => {
  return jest.fn().mockImplementation(() => ({
    run: (...args) => mockSecurityRun(...args),
  }));
});

jest.mock('../agents/ProductSpecAgent', () => {
  return jest.fn().mockImplementation(() => ({
    run: (...args) => mockProductRun(...args),
  }));
});

const { __mockSearch: ragSearchMock } = require('../orchestration/ragClient');
const { orchestrateVerticalSlice } = require('../orchestration/zynoVerticalSlice');
const registry = require('../agents/registry');
const memoryStore = require('../orchestration/memoryStore');
const executionGate = require('../orchestration/executionGate');
const toolsRegistry = require('../orchestration/toolsRegistry');

describe('Vertical Slice Orchestration', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = ''; // force mock LLM
    process.env.RAG_SEARCH_URL = ''; // force local RAG
  });

  beforeEach(() => {
    memoryStore.clear();
    if (executionGate.clear) executionGate.clear();
    ragSearchMock.mockClear();
    mockSecurityRun = jest.fn(async ({ traceId }) => ({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Security review executed',
      actions: ['allow uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
      mock: true,
    }));
    mockProductRun = jest.fn(async ({ traceId }) => ({
      agentId: 'ProductSpecAgent',
      status: 'OK',
      summary: 'Product spec generated',
      actions: ['enable checklist'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
      mock: true,
    }));
  });

  it('executes single agent for security intent', async () => {
    const traceId = 'trace-single';
    const res = await orchestrateVerticalSlice({
      traceId,
      runId: 'run-single',
      intent: 'security.audit',
      input: 'security audit',
      constraints: { maxTokens: 200 },
    });

    expect(res.traceId).toBe(traceId);
    expect(res.intent).toBe('security_audit');
    expect(res.agents).toHaveLength(1);
    expect(res.agents[0].agentId).toBe('SecurityAuditAgent');
    expect(res.metrics.agentsCount).toBe(1);
    expect(typeof res.summary).toBe('string');
    expect(ragSearchMock).toHaveBeenCalledTimes(1);
    expect(res.agents[0].scores).toBeDefined();
    expect(res.decision.actionPlan.steps.length).toBeGreaterThan(0);
    expect(res.executionPlan.tools.length).toBeGreaterThan(0);
  });

  it('executes two agents for composite intent and calls RAG once', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-composite',
      runId: 'run-composite',
      intent: 'security.audit+product.spec',
      input: 'composite request',
    });

    expect(res.agents).toHaveLength(2);
    expect(res.intent).toBe('security_audit+product_spec');
    expect(res.metrics.agentsCount).toBe(2);
    expect(ragSearchMock).toHaveBeenCalledTimes(1);
    expect(res.decision.overallStatus).toBeDefined();
    expect(res.decision.topFindings.length).toBeGreaterThan(0);
    expect(res.decision.recommendedActions.length).toBeGreaterThan(0);
    expect(res.decision.actionPlan.steps.length).toBeGreaterThan(0);
    expect(res.executionPlan.tools.length).toBeGreaterThan(0);
  });

  it('falls back to ProductSpecAgent on unknown intent', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-fallback',
      runId: 'run-fallback',
      intent: 'unknown.intent',
      input: 'fallback',
    });
    expect(res.agents).toHaveLength(1);
    expect(res.agents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intent).toBe('unknown_intent');
    expect(res.metrics.agentsCount).toBe(1);
  });

  it('marks TIMEOUT when agent exceeds timeout', async () => {
    mockSecurityRun.mockImplementationOnce(() => new Promise(() => {})); // never resolves
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-timeout',
      runId: 'run-timeout',
      intent: 'security.audit+product.spec',
      input: 'long',
      constraints: { timeoutMs: 5 },
    });
    expect(res.agents.length).toBe(2);
    const statuses = res.agents.map((a) => a.status);
    expect(statuses).toContain('TIMEOUT');
    expect(res.metrics.agentsCount).toBe(2);
    expect(res.decision.overallStatus).toBe('TIMEOUT');
    expect(res.decision.topFindings.length).toBe(2);
  });

  it('marks FAIL when agent throws and continues', async () => {
    mockSecurityRun.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-fail',
      runId: 'run-fail',
      intent: 'security.audit+product.spec',
      input: 'fail test',
    });
    const statuses = res.agents.map((a) => a.status);
    expect(statuses).toContain('FAIL');
    expect(res.traceId).toBe('trace-fail');
    expect(res.metrics.agentsCount).toBe(2);
    expect(res.decision.overallStatus).toBe('FAIL');
  });

  it('creates decision with scoring and ordered actions', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-decision',
      runId: 'run-decision',
      intent: 'security.audit+product.spec',
      input: 'decision test',
    });
    expect(res.decision).toBeDefined();
    expect(res.decision.topFindings.length).toBeGreaterThan(0);
    const scores = res.agents.map((a) => a.scores.weighted);
    expect(scores.every((s) => typeof s === 'number')).toBe(true);
    expect(res.decision.recommendedActions.length).toBeGreaterThan(0);
    expect(res.decision.recommendedActions.length).toBeLessThanOrEqual(10);
    expect(res.executionPlan.tools.length).toBeGreaterThan(0);
  });

  it('detects contradictions between agents', async () => {
    mockSecurityRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Must allow uploads',
      actions: ['allow uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));
    mockProductRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'ProductSpecAgent',
      status: 'OK',
      summary: 'Must not allow uploads',
      actions: ['deny uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-contradiction',
      runId: 'run-contradiction',
      intent: 'security.audit+product.spec',
      input: 'contradiction test',
    });

    expect(res.contradictions.length).toBeGreaterThan(0);
    expect(res.decision.topFindings.length).toBeGreaterThan(0);
    const hasConflictStep = res.decision.actionPlan.steps.some((s) => s.conflict);
    expect(hasConflictStep).toBe(true);
    const hasUnexecutable = res.executionPlan.tools.some((t) => t.unexecutable);
    expect(hasUnexecutable).toBe(false);
  });

  it('returns WARN stub agent when intent targets stubbed agent', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-stub',
      runId: 'run-stub',
      intent: 'governance.dao',
      input: 'stub test',
    });
    const stubAgent = res.agents.find((a) => a.agentId === 'GovernanceDAOAgent');
    expect(stubAgent).toBeDefined();
    expect(stubAgent.status).toBe('WARN');
  });

  it('reuses memory when same runId is called twice and keeps deduped plan', async () => {
    const runId = 'run-memory';
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-memory-1',
      runId,
      intent: 'security.audit+product.spec',
      input: 'memory test 1',
    });
    const second = await orchestrateVerticalSlice({
      traceId: 'trace-memory-2',
      runId,
      intent: 'security.audit+product.spec',
      input: 'memory test 2',
    });

    expect(second.memory.reused).toBe(true);
    expect(second.memory.previousActionsCount).toBeGreaterThanOrEqual(1);
    // dedup: actionPlan should not have duplicated actions
    const actions = second.decision.actionPlan.steps.map((s) => s.action);
    const unique = new Set(actions);
    expect(unique.size).toBe(actions.length);
  });

  it('penalizes agents on repeated contradictions (learningScore decreases)', async () => {
    memoryStore.save('hist-contradict-1', {
      agents: [
        { agentId: 'SecurityAuditAgent', status: 'OK' },
        { agentId: 'ProductSpecAgent', status: 'OK' },
      ],
      contradictions: [{ agents: ['SecurityAuditAgent', 'ProductSpecAgent'], reason: 'test' }],
      decision: { recommendedActions: [] },
    });
    memoryStore.save('hist-contradict-2', {
      agents: [
        { agentId: 'SecurityAuditAgent', status: 'OK' },
        { agentId: 'ProductSpecAgent', status: 'OK' },
      ],
      contradictions: [{ agents: ['SecurityAuditAgent', 'ProductSpecAgent'], reason: 'test2' }],
      decision: { recommendedActions: [] },
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'c3',
      runId: 'c3',
      intent: 'security.audit+product.spec',
      input: 'c3',
    });
    const learningSec = res.learning.agents.find((a) => a.agentId === 'SecurityAuditAgent');
    expect(learningSec.learningScore).toBeLessThan(learningSec.baseConfidence);
  });

  it('rewards agents with consistent OK (learningScore increases) and reorders actionPlan', async () => {
    memoryStore.save('hist-ok-1', {
      agents: [{ agentId: 'SecurityAuditAgent', status: 'OK' }],
      contradictions: [],
      decision: { recommendedActions: [{ agentId: 'SecurityAuditAgent', action: 'allow uploads', score: 90 }] },
    });
    memoryStore.save('hist-ok-2', {
      agents: [{ agentId: 'SecurityAuditAgent', status: 'OK' }],
      contradictions: [],
      decision: { recommendedActions: [{ agentId: 'SecurityAuditAgent', action: 'allow uploads', score: 90 }] },
    });

    const res = await orchestrateVerticalSlice({
      traceId: 's3',
      runId: 's3',
      intent: 'security.audit+product.spec',
      input: 's3',
    });

    const learningSec = res.learning.agents.find((a) => a.agentId === 'SecurityAuditAgent');
    const learningProd = res.learning.agents.find((a) => a.agentId === 'ProductSpecAgent');
    expect(learningSec.learningScore).toBeGreaterThan(learningSec.baseConfidence);
    // Action plan should start with highest score (likely Security)
    const firstStep = res.decision.actionPlan.steps[0];
    expect(firstStep.sourceAgent).toBe('SecurityAuditAgent');
    expect(res.executionPlan.tools[0].toolId).toBeDefined();
  });

  it('marks unexecutable actions when no tool mapping is found', async () => {
    mockSecurityRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Custom action',
      actions: ['do something unknown'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-unknown-action',
      runId: 'run-unknown-action',
      intent: 'security.audit',
      input: 'unknown action',
    });
    const unexec = res.executionPlan.tools.find((t) => t.unexecutable);
    expect(unexec).toBeDefined();
    expect(unexec.toolId).toBeNull();
  });

  it('creates an execution gate when a tool requires confirmation', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-gate',
      runId: 'run-gate',
      intent: 'security.audit+product.spec',
      input: 'gate test',
    });
    expect(res.executionGate).toBeDefined();
    expect(res.executionGate.requiresHuman).toBe(true);
    expect(res.executionGate.status).toBe('PENDING');
  });

  it('does not create gate when no critical tool is present', async () => {
    mockSecurityRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Checklist only',
      actions: ['enable checklist'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));
    mockProductRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'ProductSpecAgent',
      status: 'OK',
      summary: 'Checklist only',
      actions: ['enable checklist'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-no-gate',
      runId: 'run-no-gate',
      intent: 'security.audit+product.spec',
      input: 'no gate',
    });
    expect(res.executionGate).toBeNull();
    expect(res.executionResult).toBeNull();
  });

  it('allows approving and rejecting a gate', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-gate-review',
      runId: 'run-gate-review',
      intent: 'security.audit+product.spec',
      input: 'gate review',
    });
    const gateId = res.executionGate.gateId;
    const approved = executionGate.review(gateId, { approve: true });
    expect(approved.status).toBe('APPROVED');
    const rejected = executionGate.review(gateId, { approve: false });
    expect(rejected.status).toBe('REJECTED');
  });

  it('expires gate after TTL', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-gate-expire',
      runId: 'run-gate-expire',
      intent: 'security.audit+product.spec',
      input: 'gate expire',
    });
    const gateId = res.executionGate.gateId;
    executionGate._debugForceExpire(gateId);
    const status = executionGate.review(gateId, { approve: true });
    expect(status.status).toBe('EXPIRED');
  });

  it('runs dry-run execution when gate is approved (ordered, simulatable)', async () => {
    delete process.env.EXECUTION_ENABLED;
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-gate-dry',
      runId: 'run-gate-dry',
      intent: 'security.audit+product.spec',
      input: 'gate dry',
    });
    const gateId = first.executionGate.gateId;
    executionGate.review(gateId, { approve: true });

    const second = await orchestrateVerticalSlice({
      traceId: 'trace-gate-dry',
      runId: 'run-gate-dry',
      intent: 'security.audit+product.spec',
      input: 'gate dry',
    });

    expect(second.executionResult).toBeDefined();
    expect(second.executionResult.mode).toBe('DRY_RUN');
    expect(second.executionResult.steps.length).toBe(second.executionPlan.tools.length);
    expect(second.executionResult.steps[0].status).toBe('SIMULATED');
  });

  it('marks unexecutable step as SKIPPED in dry-run', async () => {
    delete process.env.EXECUTION_ENABLED;
    mockProductRun.mockImplementation(async ({ traceId }) => ({
      agentId: 'ProductSpecAgent',
      status: 'OK',
      summary: 'unknown',
      actions: ['do something unknown'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));

    const first = await orchestrateVerticalSlice({
      traceId: 'trace-gate-dry-unknown',
      runId: 'run-gate-dry-unknown',
      intent: 'security.audit+product.spec',
      input: 'gate dry unknown',
    });
    const gateId = first.executionGate.gateId;
    executionGate.review(gateId, { approve: true });

    const second = await orchestrateVerticalSlice({
      traceId: 'trace-gate-dry-unknown',
      runId: 'run-gate-dry-unknown',
      intent: 'security.audit+product.spec',
      input: 'gate dry unknown',
    });

    const skipped = second.executionResult.steps.find((s) => s.status === 'SKIPPED');
    expect(skipped).toBeDefined();
  });

  it('blocks real execution when EXECUTION_ENABLED is not true', async () => {
    process.env.EXECUTION_ENABLED = 'false';
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-real-blocked',
      runId: 'run-real-blocked',
      intent: 'security.audit+product.spec',
      input: 'real blocked',
    });
    const gateId = first.executionGate.gateId;
    executionGate.review(gateId, { approve: true });
    const second = await orchestrateVerticalSlice({
      traceId: 'trace-real-blocked',
      runId: 'run-real-blocked',
      intent: 'security.audit+product.spec',
      input: 'real blocked',
    });
    expect(second.executionResult.mode).toBe('DRY_RUN');
  });

  it('blocks real execution when gate not approved', async () => {
    process.env.EXECUTION_ENABLED = 'true';
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-real-gate-pending',
      runId: 'run-real-gate-pending',
      intent: 'security.audit+product.spec',
      input: 'pending gate',
    });
    // gate is pending, so no real execution result yet
    expect(res.executionResult).toBeNull();
  });

  it('executes exactly one tool in REAL mode when enabled and gate approved', async () => {
    process.env.EXECUTION_ENABLED = 'true';
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-real-ok',
      runId: 'run-real-ok',
      intent: 'security.audit+product.spec',
      input: 'real ok',
    });
    const gateId = first.executionGate.gateId;
    executionGate.review(gateId, { approve: true });

    // Ensure both allow_uploads (skip) and enable_checklist (real) are present
    mockSecurityRun.mockImplementationOnce(async ({ traceId }) => ({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Allow uploads',
      actions: ['allow uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
      traceId,
    }));

    const second = await orchestrateVerticalSlice({
      traceId: 'trace-real-ok',
      runId: 'run-real-ok',
      intent: 'security.audit+product.spec',
      input: 'real ok',
    });

    expect(second.executionResult.mode).toBe('REAL');
    const executed = second.executionResult.steps.filter((s) => s.status === 'EXECUTED');
    const skipped = second.executionResult.steps.filter((s) => s.status === 'SKIPPED_REAL_EXECUTION');
    expect(executed.length).toBe(1);
    expect(skipped.length).toBeGreaterThan(0);
    process.env.EXECUTION_ENABLED = undefined;
  });
});
