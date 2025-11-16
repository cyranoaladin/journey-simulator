const mongoose = require('mongoose');


const journeySchema = new mongoose.Schema({
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
});

const Journey = mongoose.model('Journey', journeySchema);

module.exports = Journey;   