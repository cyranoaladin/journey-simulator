const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JourneyRun',
        required: true,
        immutable: true
    },
    phaseId: {
        type: String,
        required: true,
        immutable: true
    },
    stepId: {
        type: String,
        required: true,
        immutable: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        immutable: true,
        description: "The actual content submitted (text, file path, json code)"
    },
    hash: {
        type: String,
        required: true,
        immutable: true,
        description: "SHA-256 hash of the payload for integrity verification"
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Immutable: no updates
});

// Prevent updates at Mongoose middleware level for extra safety
submissionSchema.pre('save', async function () {
    if (!this.isNew) {
        throw new Error('Submission is immutable. Create a new one instead.');
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
