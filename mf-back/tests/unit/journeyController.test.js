/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const journeyController = require('../../controllers/journey-controller');
const User = require('@mocks/user');
const Journey = require('../../models/Journeys');

jest.mock('@mocks/user');
jest.mock('@mocks/models');

describe('Journey Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('completePhase', () => {
        it('should update user progress and return 200', async () => {
            const req = {
                user: { id: 'user1' },
                body: {
                    phase_number: 1,
                    score: 9,
                    xp_reward: 100
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndUpdate to return a user object
            const mockUser = {
                completed_phases: 1,
                nft_certificates: [{ phase_number: 1 }],
                token_transactions: { mfai_tokens: 100 },
                select: jest.fn().mockReturnThis() // Handle .select('-password')
            };
            // Since controller calls .select('-password') after findByIdAndUpdate
            // We need to make sure the mock returns an object that has select method
            // or the await resolves to the user object if select is chainable.

            // Actually mongoose queries are chainable.
            // User.findByIdAndUpdate returns a Query.

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUser)
            };
            User.findByIdAndUpdate.mockReturnValue(mockQuery);

            await journeyController.completePhase(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user1',
                expect.objectContaining({
                    $inc: { completed_phases: 1, total_xp: 100 }
                }),
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
        });

        it('should handle user not found', async () => {
            const req = {
                user: { id: 'user1' },
                body: { phase_number: 1 }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const mockQuery = {
                select: jest.fn().mockResolvedValue(null)
            };
            User.findByIdAndUpdate.mockReturnValue(mockQuery);

            await journeyController.completePhase(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
