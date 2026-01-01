/**
 * @file feedback.test.js
 * @description Unit tests for POST /api/feedback endpoint
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { csrfGuard } = require('../middleware/csrfGuard');

// Mock of modules used by the route
jest.mock('../memory/agent_metrics', () => ({
  saveFeedback: jest.fn().mockResolvedValue({ saved: true })
}));

// Import mock
const { saveFeedback } = require('../memory/agent_metrics');

// Import route
const feedbackRouter = require('../routes/feedback');

describe('POST /api/feedback – AECO Registration', () => {
  let app;
  let consoleErrorSpy;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    app.use(csrfGuard);
    app.use('/api/feedback', feedbackRouter);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Test 1 : Success ---
  it('should save valid user feedback', async () => {
    const payload = {
      agentName: 'InvestorAgent',
      userId: 'user123',
      missionId: 'mission45',
      rating: 4,
      comment: 'Great feedback, clear and useful.'
    };

    const res = await request(app)
      .post('/api/feedback')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'User feedback successfully recorded.'
    });

    // Verify calls to mocked module
    expect(saveFeedback).toHaveBeenCalledTimes(1);
    expect(saveFeedback).toHaveBeenCalledWith({
      agent: 'InvestorAgent',
      userId: 'user123',
      missionId: 'mission45',
      aepoScore: null,
      aecoFeedback: {
        satisfaction: 4,
        comment: 'Great feedback, clear and useful.'
      }
    });
  });

  // --- Test 2 : Missing fields ---
  it('should return 400 if agentName or userId or rating is missing', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        userId: 'user123',
        rating: 5
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Missing required fields.'
    });

    expect(saveFeedback).not.toHaveBeenCalled();
  });

  // --- Test 3 : Server error ---
  it("should return 500 on internal error", async () => {
    saveFeedback.mockRejectedValue(new Error('Simulated error'));

    const res = await request(app)
      .post('/api/feedback')
      .send({
        agentName: 'InvestorAgent',
        userId: 'user123',
        rating: 3
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Server error while saving feedback.'
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'AECO feedback error:',
      expect.any(Error)
    );
  });
});
