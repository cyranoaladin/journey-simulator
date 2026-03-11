const request = require('supertest');
const app = require('../../dist/app').default;

const originalListen = app.listen.bind(app);
app.listen = (port, ...args) => {
  if (typeof port === 'function' || typeof port === 'undefined') {
    return originalListen(0, '127.0.0.1', port);
  }
  return originalListen(port, '127.0.0.1', ...args);
};

describe('Demo endpoints (current backend)', () => {
  it('POST /journey/load-demo returns persona preset payload', async () => {
    const response = await request(app)
      .post('/journey/load-demo')
      .send({ personaId: 'capital-foundry' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.journey).toEqual({ id: 'capital-foundry' });
    expect(response.body.progress).toEqual({
      total_xp: 480,
      completed_phases: 2,
      token_transactions: { mfai_tokens: 75 },
      nft_certificates: [{ title: 'Capital Strategy Demo NFT' }],
    });
  });

  it('POST /journey/load-demo clamps malformed demoPreset', async () => {
    const response = await request(app)
      .post('/journey/load-demo')
      .send({
        personaId: 'investor-demo',
        demoPreset: {
          total_xp: -10.5,
          completed_phases: 999,
          mfai_tokens: -3,
          nft_certificates: [{}, { title: '' }, { title: '  ' }, { title: 'Valid Demo NFT' }],
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.progress).toEqual({
      total_xp: 0,
      completed_phases: 6,
      token_transactions: { mfai_tokens: 0 },
      nft_certificates: [{ title: 'Valid Demo NFT' }],
    });
  });

  it('GET /healthz returns ok without DB dependency', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('POST /journey/unknown returns not found payload', async () => {
    const response = await request(app).post('/journey/unknown');
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('ROUTE_NOT_FOUND');
  });
});
