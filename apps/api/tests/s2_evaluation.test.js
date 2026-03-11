/**
 * s2_evaluation.test.js
 * Verification of EvaluationService (Deterministe + Zyno Fallback)
 */

// Mock prisma
jest.mock('../src/config/database', () => ({
    prisma: {}
}));

// Mock ZynoAgent
jest.mock('../src/agents/ZynoAgent', () => {
    return jest.fn().mockImplementation(() => {
        return {
            run: jest.fn().mockResolvedValue({
                payload: {
                    ui_blocks: [{ kind: 'evaluation_block', global_score: 85, feedback: 'Great job!' }]
                },
                metadata: { tokens_used: 100 }
            })
        };
    });
});

const { EvaluationService } = require('../src/services/EvaluationService');
const ZynoAgent = require('../src/agents/ZynoAgent');

describe('Evaluation Service (S2.4)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ENABLE_ZYNO_EVAL = 'false';
    });

    describe('Deterministic Mode (Default/Fallback)', () => {
        it('Should return VALIDATED (100) if submission is robust', async () => {
            const result = await EvaluationService.evaluate({
                userId: 'u1',
                personaId: 'p1',
                phaseId: 1,
                userInput: 'This is a detailed submission payload.'
            });

            expect(result.decision).toBe('VALIDATED');
            expect(result.score).toBe(100);
            expect(result.isDeterministic).toBe(true);
        });

        it('Should return REJECTED (0) if submission is too short', async () => {
            const result = await EvaluationService.evaluate({
                userId: 'u1',
                personaId: 'p1',
                phaseId: 1,
                userInput: 'No'
            });

            expect(result.decision).toBe('REJECTED');
            expect(result.score).toBe(0);
        });
    });

    describe('Zyno Mode (LLM)', () => {
        it('Should Invoke ZynoAgent if enabled', async () => {
            process.env.ENABLE_ZYNO_EVAL = 'true';
            const result = await EvaluationService.evaluate({
                userId: 'u1',
                personaId: 'p1',
                phaseId: 1,
                userInput: 'My Project Plan'
            });

            expect(ZynoAgent).toHaveBeenCalled();
            expect(result.score).toBe(85);
            expect(result.decision).toBe('VALIDATED');
            expect(result.isDeterministic).toBe(false);
        });

        it('Should Fallback to Deterministic if Zyno Crashes (Safe Failover)', async () => {
            process.env.ENABLE_ZYNO_EVAL = 'true';
            // Force crash
            ZynoAgent.mockImplementationOnce(() => {
                return {
                    run: jest.fn().mockRejectedValue(new Error('OpenAI Downtime'))
                }
            });

            const result = await EvaluationService.evaluate({
                userId: 'u1',
                personaId: 'p1',
                phaseId: 1,
                userInput: 'Valid fallback payload' // Long enough to pass deterministic
            });

            expect(result.decision).toBe('VALIDATED');
            expect(result.isDeterministic).toBe(true); // Fallback active
        });
    });
});
