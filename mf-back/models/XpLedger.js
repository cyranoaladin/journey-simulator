const mongoose = require('mongoose');

const xpLedgerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
        index: true
    },
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JourneyRun',
        required: false, // Can be global bonus not tied to a run
        immutable: true
    },
    sourceType: {
        type: String,
        enum: ['EVALUATION', 'BONUS', 'COMPLETION'],
        required: true,
        immutable: true
    },
    sourceId: {
        type: String,
        required: true,
        immutable: true,
        description: "ID reference to Evaluation or specific Bonus event"
    },
    amount: {
        type: Number,
        required: true,
        immutable: true
    }, // Can be positive only for now (append-only gain), or negative for penalty? S2.1 says "Gains XP"
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Immutable
});

// Prevent updates
xpLedgerSchema.pre('save', async function () {
    if (!this.isNew) {
        throw new Error('XpLedger entries are immutable.');
    }
});

module.exports = mongoose.model('XpLedger', xpLedgerSchema);
