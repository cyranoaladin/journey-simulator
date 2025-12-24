const mongoose = require('mongoose');
const JourneyRun = require('../models/JourneyRun');
const PhaseProgress = require('../models/PhaseProgress');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const XpLedger = require('../models/XpLedger');

class JourneyEngine {

    /**
     * Start a new journey for a user.
     * Enforces uniqueness (one active run per definition).
     */
    static async startJourney(userId, journeyDefinitionId) {
        // 1. Check if active run exists
        const existing = await JourneyRun.findOne({
            userId,
            journeyDefinitionId,
            status: { $in: ['INITIALIZED', 'IN_PROGRESS', 'PAUSED'] }
        });

        if (existing) {
            throw new Error(`Journey ${journeyDefinitionId} already active for user.`);
        }

        // 2. Create Run
        const run = new JourneyRun({
            userId,
            journeyDefinitionId,
            status: 'INITIALIZED',
            currentPhaseIndex: 1
        });
        await run.save();

        // 3. Initialize Phase 1 (LOCKED -> UNLOCKED)
        // Note: For now we assume Phase 1 is auto-unlocked on start.
        const phase1 = new PhaseProgress({
            runId: run._id,
            phaseId: 'phase-1',
            status: 'UNLOCKED',
            unlockedAt: new Date()
        });
        await phase1.save();

        return { run, currentPhase: phase1 };
    }

    /**
     * Submit user input for a phase.
     * Transitions: UNLOCKED -> SUBMITTED.
     */
    static async submitPhase(userId, runId, phaseId, stepId, payload) {
        // 1. Verify Run Ownership & Status
        const run = await JourneyRun.findOne({ _id: runId, userId });
        if (!run) throw new Error('JourneyRun not found or access denied.');
        if (run.status !== 'INITIALIZED' && run.status !== 'IN_PROGRESS') {
            throw new Error(`Journey is not active (Status: ${run.status})`);
        }

        // 2. Verify Phase Status
        const phase = await PhaseProgress.findOne({ runId, phaseId });
        if (!phase) throw new Error(`Phase ${phaseId} not found in run.`);

        // Allowed: UNLOCKED or REJECTED (Retry)
        if (phase.status !== 'UNLOCKED' && phase.status !== 'REJECTED') {
            throw new Error(`Cannot submit to phase in status ${phase.status}`);
        }

        // 3. Create Immutable Submission
        // We use a simplified hash for S2.3 (placeholder) as strict crypto is S3 scope
        const hashPlaceholder = `sha256-placeholder-${Date.now()}`;

        const submission = new Submission({
            runId: run._id,
            phaseId,
            stepId,
            payload,
            hash: hashPlaceholder
        });
        await submission.save();

        // 4. Transition Phase to SUBMITTED
        phase.status = 'SUBMITTED';
        await phase.save();

        // 5. Update Run Status if needed
        if (run.status === 'INITIALIZED') {
            run.status = 'IN_PROGRESS';
            run.lastActivityAt = new Date();
            await run.save();
        }

        return { submission, phase };
    }

    /**
     * Get full state of a journey run.
     */
    static async getState(userId, runId) {
        const run = await JourneyRun.findOne({ _id: runId, userId });
        if (!run) throw new Error('JourneyRun not found.');

        // Get all phases
        const phases = await PhaseProgress.find({ runId: run._id }).sort({ phaseId: 1 }); // simple sort

        return {
            run,
            phases
        };
    }

    // --- MOCK EVALUATION FOR S2.3 (Since Zyno/S2.4 is not here) ---
    // This allows testing the flow SUBMITTED -> VALIDATED
    static async mockEvaluate(submissionId, decision, score) {
        const submission = await Submission.findById(submissionId);
        if (!submission) throw new Error('Submission not found.');

        const phase = await PhaseProgress.findOne({ runId: submission.runId, phaseId: submission.phaseId });
        if (!phase) throw new Error('Phase integrity error.');

        if (phase.status !== 'SUBMITTED' && phase.status !== 'EVALUATING') {
            throw new Error(`Phase must be SUBMITTED to evaluate (current: ${phase.status})`);
        }

        // 1. Create Evaluation
        const evalRecord = new Evaluation({
            submissionId: submission._id,
            score,
            decision,
            validatorId: 'MOCK_ENGINE_S2.3',
            metrics: { reason: "S2.3 Validation Mock" }
        });
        await evalRecord.save();

        // 2. Update Phase
        if (decision === 'PASS') {
            phase.status = 'VALIDATED';
            phase.score = score;
            phase.completedAt = new Date();

            // 2b. Add XP
            const xpEntry = new XpLedger({
                userId: (await JourneyRun.findById(submission.runId)).userId,
                runId: submission.runId,
                sourceType: 'EVALUATION',
                sourceId: evalRecord._id.toString(),
                amount: Math.floor(score * 10) // Mock formula
            });
            await xpEntry.save();

            // 2c. Unlock next phase (Simplified logic: phase-N -> phase-N+1)
            // Assumes phaseId format "phase-N".
            const currentNum = parseInt(phase.phaseId.split('-')[1]);
            const nextPhaseId = `phase-${currentNum + 1}`;

            // Upsert next phase as UNLOCKED
            await PhaseProgress.findOneAndUpdate(
                { runId: submission.runId, phaseId: nextPhaseId },
                {
                    $setOnInsert: {
                        status: 'UNLOCKED',
                        unlockedAt: new Date(),
                        score: null
                    }
                },
                { upsert: true, new: true }
            );

            // Update Run pointer
            await JourneyRun.findByIdAndUpdate(submission.runId, {
                currentPhaseIndex: currentNum + 1,
                lastActivityAt: new Date()
            });

        } else {
            phase.status = 'REJECTED';
        }

        await phase.save();
        return { evaluation: evalRecord, phase };
    }
}

module.exports = JourneyEngine;
