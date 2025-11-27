process.env.JWT_SECRET = 'unit-test-secret';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

jest.mock('../models/user', () => {
  const mock = {
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  return mock;
});

jest.mock('../models/Journeys', () => {
  const ctor = jest.fn();
  ctor.findById = jest.fn();
  ctor.find = jest.fn();
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
const crypto = require('crypto');
const User = require('../models/user');
const Journey = require('../models/Journeys');
const Cours = require('../models/cours');
const UserCoursProgress = require('../models/userCoursProgress');

const analyticsController = require('../controllers/analytics-controller');
const coursController = require('../controllers/cours-controller');
const journeyController = require('../controllers/journey-controller');
const userController = require('../controllers/user-controller');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let consoleLogSpy;
let consoleErrorSpy;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  jwt.sign.mockReturnValue('access-token');
  crypto.randomBytes.mockReturnValue({ toString: () => 'refresh-token' });
  consoleLogSpy.mockClear();
  consoleErrorSpy.mockClear();
});

describe('Analytics Controller', () => {
  it('tracks certification downloads successfully', async () => {
    User.findByIdAndUpdate.mockResolvedValueOnce({});

    const req = {
      body: {
        certification_id: 'cert1',
        phase: 1,
        user_persona: 'builder',
        download_timestamp: '2025-01-01T00:00:00Z',
      },
      user: { id: 'user-1' },
    };
    const res = createRes();

    await analyticsController.trackCertificationDownload(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'User user-1 downloaded certification cert1 at 2025-01-01T00:00:00Z'
    );
  });

  it('handles certification share failures', async () => {
    User.findByIdAndUpdate.mockRejectedValueOnce(new Error('db error'));

    const req = {
      body: {
        certification_id: 'cert2',
        platform: 'x',
        phase: 2,
        user_persona: 'founder',
        share_timestamp: '2025-01-02T00:00:00Z',
      },
      user: { id: 'user-2' },
    };
    const res = createRes();

    await analyticsController.trackCertificationShare(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error tracking certification share:',
      expect.any(Error)
    );
  });

  it('returns platform statistics', async () => {
    User.countDocuments
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4);
    User.find
      .mockResolvedValueOnce([
        { nft_certificates: [{}, {}] },
        { nft_certificates: [{}] },
      ])
      .mockResolvedValueOnce([
        { total_xp: 50 },
        { total_xp: 30 },
      ]);

    const req = {};
    const res = createRes();

    await analyticsController.getPlatformStats(req, res);

    expect(User.countDocuments).toHaveBeenCalledTimes(2);
    expect(User.find).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        stats: expect.objectContaining({
          totalUsers: 10,
          activeJourneys: 4,
          totalNFTs: 3,
          totalXP: 80,
        }),
      })
    );
  });

  it('formats access pass holders', async () => {
    const sortMock = jest.fn().mockResolvedValueOnce([
      {
        _id: 'holder-1',
        name: 'Alice',
        email: 'alice@example.com',
        subscription: 'gold',
        total_xp: 120,
        nft_certificates: [{ id: 'n1' }],
        createdAt: new Date('2024-01-01'),
      },
    ]);
    const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
    User.find.mockReturnValueOnce({ select: selectMock });

    const res = createRes();
    await analyticsController.getAccessPassHolders({}, res);

    expect(selectMock).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ total_xp: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        holders: [
          expect.objectContaining({
            id: 'holder-1',
            nftCount: 1,
            totalXP: 120,
          }),
        ],
      })
    );
  });
});

describe('Cours Controller', () => {
  it('creates a course successfully', async () => {
    const save = jest.fn().mockResolvedValueOnce();
    const instance = { title: 'ZK Proofs', save };
    Cours.mockImplementationOnce(() => instance);

    const req = { body: { title: 'ZK Proofs' } };
    const res = createRes();

    await coursController.createCours(req, res);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(instance);
  });

  it('handles course creation errors', async () => {
    const save = jest.fn().mockRejectedValueOnce(new Error('validation'));
    Cours.mockImplementationOnce(() => ({ save }));

    const req = { body: {} };
    const res = createRes();

    await coursController.createCours(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'validation' })
    );
  });

  it('returns 404 when course is missing', async () => {
    Cours.findById.mockResolvedValueOnce(null);

    const req = { params: { id: 'missing' } };
    const res = createRes();

    await coursController.getCoursById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Course not found' })
    );
  });

  it('updates existing user course progress', async () => {
    const existing = {
      progress: 10,
      save: jest.fn().mockResolvedValueOnce(),
    };
    UserCoursProgress.findOne.mockResolvedValueOnce(existing);

    const req = {
      body: { user_id: 'user-1', cours_id: 'course-1', progress: 80 },
    };
    const res = createRes();

    await coursController.setUserCoursProgress(req, res);

    expect(existing.progress).toBe(80);
    expect(existing.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('creates new user course progress when missing', async () => {
    UserCoursProgress.findOne.mockResolvedValueOnce(null);
    const save = jest.fn().mockResolvedValueOnce();
    const instance = { save };
    UserCoursProgress.mockImplementationOnce(() => instance);

    const req = {
      body: { user_id: 'user-1', cours_id: 'course-2', progress: 40 },
    };
    const res = createRes();

    await coursController.setUserCoursProgress(req, res);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(instance);
  });

  it('returns 404 when user course progress is absent', async () => {
    UserCoursProgress.findOne.mockResolvedValueOnce(null);

    const req = { query: { user_id: 'user', cours_id: 'missing' } };
    const res = createRes();

    await coursController.getUserCoursProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Progress not found' })
    );
  });
});

