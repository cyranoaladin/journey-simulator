const mongoose = require('mongoose');
const JourneyEngine = require('../services/JourneyEngine');
const JourneyRun = require('../models/JourneyRun');
const PhaseProgress = require('../models/PhaseProgress');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const XpLedger = require('../models/XpLedger');

// Helper to create ObjectIds
const newId = () => new mongoose.Types.ObjectId();

// Mock connection (similar to s2_models.test.js)
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mf_back_test_s2_logic';
    try {
        await mongoose.connect(mongoUri);
    } catch (err) {
        console.warn("MongoDB fail", err);
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
});

beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        await JourneyRun.deleteMany({});
        await PhaseProgress.deleteMany({});
        await Submission.deleteMany({});
        await Evaluation.deleteMany({});
        await XpLedger.deleteMany({});
    }
});

describe('S2.3 Journey Engine Logic', () => {

    let userId, defId;

    beforeEach(() => {
        userId = newId();
        defId = 'journey-test-v1';
    });

    test('Start Journey: Should create Run and Unlock Phase 1', async () => {
        const { run, currentPhase } = await JourneyEngine.startJourney(userId, defId);

        expect(run).toBeDefined();
        expect(run.status).toBe('INITIALIZED');
        expect(run.currentPhaseIndex).toBe(1);

        expect(currentPhase).toBeDefined();
        expect(currentPhase.phaseId).toBe('phase-1');
        expect(currentPhase.status).toBe('UNLOCKED');
    });

    test('Start Journey: Should fail if already active', async () => {
        await JourneyEngine.startJourney(userId, defId);
        await expect(JourneyEngine.startJourney(userId, defId))
            .rejects.toThrow(/already active/);
    });

    test('Submit Phase (S2.4 Auto-Eval): Should transition UNLOCKED -> VALIDATED immediately', async () => {
        const { run } = await JourneyEngine.startJourney(userId, defId);

        const payload = { answer: 'test' };

        // S2.4: submitPhase now triggers evaluation internally.
        // Since payload is non-empty, EvaluationService (Deterministic) returns PASS.
        // So we expect VALIDATED.

        const { submission, phase, evaluation } = await JourneyEngine.submitPhase(
            userId, run._id, 'phase-1', 'step-1', payload
        );

        expect(submission).toBeDefined();
        expect(submission.payload).toEqual(payload);

        // Phase should be VALIDATED (skipped SUBMITTED state effectively in sync-mode)
        expect(phase.status).toBe('VALIDATED');
        expect(phase.score).toBe(100);

        expect(evaluation).toBeDefined();
        expect(evaluation.decision).toBe('PASS');

        // Run should move to IN_PROGRESS
        const updatedRun = await JourneyRun.findById(run._id);
        expect(updatedRun.status).toBe('IN_PROGRESS');
    });

    test('Submit Phase (S2.4 Auto-Eval): Should transition UNLOCKED -> REJECTED if bad payload', async () => {
        const { run } = await JourneyEngine.startJourney(userId, defId);

        // Empty payload -> Deterministic FAIL
        const { phase, evaluation } = await JourneyEngine.submitPhase(
            userId, run._id, 'phase-1', 'step-1', {}
        );

        expect(evaluation.decision).toBe('FAIL');
        expect(phase.status).toBe('REJECTED');
    });

    test('Submit Phase: Should FAIL if phase is LOCKED', async () => {
        const { run } = await JourneyEngine.startJourney(userId, defId);

        // Manually create a locked phase 2
        const phase2 = new PhaseProgress({
            runId: run._id,
            phaseId: 'phase-2',
            status: 'LOCKED'
        });
        await phase2.save();

        await expect(JourneyEngine.submitPhase(
            userId, run._id, 'phase-2', 'step-1', { answer: 'cheat' }
        )).rejects.toThrow(/status LOCKED/);
    });

    test('Submit Phase: Should FAIL if invalid User/Run', async () => {
        const fakeRunId = newId();
        await expect(JourneyEngine.submitPhase(
            userId, fakeRunId, 'phase-1', 'step-1', { a: 1 }
        )).rejects.toThrow();
    });

    test('Immutability Check via Engine: Cannot modify Submission payload', async () => {
        const { run } = await JourneyEngine.startJourney(userId, defId);
        const { submission } = await JourneyEngine.submitPhase(
            userId, run._id, 'phase-1', 'step-1', { a: 1 }
        );

        // Try to update via mongoose model directly
        submission.payload = { a: 2 };
        await expect(submission.save()).rejects.toThrow(/immutable/);
    });

});
