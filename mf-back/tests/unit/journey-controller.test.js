const express = require('express');
const request = require('supertest');

jest.mock('../../controllers/journey-controller', () => jest.requireActual('../../controllers/journey-controller'));
jest.mock('../../models/user');

const journeyController = require('../../controllers/journey-controller');
const User = require('../../models/user');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/quiz/verify', (req, res) => {
    req.user = { id: 'user-1' };
    return journeyController.verifyQuiz(req, res);
  });
  app.post('/mint/request', (req, res) => {
    req.user = { id: 'user-1' };
    return journeyController.requestMint(req, res);
  });
  return app;
};

describe('journey-controller quiz & mint', () => {
  let app;

  beforeAll(() => {
    process.env.QUIZ_ANSWER_MAP = JSON.stringify({ default: ['A', 'B'], 'phase-1': ['A', 'B'] });
    process.env.QUIZ_PASS_THRESHOLD = '80';
    process.env.MINT_MIN_SCORE = '8';
  });

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  describe('verifyQuiz', () => {
    it('should reject bad answers with 400', async () => {
      User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ total_xp: 100, token_transactions: { mfai_tokens: 20 } }) });
      const res = await request(app).post('/quiz/verify').send({ answers: ['X', 'Y'], phaseId: 'phase-1' });
      expect(res.status).toBe(400);
      expect(res.body.pass).toBe(false);
    });

    it('should accept correct answers and increment XP', async () => {
      User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({
        total_xp: 150,
        token_transactions: { mfai_tokens: 30 },
      })});
      const res = await request(app).post('/quiz/verify').send({ answers: ['A', 'B'], phaseId: 'phase-1' });
      expect(res.status).toBe(200);
      expect(res.body.pass).toBe(true);
      expect(res.body.progress.totalXP).toBe(150);
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('requestMint', () => {
    it('should reject if score < 8.0', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ id: 'user-1', wallet_address: 'wallet' }) });
      const res = await request(app).post('/mint/request').send({ score: 7, phaseId: 1 });
      expect(res.status).toBe(403);
    });

    it('should reject if wallet is missing', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ id: 'user-1', wallet_address: null }) });
      const res = await request(app).post('/mint/request').send({ score: 9, phaseId: 1 });
      expect(res.status).toBe(400);
    });

    it('should accept and return jobId when score and wallet are valid', async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ id: 'user-1', wallet_address: 'wallet' }) });
      const res = await request(app).post('/mint/request').send({ score: 9, phaseId: 1 });
      expect(res.status).toBe(202);
      expect(res.body.jobId).toBeDefined();
    });
  });
});
