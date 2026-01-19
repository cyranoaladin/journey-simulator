/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


jest.mock('../models/user', () => {
    const mock = {
        findOne: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findById: jest.fn(),
    };
    return mock;
});

const userController = require('../controllers/user-controller');
const User = require('../models/user');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Guardrails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('enforces unique wallet address on registration (via Mongo error)', async () => {
        // Mock email check passing (no user with email)
        User.findOne.mockResolvedValue(null);
        
        // Mock create throwing duplicate key error
        const duplicateError = new Error('E11000 duplicate key error collection: users index: wallet_address_1 dup key');
        User.create.mockRejectedValue(duplicateError);

        const req = {
            body: {
                name: 'Test',
                email: 'test@example.com',
                password: 'password',
                wallet_address: 'duplicate-wallet',
                persona: 'builder'
            }
        };
        const res = createRes();

        await userController.registerUser(req, res);

        expect(User.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Failed to register user',
            error: expect.stringContaining('E11000')
        }));
    });
});
