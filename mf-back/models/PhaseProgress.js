/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const phaseProgressSchema = new mongoose.Schema({
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JourneyRun',
        required: true,
        index: true
    },
    phaseId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['LOCKED', 'UNLOCKED', 'SUBMITTED', 'EVALUATING', 'VALIDATED', 'REJECTED'],
        default: 'LOCKED',
        required: true
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    unlockedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for fast lookup of a specific phase in a run
phaseProgressSchema.index({ runId: 1, phaseId: 1 }, { unique: true });

module.exports = mongoose.model('PhaseProgress', phaseProgressSchema);
