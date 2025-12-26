const { addNFTCertificate } = require('../../controllers/user-controller');
const User = require('../../models/user');
const { verifyTransaction } = require('../../utils/solana');

// Mock dependencies
jest.mock('../../models/user');
jest.mock('../../utils/solana');

describe('NFT Verification Logic', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 'user123', wallet_address: 'ValidWalletAddress' },
            body: {
                phase: 1,
                mint_address: 'ValidTxSignature',
                title: 'Test NFT',
                score: 9
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();

        // Default mocks
        User.findOne.mockResolvedValue(null); // No duplicate
        const mockUser = { _id: 'user123', nft_certificates: [] };
        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        // Enable Solana tests for this suite
        process.env.ENABLE_SOLANA_TESTS = 'true';
    });

    afterEach(() => {
        delete process.env.ENABLE_SOLANA_TESTS;
    });

    test('should successfully add certificate when transaction is verified', async () => {
        // Mock successful verification
        verifyTransaction.mockResolvedValue(true);
        // Ensure User.findByIdAndUpdate returns a user with nft_certificates
        const mockUser = { _id: 'user123', nft_certificates: [] };
        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        await addNFTCertificate(req, res);

        expect(verifyTransaction).toHaveBeenCalledWith('ValidTxSignature', 'ValidWalletAddress');
        expect(User.findByIdAndUpdate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('should reject when verification fails (invalid tx)', async () => {
        // Mock verification failure
        verifyTransaction.mockRejectedValue(new Error('Transaction not found'));

        await addNFTCertificate(req, res);

        expect(verifyTransaction).toHaveBeenCalled();
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: expect.stringContaining('NFT Verification Failed')
        }));
    });

    test('should reject when verification fails (wallet mismatch)', async () => {
        // Mock verification failure with the exact error message format
        verifyTransaction.mockRejectedValue(new Error('Transaction signer (DifferentWallet) does not match user wallet (ValidWalletAddress)'));

        await addNFTCertificate(req, res);

        expect(verifyTransaction).toHaveBeenCalledWith('ValidTxSignature', 'ValidWalletAddress');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: expect.stringContaining('NFT Verification Failed'),
            error: expect.stringContaining('Transaction signer')
        }));
    });

    test('should skip verification in test environment if flag is not set', async () => {
        // Disable flag
        process.env.ENABLE_SOLANA_TESTS = 'false';
        process.env.NODE_ENV = 'test';

        await addNFTCertificate(req, res);

        expect(verifyTransaction).not.toHaveBeenCalled();
        expect(User.findByIdAndUpdate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
