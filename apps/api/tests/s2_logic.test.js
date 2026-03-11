/**
 * s2_logic.test.js
 * Integration Logic for Journey Engine transitions
 */

const { JourneyService } = require('../src/services/JourneyService');
const { prisma } = require('../src/config/database');

// Mock EvaluationService to isolate Journey logic
jest.mock('../src/services/EvaluationService', () => ({
    EvaluationService: {
        evaluate: jest.fn()
    }
}));
const { EvaluationService } = require('../src/services/EvaluationService');

// Mock Prisma
jest.mock('../src/config/database', () => ({
    prisma: {
        journeyProgress: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn()
        },
        user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) },
        project: { findFirst: jest.fn(), create: jest.fn() },
        artifact: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() }
    }
}));

describe('Journey Engine Logic (S2.4)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('submitPhase should trigger Evaluation and Complete Phase on success', async () => {
        // Setup: User at phase 1
        prisma.journeyProgress.findUnique.mockResolvedValue({
            userId: 'u1',
            personaId: 'p1',
            currentPhase: 1,
            completedPhases: [],
            totalXP: 0,
            nfts: [],
            mfaiTokens: 0
        });

        // Mock Eval Success
        EvaluationService.evaluate.mockResolvedValue({
            decision: 'VALIDATED',
            score: 80,
            feedback: 'Good'
        });

        // Mock Update result
        prisma.journeyProgress.update.mockResolvedValue({});

        // Mock Project finding (Found existing project)
        prisma.project.findFirst.mockResolvedValue({ id: 'proj1' });
        prisma.artifact.create.mockResolvedValue({ id: 'art1' });

        const result = await JourneyService.submitPhase('u1', 'p1', 1, 'My Submission');

        expect(EvaluationService.evaluate).toHaveBeenCalled();
        expect(result.status).toBe('VALIDATED');

        // Check XP Calculation (Score * 10) -> 80 * 10 = 800
        expect(prisma.journeyProgress.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                totalXP: 800,
                completedPhases: [1]
            })
        }));
    });

    it('submitPhase should block if phase is LOCKED (phaseId > currentPhase)', async () => {
        // Setup: User at phase 0, trying to submit Phase 2
        prisma.journeyProgress.findUnique.mockResolvedValue({
            userId: 'u1',
            personaId: 'p1',
            currentPhase: 0,
            completedPhases: []
        });

        await expect(JourneyService.submitPhase('u1', 'p1', 2, 'Skip attempt'))
            .rejects.toThrow('PHASE_LOCKED');

        expect(EvaluationService.evaluate).not.toHaveBeenCalled();
    });

    it('submitPhase should REJECT if evaluation fails', async () => {
        // Setup: Valid phase
        prisma.journeyProgress.findUnique.mockResolvedValue({
            userId: 'u1',
            personaId: 'p1',
            currentPhase: 1,
            completedPhases: [],
            totalXP: 0,
            nfts: [],
            mfaiTokens: 0
        });

        EvaluationService.evaluate.mockResolvedValue({
            decision: 'REJECTED',
            score: 0,
            feedback: 'Poor'
        });

        const result = await JourneyService.submitPhase('u1', 'p1', 1, 'Bad input');

        expect(result.status).toBe('REJECTED');
        // Should NOT complete phase
        // Note: prisma.update might be called if we tracked failed attempts, but completePhase logic calls update specifically for completion.
        // In our impl, completePhase is called only on VALIDATED.
        // However, we mock prisma globally, so we just check it wasn't called with completion data
        const calls = prisma.journeyProgress.update.mock.calls;
        const completionCall = calls.find(call => call[1].data.completedPhases);
        expect(completionCall).toBeUndefined();
    });
    it('submitPhase should Persist Submission Artifact', async () => {
        // Setup
        prisma.journeyProgress.findUnique.mockResolvedValue({
            userId: 'u1', personaId: 'p1', currentPhase: 1, completedPhases: [], totalXP: 0, nfts: [], mfaiTokens: 0
        });
        EvaluationService.evaluate.mockResolvedValue({ decision: 'VALIDATED', score: 80, feedback: 'Good' });
        prisma.project.findFirst.mockResolvedValue({ id: 'proj1' });
        prisma.artifact.create.mockResolvedValue({ id: 'art1' });
        prisma.journeyProgress.update.mockResolvedValue({});

        await JourneyService.submitPhase('u1', 'p1', 1, 'My Submission Content');

        // Verify Artifact Creation
        expect(prisma.artifact.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                content: 'My Submission Content',
                metadata: expect.objectContaining({
                    artifactType: 'SUBMISSION'
                })
            })
        }));
    });

    it('submitPhase should BLOCK concurrent submissions (Race Condition)', async () => {
        // Setup
        prisma.journeyProgress.findUnique.mockResolvedValue({
            userId: 'u1', personaId: 'p1', currentPhase: 1, completedPhases: [],
            totalXP: 0, nfts: [], mfaiTokens: 0
        });
        prisma.project.findFirst.mockResolvedValue({ id: 'proj1' });
        prisma.artifact.create.mockResolvedValue({ id: 'art1' });
        prisma.journeyProgress.update.mockResolvedValue({});

        // Mock slow evaluation to allow concurrency
        EvaluationService.evaluate.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return { decision: 'VALIDATED', score: 80 };
        });

        const p1 = JourneyService.submitPhase('u1', 'p1', 1, 'Sub 1');
        const p2 = JourneyService.submitPhase('u1', 'p1', 1, 'Sub 2'); // Should fail

        const results = await Promise.allSettled([p1, p2]);
        const rejected = results.find(r => r.status === 'rejected');

        expect(rejected).toBeDefined();
        expect(rejected.reason.message).toContain('RACE_CONDITION');
    });

    it('updateArtifact should throw for Immutable types', async () => {
        // Mock finding a SUBMISSION artifact
        prisma.artifact.findUnique.mockResolvedValue({
            id: 'art1',
            metadata: { artifactType: 'SUBMISSION' }
        });

        await expect(JourneyService.updateArtifact('art1', { content: 'New' }))
            .rejects.toThrow('Immutable Artifact');
    });
});
