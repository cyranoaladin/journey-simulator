/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');


const journeySchema = new mongoose.Schema({
    journeyId: {
        type: String,
        index: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    user_wallet: {
        type: String,
        required: true,
    },
    journey_type: {
        type: String,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    current_phase: {
        type: Number,
        required: true,
    },
    completion_percentage: {
        type: Number,
        required: true,
    },

    // New state machine fields
    state: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
        default: 'IN_PROGRESS',
        // index defined via journeySchema.index({ state: 1 })
    },
    currentStepId: {
        type: String,
        default: 'phase-1'
    },

    phases_status: [
        {
            phase_number: {
                type: Number,
                required: true,
            },
            status: {
                type: String,
                enum: ['not_started', 'in_progress', 'completed'],
                required: true,
            },
            start_date: {
                type: Date,
                required: true,
            },
            completion_date: {
                type: Date,
                required: true,
            },
            score: {
                type: Number,
                required: true,
            },
            attempts: {
                type: Number,
                required: true,
            },
        }
    ],
    milestones: [
        {
            milestone_id: {
                type: String,
                required: true,
            },
            achieved_date: {
                type: Date,
                required: true,
            },
            reward_claimed: {
                type: Boolean,
                required: true,
            },
        }
    ],
    collaterizeSimulation: {
        accepted: Boolean,
        eligibilityScore: Number,
        tier: String,
        targetRaiseUSD: Number,
        softCapUSD: Number,
        hardCapUSD: Number,
        liquidityUSD: Number,
        initialPriceUSD: Number,
        notes: [String],
        simulatedLaunchUrl: String,
    }
}, { timestamps: true });

// Indexes for performance and data integrity
journeySchema.index({ user_id: 1 });
journeySchema.index({ user_wallet: 1 });
journeySchema.index({ state: 1 });

const Journey = mongoose.model('Journey', journeySchema);

module.exports = Journey;
