/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.JWT_SECRET = 'unit-test-secret';

const request = require('supertest');
const express = require('express');
const { csrfGuard } = require('../middleware/csrfGuard');

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const mockAuth = {
  protect: jest.fn(),
  adminOnly: jest.fn(),
};

jest.mock('../middleware/auth', () => mockAuth);

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(),
  };
});

jest.mock('../models/user', () => {
  const mock = {
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };
  return mock;
});

jest.mock('../models/Journeys', () => {
  const ctor = jest.fn();
  ctor.find = jest.fn();
  ctor.findById = jest.fn();
  ctor.findByIdAndUpdate = jest.fn();
  ctor.findByIdAndDelete = jest.fn();
  return ctor;
});

jest.mock('../models/cours', () => {
  const ctor = jest.fn();
  ctor.find = jest.fn();
  ctor.findById = jest.fn();
  ctor.findByIdAndUpdate = jest.fn();
  ctor.findByIdAndDelete = jest.fn();
  return ctor;
});

jest.mock('../models/userCoursProgress', () => {
  const ctor = jest.fn();
  ctor.findOne = jest.fn();
  return ctor;
});

const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const User = require('../models/user');
const Journey = require('../models/Journeys');
const Cours = require('../models/cours');
const UserCoursProgress = require('../models/userCoursProgress');

const analyticsRouter = require('../routes/analytics-routes');
const coursRouter = require('../routes/cours-routes');
const journeyRouter = require('../routes/journey-routes');
const userRouter = require('../routes/user-routes');
const auth = require('../middleware/auth');

const createApp = (mountPath, router) => {
  const app = express();
  app.use(express.json());
  app.use(csrfGuard);
  app.use(mountPath, router);
  return app;
};

beforeEach(() => {
  jest.clearAllMocks();

  auth.protect.mockImplementation((req, _res, next) => {
    req.user = {
      id: 'user-1',
      _id: 'user-1',
      role: 'admin',
      name: 'Alice',
      email: 'alice@example.com',
      wallet_address: 'wallet',
      persona: 'builder',
    };
    next();
  });

  auth.adminOnly.mockImplementation((_req, _res, next) => next());

  jwt.sign.mockReturnValue('access-token');
  jest.spyOn(crypto, 'randomBytes').mockReturnValue({
    toString: () => 'refresh-token',
  });
  consoleLogSpy.mockClear();
  consoleErrorSpy.mockClear();
});

let consoleLogSpy;
let consoleErrorSpy;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe('Analytics routes', () => {
  const app = createApp('/analytics', analyticsRouter);

  it('POST /analytics/certificate-download succeeds with protect middleware', async () => {
    User.findByIdAndUpdate.mockResolvedValueOnce({});

    const response = await request(app)
      .post('/analytics/certificate-download')
      .send({ certificate_id: 'cert1', download_timestamp: '2025-01-01T00:00:00Z' });

    expect(auth.protect).toHaveBeenCalled();
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-1', expect.any(Object));
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST /analytics/certificate-share handles controller failures', async () => {
    User.findByIdAndUpdate.mockRejectedValueOnce(new Error('db error'));

    const response = await request(app)
      .post('/analytics/certificate-share')
      .send({ certificate_id: 'cert2', share_timestamp: '2025-01-02T00:00:00Z' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error tracking certificate share:',
      expect.any(Error)
    );
  });

  it('GET /analytics/platform-stats aggregates metrics', async () => {
    User.countDocuments
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5);
    User.find
      .mockResolvedValueOnce([{ nft_certificates: [{}] }, { nft_certificates: [{}, {}] }])
      .mockResolvedValueOnce([{ total_xp: 40 }, { total_xp: 60 }]);

    const response = await request(app).get('/analytics/platform-stats');

    expect(User.countDocuments).toHaveBeenCalledTimes(2);
    expect(User.find).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(response.body.stats.totalUsers).toBe(12);
    expect(response.body.stats.activeJourneys).toBe(5);
  });
});

describe('Cours routes', () => {
  const app = createApp('/cours', coursRouter);

  it('POST /cours/cours creates a course', async () => {
    const save = jest.fn().mockResolvedValueOnce();
    const instance = { title: 'ZK Proofs', save };
    Cours.mockImplementationOnce(() => instance);

    const response = await request(app)
      .post('/cours/cours')
      .send({ title: 'ZK Proofs' });

    expect(save).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('ZK Proofs');
  });

  it('GET /cours/get-usser-progress/progress returns 404 when progress missing', async () => {
    UserCoursProgress.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/cours/get-usser-progress/progress')
      .query({ user_id: 'user-1', cours_id: 'course-1' });

    expect(response.status).toBe(404);
  });
});

describe('Journey routes', () => {
  const app = createApp('/journey', journeyRouter);

  it('GET /journey/all-journey pipes through controller', async () => {
    const populate = jest.fn().mockResolvedValueOnce([{ id: 'journey-1' }]);
    Journey.find.mockReturnValueOnce({ populate });

    const response = await request(app).get('/journey/all-journey');

    expect(Journey.find).toHaveBeenCalled();
    expect(populate).toHaveBeenCalledWith('user_id', 'name email');
    expect(response.status).toBe(200);
  });

  it('POST /journey/add-journey uses protect and persists journey', async () => {
    const save = jest.fn().mockResolvedValueOnce();
    Journey.mockImplementationOnce(() => ({ save }));

    const response = await request(app)
      .post('/journey/add-journey')
      .send({ journey_type: 'seed' });

    expect(auth.protect).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  it('POST /journey/add-journey returns 401 if protect denies access', async () => {
    auth.protect.mockImplementationOnce((_req, res, _next) => {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    });

    const response = await request(app)
      .post('/journey/add-journey')
      .send({ journey_type: 'seed' });

    expect(response.status).toBe(401);
  });
});

describe('User routes', () => {
  const app = createApp('/user', userRouter);

  it('POST /user/register provisions tokens on success', async () => {
    const userDoc = {
      _id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      wallet_address: 'wallet',
      persona: 'builder',
      role: 'user',
      refreshToken: undefined,
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(userDoc);

    const response = await request(app)
      .post('/user/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret',
      });

    expect(User.create).toHaveBeenCalled();
    expect(userDoc.save).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBe('access-token');
  });

  it('GET /user/profile returns 200 when protect supplies user', async () => {
    const response = await request(app).get('/user/profile');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /user/all returns 403 when adminOnly blocks access', async () => {
    auth.adminOnly.mockImplementationOnce((_req, res, _next) => {
      res.status(403).json({ success: false, message: 'Forbidden' });
    });

    const response = await request(app).get('/user/all');

    expect(response.status).toBe(403);
  });

  it('GET /user/all returns users when admin allowed', async () => {
    auth.adminOnly.mockImplementation((_req, _res, next) => next());
    const select = jest.fn().mockResolvedValueOnce([{ _id: 'user-1' }]);
    User.find.mockReturnValueOnce({ select });

    const response = await request(app).get('/user/all');

    expect(User.find).toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith('-password');
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
  });
});
