/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const missionSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    journeyId: { type: String, required: true },
    missionId: { type: String, required: true },
    trackId: { type: String, required: true },
    phaseId: { type: String, required: true },
    submission: { type: String, required: true },
    inputType: {
        type: String,
        enum: ['text', 'file', 'url', 'code_snippet', 'link', 'markdown_document', 'textarea', 'quiz_submission'],
        default: 'text'
    },

    // Evaluation results
    agentName: { type: String, required: true },
    globalScore: { type: Number, required: true },
    feedback: { type: String, required: true },
    axes: [{
        name: String,
        score: Number,
        max_score: Number,
        comment: String
    }],

    // Rewards
    xpAwarded: { type: Number, default: 0 },
    nftEligible: { type: Boolean, default: false },
    nftMinted: { type: Boolean, default: false },
    nftAddress: { type: String },

    // Metadata
    submittedAt: { type: Date, default: Date.now },
    evaluatedAt: { type: Date },
    llmModel: { type: String },
    llmTokensUsed: { type: Number },
    llmReasoningEffort: { type: String }
}, {
    timestamps: true
});

// Index for efficient queries
missionSubmissionSchema.index({ userId: 1, journeyId: 1 });
missionSubmissionSchema.index({ missionId: 1 });
missionSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('MissionSubmission', missionSubmissionSchema);
