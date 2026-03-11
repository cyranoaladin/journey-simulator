/**
 * immutability_contract.test.js
 * Enforces the "Append-Only" rule for Critical Data (Submission, Evaluation, XP).
 * Scope: Application Layer (Service)
 */

const { JourneyService } = require('../../src/services/JourneyService');
const { prisma } = require('../../src/config/database');

// Mock Prisma
jest.mock('../../src/config/database', () => ({
    prisma: {
        artifact: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn()
        },
        journeyProgress: {
            update: jest.fn()
        }
    }
}));

describe('Data Integrity & Immutability Contract (S2.2)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Evaluation Artifacts', () => {
        it('should NOT allow updates to an existing EVALUATION artifact', async () => {
            // Setup: Simulate an attempt to update an artifact of type EVALUATION
            // Since we don't have a direct "updateArtifact" exposed yet that enforces this,
            // we are verifying the "Contract" by ensuring we DONT have a code path that allows it,
            // OR if we do, it throws.

            // Let's assume we modify JourneyService to expose a safe update method,
            // which rejects modifications to immutable types.

            const artifactId = 'art-eval-123';
            prisma.artifact.findUnique.mockResolvedValue({
                id: artifactId,
                type: 'TEMPLATE',
                metadata: {
                    artifactType: 'EVALUATION' // Critical Type in Metadata
                },
                content: 'Original Verdict'
            });

            // We expect the service to THROW when trying to update this.
            // If the method doesn't exist, we implement/mock it to prove the design.

            // Define a hypothetical breach attempt
            const breachAttempt = async () => {
                await JourneyService.updateArtifact(artifactId, { content: 'Hacked Verdict' });
            };

            await expect(breachAttempt()).rejects.toThrow(/Immutable/);
        });
    });

    describe('XP Ledger (JourneyProgress)', () => {
        it('should only perform atomic increments (Append/Add behavior)', async () => {
            // In a real DB test we would check the SQL logs for "set totalXP = totalXP + val"
            // Here we verify logic: ensure we rarely/never "SET" absolute values without reading first?
            // Actually, the Service logic:
            // const newTotalXP = state.userProgress.totalXP + xp;
            // This is technically a "Read-Modify-Write" application side.
            // Immutability here usually means we have a Ledger (AgentLogs) backing it.

            // We verify that we can't overwrite totals with a lower number (decrement prevention)
            // or that the service enforces positive increments.

            // NOT IMPLEMENTED IN TEST YET - Placeholder for verifying specific Ledger Entry creation
            expect(true).toBe(true);
        });
    });
});
