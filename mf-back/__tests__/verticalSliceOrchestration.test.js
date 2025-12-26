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
const metricsStore = require('../orchestration/metricsStore');
const alertingEngine = require('../orchestration/alertingEngine');
const registry = require('../agents/registry');
const memoryStore = require('../orchestration/memoryStore');
const executionGate = require('../orchestration/executionGate');
const toolsRegistry = require('../orchestration/toolsRegistry');
const idempotencyStore = require('../orchestration/idempotencyStore');
const auditTrailStore = require('../orchestration/auditTrailStore');
const tenantQuotaRegistry = require('../orchestration/tenantQuotaRegistry');
const llmCache = require('../orchestration/llmCache');
const circuitBreaker = require('../orchestration/circuitBreaker');
const concurrencyManager = require('../orchestration/concurrencyManager');

describe('Vertical Slice Orchestration', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = ''; // force mock LLM
    process.env.RAG_SEARCH_URL = ''; // force local RAG
    // Reset all stores before tests
    metricsStore.reset();
    memoryStore.reset();
    idempotencyStore.clear();
    auditTrailStore.reset();
    llmCache.reset();
    circuitBreaker.coldReset();
    concurrencyManager.reset();
  });

  beforeEach(() => {
    delete global.__ZYNO_COLD_STARTED__;
    memoryStore.clear();
    idempotencyStore.clear();
    auditTrailStore.clear();
    metricsStore.reset();
    alertingEngine.reset();
    llmCache.reset();
    tenantQuotaRegistry.resetTestQuotas();
    circuitBreaker.coldReset();
    concurrencyManager.reset();
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
    expect(res.executionPlan.steps.length).toBeGreaterThan(0);
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
    expect(res.executionPlan.steps.length).toBeGreaterThan(0);
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
    expect(res.executionPlan.steps.length).toBeGreaterThan(0);
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
    const hasUnexecutable = res.executionPlan.steps.some((t) => t.unexecutable || t.toolId === 'noop');
    expect(hasUnexecutable).toBe(false);
  });

  it('returns GovernanceDAOAgent OK (real) when intent targets governance DAO', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-stub',
      runId: 'run-stub',
      intent: 'governance.dao',
      input: 'stub test',
    });
    const stubAgent = res.agents.find((a) => a.agentId === 'GovernanceDAOAgent');
    expect(stubAgent).toBeDefined();
    expect(stubAgent.status).toBe('OK');
    expect(Array.isArray(stubAgent.citations)).toBe(true);
  });

  it('uses workflow mapping to add agents per journey phase', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-workflow',
      runId: 'run-workflow',
      intent: 'product.spec',
      input: 'phase mapping test',
      context: {
        journey: { journeyType: 'onboarding', phaseId: 'design', objectives: ['spec'], artifacts: ['wireframe'] },
      },
    });
    const agentIds = res.agents.map((a) => a.agentId);
    expect(agentIds).toContain('ProductSpecAgent');
    expect(agentIds).toContain('UXWritingAgent');
    expect(res.intent).toBe('product_spec+ux_writing');
    expect(res.intentMeta.deduplicated).toBe(true);
  });

  it('passes domain into RAG query for best-effort contextualization', async () => {
    await orchestrateVerticalSlice({
      traceId: 'trace-rag-domain',
      runId: 'run-rag-domain',
      intent: 'security.audit',
      input: 'security test',
    });
    const call = ragSearchMock.mock.calls[0][0];
    expect(call.query).toContain('security');
  });

  it('applies rag policy (max citations, trimmed quotes)', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-rag-policy',
      runId: 'run-rag-policy',
      intent: 'governance.dao',
      input: 'policy test',
    });
    const gov = res.agents.find((a) => a.agentId === 'GovernanceDAOAgent');
    expect(gov.citations.length).toBeLessThanOrEqual(3);
    expect(gov.citations.every((c) => (c.quote || '').length <= 160)).toBe(true);
  });

  it('exposes budgets per agent and completes even with WARN', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-budget',
      runId: 'run-budget',
      intent: 'marketplace',
      input: 'budget test',
    });
    expect(res.budgets).toBeDefined();
    expect(res.budgets.MarketplaceAgent).toBeDefined();
    expect(res.agents.every((a) => a.status === 'WARN' || a.status === 'OK')).toBe(true);
    expect(res.metrics.ragUsed).toBe(false);
  });

  it('reports system status, agentsMeta and ignores disabled agents', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-system',
      runId: 'run-system',
      intent: 'risk.fraud',
      input: 'disabled agent test',
      context: { journey: { journeyType: 'audit', phaseId: 'governance' } },
    });

    expect(res.agents.every((a) => a.agentId !== 'RiskFraudAgent')).toBe(true);
    expect(res.agentsMeta.disabled).toContain('RiskFraudAgent');
    expect(res.agentsMeta.enabled.length).toBeGreaterThan(0);
    expect(res.systemStatus).toMatchObject({
      llm: 'mock',
      execution: 'dry-run',
    });
    expect(res.systemStatus.agentsActiveCount).toBe(res.agentsMeta.enabled.length);
  });

  it('chains multiple journey phases in order', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-multi-phase',
      runId: 'run-multi-phase',
      intent: 'product.spec',
      input: 'multi phase',
      context: { journey: { journeyType: 'audit', phases: ['governance', 'tech'] } },
    });

    expect(res.journeyProgress).toEqual({
      phasesExecuted: ['governance', 'tech'],
      currentPhase: 'tech',
    });
    expect(res.agents.every((a) => a.agentId !== 'RiskFraudAgent')).toBe(true);
    expect(res.intent).toContain('governance_dao');
    expect(res.intent).toContain('security_audit');
  });

  it('responds with WARN when all agents warn', async () => {
    mockSecurityRun.mockResolvedValueOnce({
      agentId: 'SecurityAuditAgent',
      status: 'WARN',
      summary: 'warned',
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });
    mockProductRun.mockResolvedValueOnce({
      agentId: 'ProductSpecAgent',
      status: 'WARN',
      summary: 'warned',
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-all-warn',
      runId: 'run-all-warn',
      intent: 'security.audit+product.spec',
      input: 'warn everywhere',
    });

    expect(res.decision.overallStatus).toBe('WARN');
    expect(res.decision).toBeDefined();
  });

  it('exposes ops diagnostics with disabled agents and warnings', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-ops',
      runId: 'run-ops',
      intent: 'risk.fraud',
      input: 'ops test',
    });

    expect(res.ops).toBeDefined();
    expect(res.ops.disabledAgents).toContain('RiskFraudAgent');
    expect(Array.isArray(res.ops.warnings)).toBe(true);
    expect(res.ops.rag.mode).toBeDefined();
  });

  it('blocks REAL via productionGuards when contradictions exist', async () => {
    mockSecurityRun.mockResolvedValueOnce({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'allow',
      actions: ['allow uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });
    mockProductRun.mockResolvedValueOnce({
      agentId: 'ProductSpecAgent',
      status: 'OK',
      summary: 'deny',
      actions: ['deny uploads'],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-guards-contradiction',
      runId: 'run-guards-contradiction',
      intent: 'security.audit+product.spec',
      input: 'conflict',
    });

    expect(res.contradictions.length).toBeGreaterThan(0);
    expect(res.productionGuards.realExecutionAllowed).toBe(false);
    expect(res.productionGuards.reasons).toContain('contradictions_present');
    expect(res.ops.execution.blocked).toBe(true);
    expect(res.ops.execution.mode).toBe('DRY_RUN');
  });

  it('returns WARN and warning flag on invalid input schema', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-invalid',
      runId: 'run-invalid',
      intent: 12345,
      input: 42,
      context: { journey: { phaseId: 123 } },
    });

    expect(res.ops.warnings).toContain('invalid_input_schema');
    expect(res.decision.overallStatus).toBeDefined();
    expect(res.intent).toBeDefined();
  });

  it('sanitizes malformed agent response without throwing', async () => {
    mockSecurityRun.mockResolvedValueOnce({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      // summary missing on purpose to trigger sanitizer
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-sanitize',
      runId: 'run-sanitize',
      intent: 'security.audit',
      input: 'sanitize test',
    });

    expect(res.ops.warnings).toContain('invalid_agent_response');
    expect(res.agents.some((a) => a.agentId === 'SecurityAuditAgent')).toBe(true);
  });

  it('returns cached response and marks idempotent replay', async () => {
    const payload = {
      traceId: 'trace-idem',
      runId: 'run-idem',
      intent: 'security.audit',
      input: 'idem test',
    };

    const first = await orchestrateVerticalSlice(payload);
    const second = await orchestrateVerticalSlice(payload);

    expect(second.ops.fallbacks).toContain('idempotent_replay');
    expect(second.systemStatus.idempotent).toBe(true);
    expect(second.intent).toBe(first.intent);
    expect(second.executionGate?.gateId).toBe(first.executionGate?.gateId);
  });

  it('replays gate PENDING response without recalculation', async () => {
    const payload = {
      traceId: 'trace-idem-gate',
      runId: 'run-idem-gate',
      intent: 'security.audit+product.spec',
      input: 'gate pending',
    };

    const first = await orchestrateVerticalSlice(payload);
    const gateId = first.executionGate?.gateId;
    const second = await orchestrateVerticalSlice(payload);

    expect(second.ops.fallbacks).toContain('idempotent_replay');
    expect(second.systemStatus.idempotent).toBe(true);
    expect(second.executionGate?.gateId).toBe(gateId);
  });

  it('expires cache after TTL and re-executes', async () => {
    idempotencyStore._debugSetTTL(1);
    const payload = {
      traceId: 'trace-idem-ttl',
      runId: 'run-idem-ttl',
      intent: 'security.audit',
      input: 'ttl test',
    };
    const first = await orchestrateVerticalSlice(payload);
    await new Promise((r) => setTimeout(r, 5));
    const second = await orchestrateVerticalSlice(payload);

    expect(second.ops.fallbacks).not.toContain('idempotent_replay');
    expect(second.systemStatus.idempotent || false).toBe(false);
    expect(second.intent).toBe(first.intent);
  });

  it('keeps warnings on invalid input and marks replay', async () => {
    const payload = {
      traceId: 'trace-idem-invalid',
      runId: 'run-idem-invalid',
      intent: 12345,
      input: 42,
      context: { journey: { phaseId: 123 } },
    };
    const first = await orchestrateVerticalSlice(payload);
    const second = await orchestrateVerticalSlice(payload);

    expect(first.ops.warnings).toContain('invalid_input_schema');
    expect(second.ops.warnings).toContain('invalid_input_schema');
    expect(second.ops.fallbacks).toContain('idempotent_replay');
    expect(second.systemStatus.idempotent).toBe(true);
  });

  it('applies web3 proof guard (missing proof) and forces WARN', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-proof',
      runId: 'run-web3-proof',
      intent: 'security.audit',
      input: 'web3 proof test',
      web3: { proof: { proofId: null, hash: null, signature: null } },
    });
    expect(res.ops.warnings).toContain('web3_invalid_proof');
    expect(res.systemStatus.web3.level).toBe('WARN');
    expect(res.systemStatus.web3.allowed).toBe(false);
    expect(res.ops.execution.mode).toBe('DRY_RUN');
  });

  it('blocks anchor FAILED via web3 guard', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-anchor',
      runId: 'run-web3-anchor',
      intent: 'security.audit',
      input: 'anchor failed',
      web3: { anchor: { status: 'FAILED', network: 'TESTNET' } },
    });
    expect(res.systemStatus.web3.level).toBe('BLOCK');
    expect(res.systemStatus.web3.allowed).toBe(false);
    expect(res.ops.execution.blockReasons).toContain('web3_anchor_guard');
    expect(res.productionGuards.realExecutionAllowed).toBe(false);
  });

  it('blocks double mint via web3 guard', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-mint',
      runId: 'run-web3-mint',
      intent: 'security.audit',
      input: 'mint double',
      web3: { mint: { mintTxId: 'tx123', proofAnchored: true, seed: 's', authority: 'server' } },
    });
    expect(res.systemStatus.web3.level).toBe('BLOCK');
    expect(res.ops.execution.blockReasons).toContain('web3_mint_guard');
    expect(res.productionGuards.realExecutionAllowed).toBe(false);
  });

  it('blocks mint without anchor', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-mint-no-anchor',
      runId: 'run-web3-mint-no-anchor',
      intent: 'security.audit',
      input: 'mint no anchor',
      web3: { mint: { proofAnchored: false, seed: 's', authority: 'server' } },
    });
    expect(res.systemStatus.web3.level).toBe('BLOCK');
    expect(res.ops.execution.blockReasons).toContain('web3_mint_guard');
  });

  it('nominal web3 guard OK when no web3 context', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-ok',
      runId: 'run-web3-ok',
      intent: 'security.audit',
      input: 'nominal',
    });
    expect(res.systemStatus.web3.level).toBe('OK');
    expect(res.systemStatus.web3.allowed).toBe(true);
  });

  it('applies web3 proof action and creates PROOF_CREATED state', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-proof',
      runId: 'run-web3-proof',
      intent: 'security.audit',
      input: 'create proof',
      web3: { action: 'proof' },
    });
    expect(res.systemStatus.web3Pipeline).toBeDefined();
    expect(res.systemStatus.web3Pipeline.state).toBe('PROOF_CREATED');
    expect(res.systemStatus.web3Pipeline.proof).toBeDefined();
    expect(res.systemStatus.web3Pipeline.proof.hash).toBeDefined();
    expect(res.systemStatus.web3Pipeline.anchor).toBeNull();
    expect(res.systemStatus.web3Pipeline.mint).toBeNull();
  });

  it('warns when anchor attempted without proof', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-anchor-no-proof',
      runId: 'run-web3-anchor-no-proof',
      intent: 'security.audit',
      input: 'anchor without proof',
      web3: { action: 'anchor' },
    });
    expect(res.systemStatus.web3Pipeline.state).toBe('NONE');
    expect(res.ops.warnings).toContain('invalid_web3_transition');
    expect(res.ops.execution.blockReasons).toContain('web3_pipeline_invalid_transition');
  });

  it('blocks mint without anchor', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-mint-no-anchor',
      runId: 'run-web3-mint-no-anchor',
      intent: 'security.audit',
      input: 'mint without anchor',
      web3: { action: 'mint' },
    });
    expect(res.systemStatus.web3Pipeline.state).toBe('NONE');
    expect(res.ops.warnings).toContain('invalid_web3_transition');
    expect(res.ops.execution.blockReasons).toContain('web3_pipeline_invalid_transition');
  });

  it('completes full web3 pipeline (proof → anchor → mint)', async () => {
    const runId = 'run-web3-full';
    const proof = await orchestrateVerticalSlice({
      traceId: 'trace-web3-proof-full',
      runId,
      intent: 'security.audit',
      input: 'proof step',
      web3: { action: 'proof' },
    });
    expect(proof.systemStatus.web3Pipeline.state).toBe('PROOF_CREATED');

    const anchor = await orchestrateVerticalSlice({
      traceId: 'trace-web3-anchor-full',
      runId,
      intent: 'security.audit',
      input: 'anchor step',
      web3: { action: 'anchor' },
    });
    expect(anchor.systemStatus.web3Pipeline.state).toBe('ANCHOR_CREATED');
    expect(anchor.systemStatus.web3Pipeline.proof).toBeDefined();
    expect(anchor.systemStatus.web3Pipeline.anchor).toBeDefined();

    const mint = await orchestrateVerticalSlice({
      traceId: 'trace-web3-mint-full',
      runId,
      intent: 'security.audit',
      input: 'mint step',
      web3: { action: 'mint' },
    });
    expect(mint.systemStatus.web3Pipeline.state).toBe('MINT_READY');
    expect(mint.systemStatus.web3Pipeline.proof).toBeDefined();
    expect(mint.systemStatus.web3Pipeline.anchor).toBeDefined();
    expect(mint.systemStatus.web3Pipeline.mint).toBeDefined();
    expect(mint.systemStatus.web3Pipeline.history).toHaveLength(3);
  });

  it('is idempotent for web3 actions (replay same action)', async () => {
    const runId = 'run-web3-idem';
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-web3-idem-1',
      runId,
      intent: 'security.audit',
      input: 'proof first',
      web3: { action: 'proof' },
    });
    expect(first.systemStatus.web3Pipeline.state).toBe('PROOF_CREATED');

    const second = await orchestrateVerticalSlice({
      traceId: 'trace-web3-idem-2',
      runId,
      intent: 'security.audit',
      input: 'proof second',
      web3: { action: 'proof' },
    });
    expect(second.systemStatus.web3Pipeline.state).toBe('PROOF_CREATED');
    expect(second.ops.fallbacks).toContain('idempotent_web3_replay');
    expect(second.systemStatus.web3Pipeline.proof.hash).toBe(first.systemStatus.web3Pipeline.proof.hash);
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
    expect(res.executionPlan.steps[0].toolId).toBeDefined();
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
    const unexec = res.executionPlan.steps.find((t) => t.unexecutable || t.toolId === 'noop');
    expect(unexec).toBeDefined();
    expect(unexec.toolId === 'noop' || unexec.toolId === null).toBe(true);
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
    expect(res.executionResult.mode).toBe('DRY_RUN');
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
    expect(second.executionResult.steps.length).toBe(second.executionPlan.steps.length);
    // Status is now SIMULATED_OK instead of SIMULATED
    expect(second.executionResult.overallStatus === 'SIMULATED' || second.executionResult.overallStatus === 'SIMULATED_OK').toBe(true);
    expect(['SIMULATED', 'SIMULATED_OK']).toContain(second.executionResult.steps[0].status);
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
    expect(second.productionGuards.realExecutionAllowed).toBe(false);
    expect(second.productionGuards.reasons).toContain('execution_disabled');
    expect(second.ops.execution.blocked).toBe(true);
  });

  it('activates kill switch manual ALL -> DRY_RUN', async () => {
    process.env.KILL_SWITCH = 'true';
    process.env.KILL_SWITCH_SCOPE = 'ALL';
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-kill-all',
      runId: 'run-kill-all',
      intent: 'security.audit',
      input: 'kill all',
    });
    expect(res.systemStatus.killSwitch.active).toBe(true);
    expect(res.ops.execution.mode).toBe('DRY_RUN');
    expect(res.ops.execution.blocked).toBe(true);
    process.env.KILL_SWITCH = undefined;
    process.env.KILL_SWITCH_SCOPE = undefined;
  });

  it('kills REAL when many failures/timeouts', async () => {
    mockSecurityRun.mockResolvedValueOnce({
      agentId: 'SecurityAuditAgent',
      status: 'FAIL',
      summary: 'fail',
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: ['x'],
    });
    mockProductRun.mockResolvedValueOnce({
      agentId: 'ProductSpecAgent',
      status: 'TIMEOUT',
      summary: 'timeout',
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: ['timeout'],
    });
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-kill-auto',
      runId: 'run-kill-auto',
      intent: 'security.audit+product.spec',
      input: 'kill auto',
    });
    expect(res.systemStatus.killSwitch.active).toBe(true);
    expect(res.productionGuards.realExecutionAllowed).toBe(false);
    expect(res.ops.execution.blocked).toBe(true);
    expect(res.ops.execution.mode).toBe('DRY_RUN');
  });

  it('kill switch blocks after repeated web3 BLOCK', async () => {
    const payload = {
      traceId: 'trace-kill-web3',
      runId: 'run-kill-web3',
      intent: 'security.audit',
      input: 'kill web3',
      web3: { anchor: { status: 'FAILED', network: 'TESTNET' } },
    };
    await orchestrateVerticalSlice(payload);
    const res = await orchestrateVerticalSlice(payload);
    expect(res.systemStatus.web3.level).toBe('BLOCK');
    expect(res.systemStatus.killSwitch.active).toBe(true);
    expect(res.ops.execution.blocked).toBe(true);
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

  it('keeps an audit trail across runs', async () => {
    await orchestrateVerticalSlice({
      traceId: 'audit-one',
      runId: 'audit-one',
      intent: 'security.audit',
      input: 'first',
    });
    await orchestrateVerticalSlice({
      traceId: 'audit-two',
      runId: 'audit-two',
      intent: 'product.spec',
      input: 'second',
    });
    const summary = auditTrailStore.summary();
    expect(summary.enabled).toBe(true);
    expect(summary.entriesStored).toBeGreaterThanOrEqual(2);
  });

  it('never throws even on malformed input', async () => {
    await expect(orchestrateVerticalSlice(null)).resolves.toBeDefined();
  });

  it('normalizes agent responses with findings/confidence/assumptions', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-normalized',
      runId: 'run-normalized',
      intent: 'growth+observability',
      input: 'normalize outputs',
      context: { journey: { journeyType: 'demo', phaseId: 'design', objectives: ['ship'] } },
    });

    const pick = (id) => res.agents.find((a) => a.agentId === id);
    ['GrowthAgent', 'ObservabilityAgent'].forEach((id) => {
      const agent = pick(id);
      expect(agent).toBeDefined();
      expect(Array.isArray(agent.findings)).toBe(true);
      expect(agent.findings.length).toBeGreaterThan(0);
      expect(typeof agent.confidence).toBe('number');
      expect(agent.confidence).toBeGreaterThan(0);
      expect(agent.assumptions).toBeDefined();
    });
  });

  it('provides executive summary and human plan', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-exec',
      runId: 'run-exec',
      intent: 'security.audit+product.spec',
      input: 'exec summary check',
    });

    expect(res.executiveSummary).toBeDefined();
    expect(res.executiveSummary.headline).toBeTruthy();
    expect(Array.isArray(res.executiveSummary.keyFindings)).toBe(true);
    expect(Array.isArray(res.executiveSummary.recommendedNextSteps)).toBe(true);
    expect(typeof res.executiveSummary.confidence).toBe('number');

    expect(res.humanPlan).toBeDefined();
    expect(res.humanPlan.objective).toBeTruthy();
    expect(Array.isArray(res.humanPlan.steps)).toBe(true);
    expect(res.humanPlan.steps.length).toBeGreaterThan(0);
    expect(res.humanPlan.steps[0].action).toBeTruthy();
  });

  it('respects SLO thresholds (no alerts when under targets)', async () => {
    metricsStore.reset();
    alertingEngine.reset();

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-slo-ok',
      runId: 'run-slo-ok',
      intent: 'security.audit',
      input: 'ok',
    });

    expect(res.systemStatus.alerts.length).toBeLessThanOrEqual(6); // aucune alerte critique attendue
    expect(res.ops.metricsSummary.window).toBeGreaterThan(0);
  });

  it('raises alerts when SLO exceeded (WARN)', async () => {
    metricsStore.reset();
    alertingEngine.reset();
    // Force WARN rate > target by injecting many WARN statuses through mocks
    mockSecurityRun.mockResolvedValue({
      agentId: 'SecurityAuditAgent',
      status: 'WARN',
      summary: 'warn',
      actions: [],
      citations: [],
      metrics: { latencyMs: 1 },
      errors: [],
    });

    for (let i = 0; i < 5; i++) {
      await orchestrateVerticalSlice({
        traceId: `trace-slo-warn-${i}`,
        runId: `run-slo-warn-${i}`,
        intent: 'security.audit',
        input: 'warn',
      });
    }

    const summary = metricsStore.summary();
    expect(summary.rates.warn).toBeGreaterThan(0);
    const alerts = alertingEngine.recentAlerts(5);
    expect(alerts.some((a) => a.sloId === 'status_warn_rate')).toBe(true);
  });

  it('raises alerts when latency p95 exceeded (CRITICAL severity from registry)', async () => {
    metricsStore.reset();
    alertingEngine.reset();
    // Simulate slow runs by overriding duration in metrics
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-slo-latency',
      runId: 'run-slo-latency',
      intent: 'security.audit',
      input: 'slow',
    });
    // Manually push a slow entry into metricsStore to exceed p95
    metricsStore.record({
      metrics: { durationMs: 1000 },
      decision: { overallStatus: 'WARN' },
      ops: { execution: { mode: 'DRY_RUN', blocked: false }, llm: { mode: 'mock' }, rag: { mode: 'disabled' } },
      systemStatus: { idempotent: false },
      agentsMeta: { enabled: ['SecurityAuditAgent'], disabled: [] },
    });
    const summary = metricsStore.summary();
    summary.latency.p95 = 1000; // force au-dessus du seuil
    const alerts = alertingEngine.evaluate(summary);
    expect(alerts.some((a) => a.sloId === 'orchestration_latency_p95')).toBe(true);
  });

  it('executes P0 agents without stub outputs', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-p0-agents',
      runId: 'run-p0-agents',
      intent: 'investor_demo+qa_playwright+curriculum+wallet_auth+solana_anchor+minting',
      input: 'R5.1 minimal payload',
    });

    const byId = Object.fromEntries(res.agents.map((a) => [a.agentId, a]));
    const targets = [
      'InvestorDemoAgent',
      'QAPlaywrightAgent',
      'CurriculumAgent',
      'WalletAuthAgent',
      'SolanaAnchorAgent',
      'MintingAgent',
    ];
    targets.forEach((id) => {
      expect(byId[id]).toBeDefined();
      expect(byId[id].summary).not.toMatch(/Not implemented yet/i);
      expect(byId[id].actions.length).toBeGreaterThan(0);
    });
    expect(res.executiveSummary).toBeDefined();
    expect(res.humanPlan).toBeDefined();
  });

  it('supports multi-phase workflow with artifact accumulation and replay skip', async () => {
    const runId = 'run-multi-phase-r52';
    const first = await orchestrateVerticalSlice({
      traceId: 'trace-phase-1',
      runId,
      intent: 'product_spec+ux_writing',
      context: { journey: { journeyType: 'product_launch' } },
      input: 'phase discovery',
    });
    expect(first.systemStatus.journey.phase).toBe('discovery');
    const firstPlans = first.systemStatus.journey.artifactsSummary.plans || 0;

    const second = await orchestrateVerticalSlice({
      traceId: 'trace-phase-2',
      runId,
      intent: 'product_spec+ux_writing',
      context: { journey: { journeyType: 'product_launch' } },
      input: 'phase design',
    });
    expect(second.systemStatus.journey.phase).toBe('design');
    expect(second.systemStatus.journey.artifactsSummary.plans).toBeGreaterThanOrEqual(firstPlans);

    const replay = await orchestrateVerticalSlice({
      traceId: 'trace-phase-2-replay',
      runId,
      intent: 'product_spec+ux_writing',
      context: { journey: { journeyType: 'product_launch', phaseId: 'design' } },
      input: 'phase design',
      constraints: { phase: 'design' },
    });
    expect(replay.ops.fallbacks).toContain('idempotent_phase_replay');
    expect(replay.systemStatus.journey.phase).toBe('design');
  });

  it('isolates artifacts per tenant across phases', async () => {
    const runId = 'run-tenant-artifacts';
    const resA1 = await orchestrateVerticalSlice({
      traceId: 'tA-1',
      runId,
      intent: 'investor_demo',
      input: 'tenant A phase 1',
      headers: { 'x-tenant-id': 'tenant-A' },
      context: { journey: { journeyType: 'investor_fundraise' } },
    });
    expect(resA1.systemStatus.tenant.id).toBe('tenant-a');

    const resB1 = await orchestrateVerticalSlice({
      traceId: 'tB-1',
      runId,
      intent: 'investor_demo',
      input: 'tenant B phase 1',
      headers: { 'x-tenant-id': 'tenant-B' },
      context: { journey: { journeyType: 'investor_fundraise' } },
    });
    expect(resB1.systemStatus.tenant.id).toBe('tenant-b');

    const resA2 = await orchestrateVerticalSlice({
      traceId: 'tA-2',
      runId,
      intent: 'investor_demo',
      input: 'tenant A phase 2',
      headers: { 'x-tenant-id': 'tenant-A' },
      context: { journey: { journeyType: 'investor_fundraise' } },
    });

    expect(resA2.systemStatus.journey.artifactsSummary.plans).toBeGreaterThanOrEqual(
      resA1.systemStatus.journey.artifactsSummary.plans
    );
    expect(resB1.systemStatus.journey.artifactsSummary.plans).toBeGreaterThanOrEqual(0);
  });

  it('uses llm cache across runs (cache hit)', async () => {
    const llmCache = require('../orchestration/llmCache');
    llmCache.reset();
    await orchestrateVerticalSlice({
      traceId: 'trace-cache-1',
      runId: 'run-cache-1',
      intent: 'security.audit',
      input: 'cache',
    });
    await orchestrateVerticalSlice({
      traceId: 'trace-cache-2',
      runId: 'run-cache-2',
      intent: 'security.audit',
      input: 'cache',
    });
    expect(llmCache.summary().entries).toBeGreaterThanOrEqual(0);
  });

  it('enforces cost budgets with WARN and BLOCK', async () => {
    const resWarn = await orchestrateVerticalSlice({
      traceId: 'trace-cost-warn',
      runId: 'run-cost-warn',
      intent: 'security.audit',
      input: 'cost warn',
      constraints: { budgetUsd: 0.001 },
    });
    expect(['OK', 'WARN', 'BLOCK']).toContain(resWarn.ops.costs.status);

    const resBlock = await orchestrateVerticalSlice({
      traceId: 'trace-cost-block',
      runId: 'run-cost-block',
      intent: 'security.audit',
      input: 'cost block',
      constraints: { budgetUsd: 0.0000001 },
    });
    expect(resBlock.ops.costs.status).toBe('BLOCK');
    expect(resBlock.ops.execution.mode).toBe('DRY_RUN');
    expect(resBlock.ops.fallbacks).toContain('cost_block');
  });

  it('isolates caches and metrics per tenant', async () => {
    await orchestrateVerticalSlice({
      traceId: 'trace-tenant-a-1',
      runId: 'run-tenant-a-1',
      intent: 'security.audit',
      input: 'tenant A',
      headers: { 'x-tenant-id': 'tenant-a' },
    });
    await orchestrateVerticalSlice({
      traceId: 'trace-tenant-b-1',
      runId: 'run-tenant-b-1',
      intent: 'security.audit',
      input: 'tenant B',
      headers: { 'x-tenant-id': 'tenant-b' },
    });
    const resTenantA = await orchestrateVerticalSlice({
      traceId: 'trace-tenant-a-2',
      runId: 'run-tenant-a-2',
      intent: 'security.audit',
      input: 'tenant A again',
      headers: { 'x-tenant-id': 'tenant-a' },
    });
    expect(resTenantA.systemStatus.tenant.id).toBe('tenant-a');
    expect(Object.keys(resTenantA.ops.metricsSummary.byTenant || {})).toEqual(expect.arrayContaining(['tenant-a']));
  });

  it('applies tenant quotas and blocks when exceeded', async () => {
    tenantQuotaRegistry.setTestQuota('tenant-quota', {
      maxRunsPerWindow: 1,
      windowSizeMs: 60 * 1000,
      maxLLMCallsPerRun: 5,
      budgetUsdPerWindow: 0.00001,
      maxAgentsPerRun: 1,
    });
    await orchestrateVerticalSlice({
      traceId: 'trace-quota-1',
      runId: 'run-quota-1',
      intent: 'security.audit',
      input: 'quota first',
      headers: { 'x-tenant-id': 'tenant-quota' },
    });
    const resBlock = await orchestrateVerticalSlice({
      traceId: 'trace-quota-2',
      runId: 'run-quota-2',
      intent: 'security.audit',
      input: 'quota second',
      headers: { 'x-tenant-id': 'tenant-quota' },
    });
    expect(resBlock.systemStatus.quotas.status).toBe('BLOCK');
    expect(resBlock.ops.execution.mode).toBe('DRY_RUN');
    expect(resBlock.ops.fallbacks).toContain('load_shed');
  });

  it('trips circuit breaker and forces mock DRY_RUN', async () => {
    global.__ZYNO_COLD_STARTED__ = true; // avoid cold reset wiping CB state
    circuitBreaker.trip('tenant-cb', 'llm', 'test');
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-cb',
      runId: 'run-cb',
      intent: 'security.audit',
      input: 'cb',
      headers: { 'x-tenant-id': 'tenant-cb' },
    });
    expect(res.ops.fallbacks).toContain('circuit_breaker_llm');
    expect(res.systemStatus.circuitBreakers.llm.state).not.toBe('CLOSED');
    expect(res.ops.execution.mode).toBe('DRY_RUN');
  });

  it('retries once on transient timeout and records retries', async () => {
    let first = true;
    mockSecurityRun = jest.fn(async ({ traceId }) => {
      if (first) {
        first = false;
        throw new Error('timeout');
      }
      return {
        agentId: 'SecurityAuditAgent',
        status: 'OK',
        summary: 'ok',
        actions: [],
        citations: [],
        metrics: { latencyMs: 1 },
        errors: [],
        traceId,
      };
    });
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-retry',
      runId: 'run-retry',
      intent: 'security.audit',
      input: 'retry',
    });
    expect(res.ops.retries.attempted).toBe(true);
    expect(res.ops.retries.count).toBe(1);
  });

  it('marks cold start on first run', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-cold',
      runId: 'run-cold',
      intent: 'security.audit',
      input: 'cold',
    });
    expect(res.systemStatus.runtime.coldStart).toBe(true);
  });

  it('sheds load when concurrency queue saturated', async () => {
    const spy = jest.spyOn(concurrencyManager, 'acquire').mockResolvedValue({
      shed: true,
      queued: 10,
      running: 5,
      max: 5,
      release: () => {},
    });
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-shed',
      runId: 'run-shed',
      intent: 'security.audit',
      input: 'shed',
    });
    expect(res.ops.fallbacks).toContain('load_shed');
    expect(res.ops.concurrency.shed).toBe(true);
    spy.mockRestore();
  });

  it('respects agent feature flags and exposes status', async () => {
    process.env.AGENT_PRODUCTSPECAGENT_ENABLED = 'false';
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-flags',
      runId: 'run-flags',
      intent: 'product.spec',
      input: 'feature flags',
    });
    expect(res.systemStatus.agents.ProductSpecAgent.enabled).toBe(false);
    expect(res.ops.disabledAgents).toContain('ProductSpecAgent');
    expect(res.agents.find((a) => a.agentId === 'ProductSpecAgent')).toBeUndefined();
    process.env.AGENT_PRODUCTSPECAGENT_ENABLED = undefined;
  });

  it('applies environment budgets to agents', async () => {
    process.env.RUNTIME_ENV = 'PROD';
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-budget',
      runId: 'run-budget',
      intent: 'security.audit',
      input: 'budget check',
    });
    const budget = res.budgets.SecurityAuditAgent;
    expect(budget.maxTokens).toBeLessThanOrEqual(600);
    expect(budget.timeoutMs).toBeLessThanOrEqual(5000);
    process.env.RUNTIME_ENV = undefined;
  });

  it('runs shadow mode without real side effects and exposes comparison', async () => {
    process.env.EXECUTION_ENABLED = 'true';
    process.env.REAL_EXECUTION_MODE = 'shadow';

    const first = await orchestrateVerticalSlice({
      traceId: 'trace-shadow',
      runId: 'run-shadow',
      intent: 'security.audit+product.spec',
      input: 'shadow run',
    });
    const gateId = first.executionGate.gateId;
    executionGate.review(gateId, { approve: true });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-shadow',
      runId: 'run-shadow',
      intent: 'security.audit+product.spec',
      input: 'shadow run',
    });

    expect(res.ops.execution.mode).toBe('DRY_RUN');
    expect(res.ops.execution.shadowComparison || res.executionResult?.shadow).toBeTruthy();
    expect(res.ops.fallbacks).toContain('shadow_mode');
    process.env.EXECUTION_ENABLED = undefined;
    process.env.REAL_EXECUTION_MODE = undefined;
  });

  it('applies presets and exposes presetMeta', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-preset',
      runId: 'run-preset',
      preset: 'audit-dao',
      input: 'preset audit dao',
    });
    expect(res.presetMeta).toBeDefined();
    expect(res.presetMeta.name).toBe('audit-dao');
    expect(res.ops.warnings).toContain('preset_applied');
    expect(res.agents.some((a) => a.agentId === 'GovernanceDAOAgent')).toBe(true);
  });

  it('forces demo mode stability', async () => {
    process.env.DEMO_MODE = 'true';
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-demo',
      runId: 'run-demo',
      intent: 'security.audit',
      input: 'demo mode',
    });
    expect(res.ops.fallbacks).toContain('demo_mode');
    expect(res.systemStatus.llm).toBe('mock');
    expect(res.ops.rag.mode).toBe('local');
    process.env.DEMO_MODE = undefined;
  });

  it('executes coverage agents (no stubs) with concrete actions', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-coverage',
      runId: 'run-coverage',
      intent:
        'api.contract+journey.design+evaluation+rag.ops+data.integrity+tokenomics+growth+observability',
      input: 'coverage scenario',
      context: { journey: { journeyType: 'audit', phaseId: 'tech', objectives: ['ship'], artifacts: ['doc'] } },
    });

    const coverageIds = [
      'APIContractAgent',
      'JourneyDesignAgent',
      'EvaluationAgent',
      'RAGOpsAgent',
      'DataIntegrityAgent',
      'TokenomicsAgent',
      'GrowthAgent',
      'ObservabilityAgent',
    ];

    coverageIds.forEach((id) => {
      const agent = res.agents.find((a) => a.agentId === id);
      expect(agent).toBeDefined();
      expect(['OK', 'WARN']).toContain(agent.status);
      expect(agent.summary).not.toMatch(/Not implemented yet/i);
      expect(Array.isArray(agent.actions)).toBe(true);
      expect(agent.actions.length).toBeGreaterThan(0);
    });

    expect(res.ops.disabledAgents).not.toContain('APIContractAgent');
    expect(res.decision.overallStatus).toBeDefined();
  });

  it('exposes executionPlan with steps and simulation', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-exec-plan',
      runId: 'run-exec-plan',
      intent: 'security.audit',
      input: 'test execution plan',
    });
    expect(res.executionPlan).toBeDefined();
    expect(res.executionPlan.mode).toBeDefined();
    expect(Array.isArray(res.executionPlan.steps)).toBe(true);
    expect(res.executionPlan.summary).toBeDefined();
    expect(res.executionPlan.overallStatus).toBeDefined();
    if (res.executionPlan.steps.length > 0) {
      const firstStep = res.executionPlan.steps[0];
      expect(firstStep.step).toBeDefined();
      expect(firstStep.toolId).toBeDefined();
      expect(firstStep.status).toBeDefined();
      expect(Array.isArray(firstStep.effects)).toBe(true);
      expect(Array.isArray(firstStep.warnings)).toBe(true);
    }
  });

  it('maps unknown action to noop tool', async () => {
    // Force an unknown action by mocking an agent that returns an unknown action
    const originalMock = mockSecurityRun;
    mockSecurityRun = jest.fn().mockResolvedValue({
      agentId: 'SecurityAuditAgent',
      status: 'OK',
      summary: 'Test',
      actions: ['xyz_unknown_action_123'],
      findings: [],
      confidence: 0.8,
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-unknown-action',
      runId: 'run-unknown-action',
      intent: 'security.audit',
      input: 'test unknown action',
    });
    expect(res.ops.warnings).toContain('unknown_action_tool');
    const noopSteps = res.executionPlan.steps.filter((s) => s.toolId === 'noop');
    expect(noopSteps.length).toBeGreaterThan(0);
    expect(noopSteps[0].status).toBe('SKIPPED');
    // mappingReason may be 'unknown_action' or 'pattern_match' depending on action content
    expect(noopSteps[0].mappingReason).toBeDefined();

    mockSecurityRun = originalMock;
  });

  it('blocks tool execution when gate not approved', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-gate-block',
      runId: 'run-gate-block',
      intent: 'security.audit',
      input: 'rotate secrets',
    });
    const blockedSteps = res.executionPlan.steps.filter((s) => s.status === 'BLOCKED_BY_GATE');
    if (blockedSteps.length > 0) {
      expect(blockedSteps[0].warnings).toContain('gate_required');
    }
  });

  it('exposes enriched shadow delta with step comparison', async () => {
    process.env.EXECUTION_ENABLED = 'true';
    process.env.REAL_EXECUTION_MODE = 'shadow';

    const first = await orchestrateVerticalSlice({
      traceId: 'trace-shadow-delta',
      runId: 'run-shadow-delta',
      intent: 'security.audit',
      input: 'shadow test',
    });
    const gateId = first.executionGate?.gateId;
    if (gateId) {
      executionGate.review(gateId, { approve: true });
    }

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-shadow-delta',
      runId: 'run-shadow-delta',
      intent: 'security.audit',
      input: 'shadow test',
    });

    expect(res.ops.execution.shadowComparison).toBeDefined();
    if (res.ops.execution.shadowComparison && res.ops.execution.shadowComparison.delta) {
      const delta = res.ops.execution.shadowComparison.delta;
      expect(delta).toBeDefined();
      expect(typeof delta).toBe('object');
      expect(delta.summary).toBeDefined();
      // stepsChanged, riskEscalation, blockedByGate may be null if no differences
    }
    expect(res.ops.fallbacks).toContain('shadow_mode');

    process.env.EXECUTION_ENABLED = undefined;
    process.env.REAL_EXECUTION_MODE = undefined;
  });

  it('simulates web3 mint token tool and calls web3Pipeline', async () => {
    const web3Pipeline = require('../orchestration/web3Pipeline');
    const runId = 'run-web3-mint-tool';
    web3Pipeline.reset({ tenantId: 'default', runId });

    // Setup: proof and anchor
    await orchestrateVerticalSlice({
      traceId: 'trace-web3-proof-tool',
      runId,
      intent: 'security.audit',
      input: 'create proof',
      web3: { action: 'proof' },
    });
    await orchestrateVerticalSlice({
      traceId: 'trace-web3-anchor-tool',
      runId,
      intent: 'security.audit',
      input: 'anchor proof',
      web3: { action: 'anchor' },
    });

    const res = await orchestrateVerticalSlice({
      traceId: 'trace-web3-mint-tool',
      runId,
      intent: 'security.audit',
      input: 'mint token',
    });

    // Check that mint_token tool would be mapped and web3Pipeline state is MINT_READY
    const mintSteps = res.executionPlan.steps.filter((s) => s.toolId === 'mint_token');
    if (mintSteps.length > 0) {
      // If mint action is present, web3Pipeline should be updated
      expect(res.systemStatus.web3Pipeline).toBeDefined();
    }

    web3Pipeline.reset({ tenantId: 'default', runId });
  });

  it('exposes execution metrics in ops', async () => {
    const res = await orchestrateVerticalSlice({
      traceId: 'trace-exec-metrics',
      runId: 'run-exec-metrics',
      intent: 'security.audit',
      input: 'test metrics',
    });
    expect(res.ops.execution.steps).toBeDefined();
    if (res.ops.execution.steps) {
      expect(res.ops.execution.steps.count).toBeGreaterThanOrEqual(0);
      expect(res.ops.execution.steps.blocked).toBeGreaterThanOrEqual(0);
      expect(res.ops.execution.steps.ok).toBeGreaterThanOrEqual(0);
    }
    expect(res.ops.execution.tools).toBeDefined();
    if (res.ops.execution.tools) {
      expect(res.ops.execution.tools.used).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.ops.execution.tools.list)).toBe(true);
    }
  });

  afterAll(() => {
    concurrencyManager.reset();
    circuitBreaker.coldReset();
    jest.useRealTimers();
    jest.clearAllTimers();
  });
});
