const express = require('express');
const request = require('supertest');

describe('export routes', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    process.env.ADMIN_API_KEY = 'secret';

    app = express();
    app.use(express.json());
    app.use('/', require('../routes/export-routes'));
  });

  afterEach(() => {
    delete process.env.ADMIN_API_KEY;
  });

  const sampleSummary = {
    title: 'DAO Launch Mission',
    userId: 'user-42',
    timestamp: '2024-01-01T12:00:00.000Z',
    aepo: 78,
    aecoPhase: 'launch_dao',
    agents: ['DAOArchitect', 'ComplianceExpert'],
    generatedText: 'DAOArchitect → Validated governance model.\nComplianceExpert → Checklist prête.',
    actions: ['Publier le whitepaper', 'Programmer vote communautaire']
  };

  it('rejects mission export when api key mismatches', async () => {
    const res = await request(app)
      .post('/admin/export/mission')
      .set('x-api-key', 'invalid')
      .send({ summary: sampleSummary })
      .expect(403);

    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when summary payload is missing', async () => {
    const res = await request(app)
      .post('/admin/export/mission')
      .set('x-api-key', 'secret')
      .send({})
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing mission summary payload.' });
  });

  it('generates a PDF mission export when authorized', async () => {
    const res = await request(app)
      .post('/admin/export/mission')
      .set('x-api-key', 'secret')
      .send({ summary: sampleSummary, format: 'pdf' })
      .expect(200);

    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toContain('mission-report');
    expect(res.body.length).toBeGreaterThan(1000);
  });

  it('returns Notion markdown when format=notion', async () => {
    const res = await request(app)
      .post('/admin/export/mission')
      .set('x-api-key', 'secret')
      .send({ summary: sampleSummary, format: 'notion' })
      .expect(200);

    expect(res.body.format).toBe('notion-markdown');
    expect(res.body.content).toContain('# Mission Report');
    expect(res.body.content).toContain('DAOArchitect');
  });
});
