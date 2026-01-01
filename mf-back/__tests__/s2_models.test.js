const mongoose = require('mongoose');
const JourneyRun = require('../models/JourneyRun');
const PhaseProgress = require('../models/PhaseProgress');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const XpLedger = require('../models/XpLedger');

// We need a real DB to test pre('save') hooks and strict constraints
let mongoServer;

// Increase timeout for CI environments where MongoDB may take time to start
jest.setTimeout(20000);

beforeAll(async () => {
    // Try to connect to local test DB since we don't have memory server in package.json
    // and we cannot add dependencies easily.
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mf_back_test_s2';

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout for connection
            socketTimeoutMS: 45000,
        });
    } catch (err) {
        console.warn("MongoDB connection failed. Tests requiring DB will fail.", err);
        throw err; // Fail fast in CI
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

describe('S2.2 Persistence Models', () => {

    test('JourneyRun: Should initialize with default status INITIALIZED', async () => {
        const run = new JourneyRun({
            userId: new mongoose.Types.ObjectId(),
            journeyDefinitionId: 'journey-v1'
        });
        await run.save();
        expect(run.status).toBe('INITIALIZED');
        expect(run.currentPhaseIndex).toBe(0);
    });

    test('JourneyRun: Should enforce valid status transitions (Schema Validation level)', async () => {
        const run = new JourneyRun({
            userId: new mongoose.Types.ObjectId(),
            journeyDefinitionId: 'journey-v1',
            status: 'INVALID_STATUS'
        });
        await expect(run.save()).rejects.toThrow(); // Mongoose validation error
    });

    test('Submission: Should be append-only (Immutable)', async () => {
        const submission = new Submission({
            runId: new mongoose.Types.ObjectId(),
            phaseId: 'phase-1',
            stepId: 'step-1',
            payload: { answer: '42' },
            hash: 'sha256-hash-mock'
        });
        const saved = await submission.save();

        // Attempt modification
        saved.payload = { answer: 'hacked' };

        // This should trigger the pre('save') hook error
        await expect(saved.save()).rejects.toThrow('Submission is immutable');
    });

    test('Evaluation: Should be append-only (Immutable)', async () => {
        const subId = new mongoose.Types.ObjectId();
        const evaluation = new Evaluation({
            submissionId: subId,
            score: 85,
            decision: 'PASS',
            validatorId: 'zyno-v1',
            metrics: { creativity: 90 }
        });
        const saved = await evaluation.save();

        // Attempt modification
        saved.score = 100;

        await expect(saved.save()).rejects.toThrow('Evaluation is immutable');
    });

    test('XpLedger: Should be append-only (Immutable)', async () => {
        const xp = new XpLedger({
            userId: new mongoose.Types.ObjectId(),
            sourceType: 'EVALUATION',
            sourceId: 'eval-123',
            amount: 100
        });
        const saved = await xp.save();

        // Attempt modification
        saved.amount = 9999;

        await expect(saved.save()).rejects.toThrow('XpLedger entries are immutable');
    });

    test('PhaseProgress: Should enforce status enum', async () => {
        const prog = new PhaseProgress({
            runId: new mongoose.Types.ObjectId(),
            phaseId: 'phase-1',
            status: 'JUMPED_THE_GUN'
        });
        await expect(prog.save()).rejects.toThrow();
    });

    test('PhaseProgress: Should allow valid status update (Mutable)', async () => {
        const prog = new PhaseProgress({
            runId: new mongoose.Types.ObjectId(),
            phaseId: 'phase-1',
            status: 'LOCKED'
        });
        const saved = await prog.save();

        saved.status = 'UNLOCKED';
        saved.unlockedAt = new Date();
        const updated = await saved.save();

        expect(updated.status).toBe('UNLOCKED');
        expect(updated.unlockedAt).toBeDefined();
    });

});
