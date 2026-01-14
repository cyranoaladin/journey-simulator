/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/* Smoke E2E API/UI (headless) */
// CSRF parity applied to mirror app behavior.
const express = require('express');
const request = require('supertest');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { csrfGuard } = require('../../mf-back/middleware/csrfGuard');

const orchestrationRouter = require('../../mf-back/routes/zyno-routes');
const testCsrf = csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH'] });

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(testCsrf);
  app.use(csrfGuard);
  app.use('/orchestration', orchestrationRouter);
  return app;
};

const app = buildApp();

async function runCase(name, fn) {
  try {
    await fn();
    return { name, status: 'PASS' };
  } catch (err) {
    return { name, status: 'FAIL', error: err.message };
  }
}

(async () => {
  const cases = [];

  cases.push(
    await runCase('api-simple', async () => {
      const res = await request(app)
        .post('/orchestration/vslice')
        .send({ traceId: 'smoke-e2e', runId: 'smoke-e2e', intent: 'security.audit', input: 'smoke' })
        .expect(200);
      if (!res.body.executiveSummary || !res.body.humanPlan) throw new Error('missing summaries');
    })
  );

  cases.push(
    await runCase('api-preset', async () => {
      const res = await request(app)
        .post('/orchestration/vslice')
        .send({ traceId: 'smoke-preset', runId: 'smoke-preset', preset: 'audit-dao', input: 'preset' })
        .expect(200);
      if (res.body.presetMeta?.name !== 'audit-dao') throw new Error('preset meta missing');
    })
  );

  cases.push(
    await runCase('api-idempotent', async () => {
      const payload = { traceId: 'smoke-idem', runId: 'smoke-idem', intent: 'security.audit', input: 'idem' };
      await request(app).post('/orchestration/vslice').send(payload).expect(200);
      const res = await request(app).post('/orchestration/vslice').send(payload).expect(200);
      if (!res.body.ops.fallbacks.includes('idempotent_replay')) throw new Error('no idempotent flag');
    })
  );

  cases.push(
    await runCase('ui-artifacts', async () => {
      const htmlPath = path.join(__dirname, '../../ui-e2e/index.html');
      if (!fs.existsSync(htmlPath)) throw new Error('ui file missing');
      const content = fs.readFileSync(htmlPath, 'utf8');
      if (!content.includes('Executive Summary') || !content.includes('Human Plan')) throw new Error('ui markers missing');
    })
  );

  const status = cases.every((c) => c.status === 'PASS') ? 'PASS' : 'FAIL';
  console.log(JSON.stringify({ status, cases }, null, 2));
  process.exit(status === 'PASS' ? 0 : 1);
})();
