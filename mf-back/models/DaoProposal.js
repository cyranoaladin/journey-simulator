const mongoose = require('mongoose');

const daoProposalSchema = new mongoose.Schema({
    proposalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },

    votes: {
        yes: { type: Number, default: 0 },
        no: { type: Number, default: 0 }
    },

    voterDetails: {
        type: Map,
        of: {
            support: { type: String, enum: ['yes', 'no'] },
            weight: { type: Number },
            votedAt: { type: Date }
        }
    },

    quorumMet: { type: Boolean, default: false },
    outcome: { type: String }
}, {
    timestamps: true
});

// Indexes for efficient queries

daoProposalSchema.index({ status: 1 });
daoProposalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DaoProposal', daoProposalSchema);
