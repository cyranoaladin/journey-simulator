/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');
const JourneyRun = require('../models/JourneyRun');
const PhaseProgress = require('../models/PhaseProgress');
const Submission = require('../models/Submission');
const EvaluationService = require('./EvaluationService'); // S2.4 NEW Dependency

class JourneyEngine {

    /**
     * Start a new journey for a user.
     */
    static async startJourney(userId, journeyDefinitionId) {
        const existing = await JourneyRun.findOne({
            userId,
            journeyDefinitionId,
            status: { $in: ['INITIALIZED', 'IN_PROGRESS', 'PAUSED'] }
        });

        if (existing) {
            throw new Error(`Journey ${journeyDefinitionId} already active for user.`);
        }

        const run = new JourneyRun({
            userId,
            journeyDefinitionId,
            status: 'INITIALIZED',
            currentPhaseIndex: 1
        });
        await run.save();

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
     * S2.4 UPDATE: Triggers Evaluation immediately (sync for now).
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

        if (phase.status !== 'UNLOCKED' && phase.status !== 'REJECTED') {
            throw new Error(`Cannot submit to phase in status ${phase.status}`);
        }

        // 3. Create Immutable Submission
        const hashPlaceholder = `sha256-placeholder-${Date.now()}`;
        const submission = new Submission({
            runId: run._id,
            phaseId,
            stepId,
            payload,
            hash: hashPlaceholder
        });
        await submission.save();

        // 4. Update Phase to SUBMITTED
        phase.status = 'SUBMITTED';
        await phase.save();

        // 5. Update Run Status if needed
        if (run.status === 'INITIALIZED') {
            run.status = 'IN_PROGRESS';
            run.lastActivityAt = new Date();
            await run.save();
        }

        // S2.4: TRIGGER EVALUATION
        // We call the service to compute the result
        const evalResult = await EvaluationService.evaluate({
            submissionId: submission._id,
            submissionPayload: payload,
            runId: run._id,
            phaseId,
            userId
        });

        // 6. Apply Evaluation Result to State
        // The Engine (Authority) decides what to do with the Evaluation
        const { evaluation, xpEntry } = evalResult;

        if (evaluation.decision === 'PASS') {
            phase.status = 'VALIDATED';
            phase.score = evaluation.score;
            phase.completedAt = new Date();

            // Unlock next phase
            const currentNum = Number.parseInt(phase.phaseId.split('-')[1], 10);
            const nextPhaseId = `phase-${currentNum + 1}`;

            await PhaseProgress.findOneAndUpdate(
                { runId: run._id, phaseId: nextPhaseId },
                {
                    $setOnInsert: {
                        status: 'UNLOCKED',
                        unlockedAt: new Date(),
                        score: null
                    }
                },
                { upsert: true, new: true }
            );

            await JourneyRun.findByIdAndUpdate(run._id, {
                currentPhaseIndex: currentNum + 1,
                lastActivityAt: new Date()
            });

        } else {
            phase.status = 'REJECTED';
            // User stays on this phase, but status is rejected (UI should show retry)
        }

        await phase.save();

        return { submission, phase, evaluation, xpEntry };
    }

    /**
     * Get full state of a journey run.
     */
    static async getState(userId, runId) {
        const run = await JourneyRun.findOne({ _id: runId, userId });
        if (!run) throw new Error('JourneyRun not found.');

        const phases = await PhaseProgress.find({ runId: run._id }).sort({ phaseId: 1 });

        return { run, phases };
    }
}

module.exports = JourneyEngine;
