/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const journeyRunSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    journeyDefinitionId: {
        type: String,
        required: true,
        description: "ID of the specific version of the journey (e.g. 'journey-v1')"
    },
    status: {
        type: String,
        enum: ['INITIALIZED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED'],
        default: 'INITIALIZED',
        required: true
    },
    currentPhaseIndex: {
        type: Number,
        default: 0,
        min: 0
    },
    startedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    interaction_logs: [{
        role: {
            type: String,
            enum: ['user', 'agent', 'system'],
            required: true
        },
        agentName: {
            type: String,
            required: false // Only for agent responses
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        context: {
            phaseId: String,
            stepId: Number,
            intent: String
        }
    }]
}, {
    timestamps: true
});

// Ensure one active run per journey definition per user (if required by business logic, 
// though analysis says "Unique JourneyRun active", let's keep it flexible but indexed)
journeyRunSchema.index({ userId: 1, journeyDefinitionId: 1, status: 1 });

module.exports = mongoose.model('JourneyRun', journeyRunSchema);
