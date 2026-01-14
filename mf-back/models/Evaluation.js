/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true,
        immutable: true,
        unique: true // One evaluation per submission (if re-eval needed, new submission required by S2.1)
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        immutable: true
    },
    metrics: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        immutable: true,
        description: "Detailed breakdown (creativity, relevance, etc.)"
    },
    decision: {
        type: String,
        enum: ['PASS', 'FAIL'],
        required: true,
        immutable: true
    },
    validatorId: {
        type: String,
        required: true,
        immutable: true,
        description: "ID of the agent/system that performed evaluation (e.g. 'zyno-core-v1')"
    },
    processedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Immutable
});

// Prevent updates
evaluationSchema.pre('save', async function () {
    if (!this.isNew) {
        throw new Error('Evaluation is immutable. Updates not allowed.');
    }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
