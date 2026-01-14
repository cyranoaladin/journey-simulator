/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');
const EvaluationService = require('../services/EvaluationService');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const XpLedger = require('../models/XpLedger');

// Mock helpers
const newId = () => new mongoose.Types.ObjectId();

// Increase timeout for CI environments
jest.setTimeout(20000);

beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27018/mf_back_test_s2_eval';
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
    } catch (err) {
        console.warn(err);
        throw err; // Fail fast in CI
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
});

describe('S2.4 Evaluation Service', () => {

    test('Deterministic Mode: Should EVALUATE logicless submission as PASS', async () => {
        // Setup
        const subId = newId();
        const runId = newId();
        const userId = newId();

        const result = await EvaluationService.evaluate({
            submissionId: subId,
            submissionPayload: { text: "Some content" },
            runId,
            phaseId: 'phase-1',
            userId
        });

        expect(result.evaluation).toBeDefined();
        expect(result.evaluation.decision).toBe('PASS');
        expect(result.evaluation.score).toBe(100);
        expect(result.evaluation.validatorId).toBe('MF_DETERMINISTIC_ENGINE');

        expect(result.xpEntry).toBeDefined();
        expect(result.xpEntry.amount).toBe(1000); // 100 * 10
    });

    test('Deterministic Mode: Should FAIL empty submission', async () => {
        const subId = newId();
        const runId = newId();
        const userId = newId();

        const result = await EvaluationService.evaluate({
            submissionId: subId,
            submissionPayload: {}, // Empty
            runId,
            phaseId: 'phase-1',
            userId
        });

        expect(result.evaluation.decision).toBe('FAIL');
        expect(result.evaluation.score).toBe(0);
        expect(result.xpEntry).toBeNull(); // No XP for fail
    });

    test('Evaluation Records should be persisted', async () => {
        const subId = newId();
        const result = await EvaluationService.evaluate({
            submissionId: subId,
            submissionPayload: { text: "Persistent" },
            runId: newId(),
            phaseId: 'phase-1',
            userId: newId()
        });

        const stored = await Evaluation.findById(result.evaluation._id);
        expect(stored).toBeDefined();
        expect(stored.submissionId.toString()).toBe(subId.toString());
    });

});
