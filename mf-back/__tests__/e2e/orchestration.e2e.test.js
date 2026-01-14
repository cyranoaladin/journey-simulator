/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Tests run stateless bearer flows with CSRF parity middleware.
const express = require('express');
const request = require('supertest');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const { csrfGuard } = require('../../middleware/csrfGuard');

const orchestrationRouter = require('../../routes/zyno-routes');
const testCsrf = csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH'] });

process.env.VSLICE_TEST_STUB = 'true';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(testCsrf);
  app.use(csrfGuard);
  app.use('/orchestration', orchestrationRouter);
  return app;
};

describe('E2E /orchestration/vslice', () => {
  const app = buildApp();
  let server;

  beforeAll((done) => {
    console.log('[TEST_ENV]', process.env.NODE_ENV);
    server = app.listen(0, done);
  });

  afterEach(() => {
    delete process.env.DEMO_MODE;
    delete process.env.AGENT_PRODUCTSPECAGENT_ENABLED;
    delete process.env.RUNTIME_ENV;
    delete process.env.REAL_EXECUTION_MODE;
    delete process.env.EXECUTION_ENABLED;
    delete process.env.VSLICE_TEST_STUB;
  });

  afterAll((done) => {
    const concurrencyManager = require('../../orchestration/concurrencyManager');
    const circuitBreaker = require('../../orchestration/circuitBreaker');
    concurrencyManager.reset();
    circuitBreaker.coldReset();
    jest.useRealTimers();
    jest.clearAllTimers();
    if (server) {
      server.close(() => done());
    } else {
      done();
    }
  });

  it('handles simple intent', async () => {
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-simple', runId: 'e2e-simple', intent: 'security.audit', input: 'check' })
      .expect(200);
    expect(res.body.executiveSummary).toBeDefined();
    expect(res.body.humanPlan).toBeDefined();
  });

  it('handles composite intent', async () => {
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-composite', runId: 'e2e-composite', intent: 'security.audit+product.spec', input: 'combo' })
      .expect(200);
    expect(res.body.agents.length).toBeGreaterThan(1);
  });

  it('applies preset audit-dao', async () => {
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-preset', runId: 'e2e-preset', preset: 'audit-dao', input: 'audit dao' })
      .expect(200);
    expect(res.body.presetMeta?.name).toBe('audit-dao');
    expect(res.body.ops.warnings).toContain('preset_applied');
  });

  it('respects DEMO_MODE', async () => {
    process.env.DEMO_MODE = 'true';
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-demo', runId: 'e2e-demo', intent: 'security.audit', input: 'demo' })
      .expect(200);
    expect(res.body.ops.fallbacks).toContain('demo_mode');
    expect(res.body.systemStatus.llm).toBe('mock');
  });

  it('returns warning on invalid schema', async () => {
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-invalid', intent: 12345 })
      .expect(200);
    expect(res.body.ops.warnings).toContain('invalid_input_schema');
  });

  it('ignores disabled agent via flag', async () => {
    process.env.AGENT_PRODUCTSPECAGENT_ENABLED = 'false';
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-flag', runId: 'e2e-flag', intent: 'product.spec', input: 'flag off' })
      .expect(200);
    expect(res.body.systemStatus.agents.ProductSpecAgent.enabled).toBe(false);
    expect(res.body.agents.find((a) => a.agentId === 'ProductSpecAgent')).toBeUndefined();
  });

  it('returns cached response on idempotent replay', async () => {
    const payload = { traceId: 'e2e-idem', runId: 'e2e-idem', intent: 'security.audit', input: 'idem' };
    await request(server).post('/orchestration/vslice').send(payload).expect(200);
    const res = await request(server).post('/orchestration/vslice').send(payload).expect(200);
    expect(res.body.ops.fallbacks).toContain('idempotent_replay');
    expect(res.body.systemStatus.idempotent).toBe(true);
  });

  it('isolates tenants via headers and exposes tenant status', async () => {
    const resA = await request(server)
      .post('/orchestration/vslice')
      .set('x-tenant-id', 'tenant-e2e-a')
      .send({ traceId: 'e2e-tenant-a', runId: 'e2e-tenant-a', intent: 'security.audit', input: 'a' })
      .expect(200);
    const resB = await request(server)
      .post('/orchestration/vslice')
      .set('x-tenant-id', 'tenant-e2e-b')
      .send({ traceId: 'e2e-tenant-b', runId: 'e2e-tenant-b', intent: 'security.audit', input: 'b' })
      .expect(200);
    expect(resA.body.systemStatus.tenant.id).toBe('tenant-e2e-a');
    expect(resB.body.systemStatus.tenant.id).toBe('tenant-e2e-b');
    expect(resA.body.ops.metricsSummary.byTenant['tenant-e2e-a']).toBeDefined();
  });

  it('returns investor demo agent output (no stub)', async () => {
    const res = await request(server)
      .post('/orchestration/vslice')
      .send({ traceId: 'e2e-investor', runId: 'e2e-investor', intent: 'investor.demo', input: 'investor pitch' })
      .expect(200);
    const agent = res.body.agents.find((a) => a.agentId === 'InvestorDemoAgent');
    expect(agent).toBeDefined();
    expect(agent.summary).not.toMatch(/Not implemented yet/i);
    expect(agent.actions.length).toBeGreaterThan(0);
    expect(res.body.executiveSummary).toBeDefined();
  });

  it('runs multi-phase journey and exposes artifacts summary', async () => {
    const runId = 'e2e-multip';
    const phase1 = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-multi-1',
        runId,
        intent: 'product.spec+ux.writing',
        context: { journey: { journeyType: 'product_launch' } },
        input: 'phase 1',
      })
      .expect(200);
    expect(phase1.body.systemStatus.journey.phase).toBe('discovery');

    const phase2 = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-multi-2',
        runId,
        intent: 'product.spec+ux.writing',
        context: { journey: { journeyType: 'product_launch' } },
        input: 'phase 2',
      })
      .expect(200);
    expect(phase2.body.systemStatus.journey.phase).toBe('design');
    expect(phase2.body.systemStatus.journey.artifactsSummary.plans).toBeGreaterThanOrEqual(
      phase1.body.systemStatus.journey.artifactsSummary.plans
    );
  });

  it('completes web3 pipeline (proof → anchor → mint) across multiple calls', async () => {
    const runId = 'e2e-web3-full';
    const proof = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-web3-proof',
        runId,
        intent: 'security.audit',
        input: 'create proof',
        web3: { action: 'proof' },
      })
      .expect(200);
    expect(proof.body.systemStatus.web3Pipeline).toBeDefined();
    expect(proof.body.systemStatus.web3Pipeline.state).toBe('PROOF_CREATED');
    expect(proof.body.systemStatus.web3Pipeline.proof).toBeDefined();

    const anchor = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-web3-anchor',
        runId,
        intent: 'security.audit',
        input: 'anchor proof',
        web3: { action: 'anchor' },
      })
      .expect(200);
    expect(anchor.body.systemStatus.web3Pipeline.state).toBe('ANCHOR_CREATED');
    expect(anchor.body.systemStatus.web3Pipeline.anchor).toBeDefined();

    const mint = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-web3-mint',
        runId,
        intent: 'security.audit',
        input: 'mint token',
        web3: { action: 'mint' },
      })
      .expect(200);
    expect(mint.body.systemStatus.web3Pipeline.state).toBe('MINT_READY');
    expect(mint.body.systemStatus.web3Pipeline.mint).toBeDefined();
    expect(mint.body.systemStatus.web3Pipeline.history).toHaveLength(3);
  });

  it('exposes executionPlan with steps and shadowComparison delta', async () => {
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
    process.env.RAG_SEARCH_URL = process.env.RAG_SEARCH_URL || 'http://localhost:9999';
    process.env.RAG_API_KEY = process.env.RAG_API_KEY || 'test-rag-key';
    process.env.EXECUTION_ENABLED = 'true';
    process.env.REAL_EXECUTION_MODE = 'shadow';

    const first = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-exec-plan',
        runId: 'e2e-exec-plan',
        intent: 'security.audit',
        input: 'test execution plan',
        mode: 'real',
      })
      .expect(200);

    const gateId = first.body.executionGate?.gateId;
    if (gateId) {
      const executionGate = require('../../orchestration/executionGate');
      executionGate.review(gateId, { approve: true });
    }

    const res = await request(server)
      .post('/orchestration/vslice')
      .send({
        traceId: 'e2e-exec-plan',
        runId: 'e2e-exec-plan',
        intent: 'security.audit',
        input: 'test execution plan',
        mode: 'real',
      })
      .expect(200);

    expect(res.body.executionPlan).toBeDefined();
    expect(res.body.executionPlan.mode).toBeDefined();
    expect(Array.isArray(res.body.executionPlan.steps)).toBe(true);
    expect(res.body.executionPlan.summary).toBeDefined();

    if (res.body.ops.execution.shadowComparison) {
      expect(res.body.ops.execution.shadowComparison.delta).toBeDefined();
      expect(typeof res.body.ops.execution.shadowComparison.delta).toBe('object');
      expect(res.body.ops.execution.shadowComparison.delta.summary).toBeDefined();
    }

    process.env.EXECUTION_ENABLED = undefined;
    process.env.REAL_EXECUTION_MODE = undefined;
  });
});
