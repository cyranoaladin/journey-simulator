const express = require('express');
const request = require('supertest');

jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

describe('dao routes', () => {
  let app;
  let daoState;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.resetModules();
    process.env.ADMIN_API_KEY = 'secret';

    daoState = require('../data/daoState');
    daoState.reset();

    app = express();
    app.use(express.json());
    app.use('/', require('../routes/dao-routes'));
    if (!consoleErrorSpy) {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    }
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    daoState.reset();
    delete process.env.ADMIN_API_KEY;
  });

  afterAll(() => {
    consoleErrorSpy?.mockRestore();
  });

  const createProposal = async () => {
    const res = await request(app)
      .post('/dao/proposals')
      .set('x-api-key', 'secret')
      .send({ title: 'Launch Community Treasury', description: 'Allocate 10% to grants' })
      .expect(201);
    return res.body.proposal;
  };

  it('returns DAO configuration and voters', async () => {
    const res = await request(app)
      .get('/dao/config')
      .expect(200);

    expect(res.body.quorumPercent).toBeGreaterThan(0);
    expect(Array.isArray(res.body.voters)).toBe(true);
    expect(res.body.totalVotingPower).toBeGreaterThan(0);
  });

  it('rejects proposal creation without admin api key', async () => {
    const res = await request(app)
      .post('/dao/proposals')
      .send({ title: 'Test proposal' })
      .expect(403);

    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('creates a proposal and lists it', async () => {
    const proposal = await createProposal();

    const listRes = await request(app)
      .get('/dao/proposals')
      .expect(200);

    expect(listRes.body.proposals).toHaveLength(1);
    expect(listRes.body.proposals[0].id).toBe(proposal.id);
  });

  it('records votes and updates quorum status', async () => {
    const proposal = await createProposal();

    const voteRes = await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'founder', support: true })
      .expect(200);

    expect(voteRes.body.proposal.votes.yes).toBe(3);
    expect(voteRes.body.proposal.quorumMet).toBe(false);

    const secondVote = await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'core_team', support: 'yes' })
      .expect(200);

    expect(secondVote.body.proposal.votes.yes).toBe(5);
    expect(secondVote.body.proposal.quorumMet).toBe(false);

    const thirdVote = await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'community', support: false })
      .expect(200);

    expect(thirdVote.body.proposal.votes.no).toBe(5);
    expect(thirdVote.body.proposal.quorumMet).toBe(true);
  });

  it('prevents duplicate and unauthorized votes', async () => {
    const proposal = await createProposal();

    await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'founder', support: true })
      .expect(200);

    const duplicate = await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'founder', support: true })
      .expect(400);

    expect(duplicate.body.error).toBe('Voter has already voted');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'DAO vote error:',
      expect.any(Error)
    );
    consoleErrorSpy.mockClear();

    const unknown = await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'intruder', support: true })
      .expect(400);

    expect(unknown.body.error).toBe('Voter not registered');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'DAO vote error:',
      expect.any(Error)
    );
  });

  it('allows closing a proposal with admin key', async () => {
    const proposal = await createProposal();

    await request(app)
      .post(`/dao/proposals/${proposal.id}/vote`)
      .send({ voterId: 'founder', support: true })
      .expect(200);

    const closeRes = await request(app)
      .post(`/dao/proposals/${proposal.id}/close`)
      .set('x-api-key', 'secret')
      .expect(200);

    expect(closeRes.body.proposal.status).toBe('closed');
    expect(closeRes.body.proposal.outcome).toBeDefined();
  });

  it('returns 404 when proposal not found', async () => {
    const voteRes = await request(app)
      .post('/dao/proposals/unknown/vote')
      .send({ voterId: 'founder', support: true })
      .expect(404);

    expect(voteRes.body.error).toBe('Proposal not found');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'DAO vote error:',
      expect.any(Error)
    );
  });
});