describe('Journey Controller', () => {
  it('creates a journey for a user', async () => {
    const save = jest.fn().mockResolvedValueOnce();
    const instance = { save };
    Journey.mockImplementationOnce(() => instance);

    const req = {
      user: { id: 'user-1' },
      body: {
        journey_type: 'seed',
        phases_status: [],
      },
    };
    const res = createRes();

    await journeyController.createJourney(req, res);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('returns user progress when found', async () => {
    const selectedUser = {
      total_xp: 120,
      current_level: 3,
      completed_phases: 5,
      nft_certificates: [],
      token_transactions: {},
      subscription: 'gold',
      persona: 'builder',
    };
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(selectedUser),
    });

    const req = { user: { id: 'user-1' } };
    const res = createRes();

    await journeyController.getUserProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        progress: expect.objectContaining({ total_xp: 120 }),
      })
    );
  });

  it('returns 404 when user progress is missing', async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    const req = { user: { id: 'missing' } };
    const res = createRes();

    await journeyController.getUserProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates user progress and returns the updated payload', async () => {
    const updatedUser = {
      total_xp: 200,
      current_level: 4,
      completed_phases: 6,
    };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(updatedUser),
    });

    const req = {
      user: { id: 'user-1' },
      body: { total_xp: 200, current_level: 4 },
    };
    const res = createRes();

    await journeyController.updateUserProgress(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        progress: expect.objectContaining({ current_level: 4 }),
      })
    );
  });

  it('resets user progress when requested', async () => {
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ id: 'user-1' }),
    });

    const req = { user: { id: 'user-1' } };
    const res = createRes();

    await journeyController.resetUserProgress(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('completes a phase and pushes nft certificate', async () => {
    const updated = {
      completed_phases: 3,
      nft_certificates: [{ phase: 1 }],
    };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(updated),
    });

    const req = {
      user: { id: 'user-1' },
      body: { phase_number: 2, score: 90, nft_address: 'nft-1' },
    };
    const res = createRes();

    await journeyController.completePhase(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('fetches all journeys with populated users', async () => {
    const populate = jest.fn().mockResolvedValueOnce([{ id: 'journey-1' }]);
    Journey.find.mockReturnValueOnce({ populate });

    const res = createRes();
    await journeyController.getAllJourney({}, res);

    expect(populate).toHaveBeenCalledWith('user_id', 'name email');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deletes a journey', async () => {
    Journey.findByIdAndDelete.mockResolvedValueOnce();

    const req = { params: { id: 'journey-1' } };
    const res = createRes();

    await journeyController.deleteJourney(req, res);

    expect(Journey.findByIdAndDelete).toHaveBeenCalledWith('journey-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('User Controller', () => {
  it('registers a new user', async () => {
    const savedUser = {
      _id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      wallet_address: 'wallet',
      persona: 'builder',
      role: 'user',
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(savedUser);

    const req = {
      body: {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret',
        wallet_address: 'wallet',
        persona: 'builder',
      },
    };
    const res = createRes();

    await userController.registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@example.com' })
    );
    expect(savedUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );
  });

  it('blocks duplicate user registrations', async () => {
    User.findOne.mockResolvedValueOnce({ _id: 'existing' });

    const req = {
      body: {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'secret',
      },
    };
    const res = createRes();

    await userController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('logs in an active user', async () => {
    const userDoc = {
      _id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'user',
      wallet_address: 'wallet',
      is_active: true,
      comparePassword: jest.fn().mockResolvedValueOnce(true),
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findOne.mockResolvedValueOnce(userDoc);

    const req = {
      body: { email: 'alice@example.com', password: 'secret' },
    };
    const res = createRes();

    await userController.loginUser(req, res);

    expect(userDoc.comparePassword).toHaveBeenCalledWith('secret');
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'refresh-token' })
    );
  });

  it('rejects login with wrong password', async () => {
    const userDoc = {
      email: 'alice@example.com',
      comparePassword: jest.fn().mockResolvedValueOnce(false),
      is_active: true,
    };
    User.findOne.mockResolvedValueOnce(userDoc);

    const req = { body: { email: 'alice@example.com', password: 'bad' } };
    const res = createRes();

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns access token from refresh token', async () => {
    const userDoc = {
      _id: 'user-1',
      email: 'alice@example.com',
      role: 'user',
    };
    User.findOne.mockResolvedValueOnce(userDoc);

    const req = { body: { refreshToken: 'refresh-token' } };
    const res = createRes();

    await userController.refreshToken(req, res);

    expect(User.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'refresh-token' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'access-token' })
    );
  });

  it('rejects refresh token without payload', async () => {
    const res = createRes();
    await userController.refreshToken({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('logs out a user by clearing refresh token', async () => {
    const userDoc = {
      refreshToken: 'refresh-token',
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findOne.mockResolvedValueOnce(userDoc);

    const req = { body: { refreshToken: 'refresh-token' } };
    const res = createRes();

    await userController.logoutUser(req, res);

    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('prevents role change by non-admins', async () => {
    const req = {
      user: { role: 'user', id: 'user-1' },
      params: { id: 'user-2' },
      body: { role: 'admin' },
    };
    const res = createRes();

    await userController.changeUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('changes a user role when requested by admin', async () => {
    const targetUser = {
      _id: 'user-2',
      email: 'bob@example.com',
      role: 'user',
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findById.mockResolvedValueOnce(targetUser);

    const req = {
      user: { role: 'admin' },
      params: { id: 'user-2' },
      body: { role: 'admin' },
    };
    const res = createRes();

    await userController.changeUserRole(req, res);

    expect(targetUser.role).toBe('admin');
    expect(targetUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updates user profile fields', async () => {
    const updatedUser = { id: 'user-1', name: 'Alice' };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(updatedUser),
    });

    const req = {
      user: { id: 'user-1' },
      body: { name: 'Alice' },
    };
    const res = createRes();

    await userController.updateUserProfile(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when profile cannot be updated', async () => {
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    const req = {
      user: { id: 'user-1' },
      body: { name: 'Alice' },
    };
    const res = createRes();

    await userController.updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates token balance', async () => {
    const updatedUser = {
      _id: 'user-1',
      token_transactions: { mfai_tokens: 25 },
    };
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(updatedUser),
    });

    const req = {
      user: { id: 'user-1' },
      body: { mfai_tokens: 25 },
    };
    const res = createRes();

    await userController.updateTokenBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('rejects token balance update when user missing', async () => {
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    const req = {
      user: { id: 'user-1' },
      body: { mfai_tokens: 25 },
    };
    const res = createRes();

    await userController.updateTokenBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('adds an NFT certificate to a user', async () => {
    const updatedUser = {
      _id: 'user-1',
      nft_certificates: [],
    };
    User.findOne.mockResolvedValueOnce(null);
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(updatedUser),
    });

    const req = {
      user: { id: 'user-1' },
      body: { phase: 1, nft_address: '9'.repeat(44), score: 95, rarity: 'rare', xp_earned: 50 },
    };
    const res = createRes();

    await userController.addNFTCertificate(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('validates NFT payload', async () => {
    const req = {
      user: { id: 'user-1' },
      body: { phase: 1 },
    };
    const res = createRes();

    await userController.addNFTCertificate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns current user profile from request context', async () => {
    const req = {
      user: {
        _id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        wallet_address: 'wallet',
        persona: 'builder',
      },
    };
    const res = createRes();

    await userController.getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects get profile when user missing', async () => {
    const res = createRes();
    await userController.getUserProfile({ user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns all users list', async () => {
    const users = [{ _id: 'user-1' }];
    const select = jest.fn().mockResolvedValueOnce(users);
    User.find.mockReturnValueOnce({ select });

    const res = createRes();
    await userController.getAllUsers({}, res);

    expect(select).toHaveBeenCalledWith('-password');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 })
    );
  });

  it('prevents user deletion without rights', async () => {
    const req = {
      user: { role: 'user', id: 'user-1' },
      params: { id: 'user-2' },
    };
    const res = createRes();

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('soft deletes user when authorized', async () => {
    const userDoc = {
      _id: 'user-2',
      is_active: true,
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findById.mockResolvedValueOnce(userDoc);

    const req = {
      user: { role: 'admin' },
      params: { id: 'user-2' },
    };
    const res = createRes();

    await userController.deleteUser(req, res);

    expect(userDoc.is_active).toBe(false);
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updates user subscription tier', async () => {
    const userDoc = {
      _id: 'user-1',
      subscription: 'gold',
      save: jest.fn().mockResolvedValueOnce(),
    };
    User.findById.mockResolvedValueOnce(userDoc);

    const req = {
      params: { id: 'user-1' },
      body: { subscription: 'platinum' },
    };
    const res = createRes();

    await userController.subscription(req, res);

    expect(userDoc.subscription).toBe('platinum');
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('validates subscription payload', async () => {
    const req = {
      params: { id: 'user-1' },
      body: { subscription: 'invalid' },
    };
    const res = createRes();

    await userController.subscription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
