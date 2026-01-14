/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Mock env
process.env.JWT_SECRET = 'unit-test-secret';
process.env.ENABLE_STRICT_WALLET_LOGIN = 'true'; // Enable strict mode for these tests

// Mock dependencies before requiring controller
jest.mock('../models/user', () => {
  const mock = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };
  return mock;
});

// We need to mock jsonwebtoken and crypto if they are used but we want real tweetnacl behavior
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'mock-refresh-token' }),
  };
});

const userController = require('../controllers/user-controller');
const User = require('../models/user');
const nacl = require('tweetnacl');
// Fix for bs58 v6 which exports default in CJS
const bs58 = require('bs58').default || require('bs58');

// Helper to create res object
const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Wallet Auth Flow', () => {
    let keyPair;
    let walletAddress;

    beforeAll(() => {
        // Generate a real keypair for testing
        keyPair = nacl.sign.keyPair();
        walletAddress = bs58.encode(keyPair.publicKey);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ENABLE_STRICT_WALLET_LOGIN = 'true';
    });

    describe('createWalletChallenge', () => {
        it('creates a challenge successfully', async () => {
            const userDoc = {
                wallet_address: walletAddress,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(userDoc);

            const req = { body: { wallet_address: walletAddress } };
            const res = createRes();

            await userController.createWalletChallenge(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('Nonce:')
            }));
            expect(userDoc.save).toHaveBeenCalled();
            expect(userDoc.wallet_nonce).toBeDefined();
        });

        it('returns 404 if user not found', async () => {
            User.findOne.mockResolvedValue(null);
            const req = { body: { wallet_address: walletAddress } };
            const res = createRes();

            await userController.createWalletChallenge(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('loginWithWallet (Strict Mode)', () => {
        it('logs in successfully with valid signature', async () => {
            const nonce = 'test-nonce-123';
            const userDoc = {
                _id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                wallet_address: walletAddress,
                is_active: true,
                wallet_nonce: nonce,
                wallet_nonce_expiry: new Date(Date.now() + 5 * 60 * 1000),
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(userDoc);

            const message = `Sign this message to log in to Money Factory AI\n\nNonce: ${nonce}`;
            const messageUint8 = new TextEncoder().encode(message);
            const signatureUint8 = nacl.sign.detached(messageUint8, keyPair.secretKey);
            const signature = bs58.encode(signatureUint8);

            const req = { body: { wallet_address: walletAddress, message, signature } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                accessToken: 'mock-jwt-token'
            }));
            // Nonce should be cleared
            expect(userDoc.wallet_nonce).toBeNull();
            expect(userDoc.save).toHaveBeenCalled();
        });

        it('rejects invalid signature', async () => {
            const nonce = 'test-nonce-bad';
            const userDoc = {
                wallet_address: walletAddress,
                is_active: true,
                wallet_nonce: nonce,
                wallet_nonce_expiry: new Date(Date.now() + 5 * 60 * 1000)
            };
            User.findOne.mockResolvedValue(userDoc);

            const message = `Sign this message to log in to Money Factory AI\n\nNonce: ${nonce}`;
            // Sign a different message to generate invalid signature for the expected message
            const fakeMessageUint8 = new TextEncoder().encode("fake message");
            const signatureUint8 = nacl.sign.detached(fakeMessageUint8, keyPair.secretKey);
            const signature = bs58.encode(signatureUint8);

            const req = { body: { wallet_address: walletAddress, message, signature } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid wallet signature'
            }));
        });

        it('rejects wrong message content', async () => {
             const nonce = 'test-nonce-wrong';
             const userDoc = {
                wallet_address: walletAddress,
                is_active: true,
                wallet_nonce: nonce,
                wallet_nonce_expiry: new Date(Date.now() + 5 * 60 * 1000)
            };
            User.findOne.mockResolvedValue(userDoc);

            const message = "Wrong message format";
            const messageUint8 = new TextEncoder().encode(message);
            const signatureUint8 = nacl.sign.detached(messageUint8, keyPair.secretKey);
            const signature = bs58.encode(signatureUint8);

            const req = { body: { wallet_address: walletAddress, message, signature } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringMatching(/Invalid message format/)
            }));
        });

        it('rejects expired challenge', async () => {
             const userDoc = {
                wallet_address: walletAddress,
                is_active: true,
                wallet_nonce: 'old',
                wallet_nonce_expiry: new Date(Date.now() - 1000)
            };
            User.findOne.mockResolvedValue(userDoc);
            
            const req = { body: { wallet_address: walletAddress, message: 'foo', signature: 'bar' } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringMatching(/expired|invalid/)
            }));
        });
    });

    describe('loginWithWallet (Legacy Mode)', () => {
        beforeEach(() => {
            process.env.ENABLE_STRICT_WALLET_LOGIN = 'false';
        });

        it('logs in successfully with only wallet address (Legacy)', async () => {
            const userDoc = {
                _id: 'user-1',
                wallet_address: walletAddress,
                is_active: true,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(userDoc);

            const req = { body: { wallet_address: walletAddress } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                accessToken: 'mock-jwt-token'
            }));
        });

        it('logs in successfully with valid signature (Secure path in Legacy)', async () => {
            const nonce = 'test-nonce-legacy';
            const userDoc = {
                _id: 'user-1',
                wallet_address: walletAddress,
                is_active: true,
                wallet_nonce: nonce,
                wallet_nonce_expiry: new Date(Date.now() + 5 * 60 * 1000),
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(userDoc);

            const message = `Sign this message to log in to Money Factory AI\n\nNonce: ${nonce}`;
            const messageUint8 = new TextEncoder().encode(message);
            const signatureUint8 = nacl.sign.detached(messageUint8, keyPair.secretKey);
            const signature = bs58.encode(signatureUint8);

            const req = { body: { wallet_address: walletAddress, message, signature } };
            const res = createRes();

            await userController.loginWithWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            // Nonce should be cleared
            expect(userDoc.wallet_nonce).toBeNull();
        });
    });
});
