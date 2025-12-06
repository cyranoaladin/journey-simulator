const mongoose = require('mongoose');

const agentRunSchema = new mongoose.Schema({
    journeyId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    stepId: {
        type: String,
        required: true
    },
    agentName: {
        type: String,
        required: true,
        index: true
    },
    agentVersion: {
        type: String,
        default: 'v1'
    },
    model: {
        type: String,
        required: true
    },
    input: {
        type: mongoose.Schema.Types.Mixed
    },
    output: {
        type: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['started', 'succeeded', 'failed'],
        default: 'started',
        index: true
    },
    journeyMode: {
        type: String,
        index: true
    },
    error: {
        type: mongoose.Schema.Types.Mixed
    },
    idempotencyKey: {
        type: String,
        index: true
    },
    durationMs: {
        type: Number
    }
}, {
    timestamps: true
});

// Composite index for history retrieval
agentRunSchema.index({ journeyId: 1, createdAt: -1 });
agentRunSchema.index({ agentName: 1, status: 1 });

const AgentRun = mongoose.model('AgentRun', agentRunSchema);

module.exports = AgentRun;
