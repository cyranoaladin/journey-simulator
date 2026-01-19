/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const favoriteResourceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    journeyId: {
        type: String,
        required: true
    },
    resource: {
        id: { type: String, required: true },
        label: { type: String, required: true },
        description: String,
        url: String,
        resource_type: String,
        agent_owner: String
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    notes: String
}, {
    timestamps: true
});

// Compound index to prevent duplicates
favoriteResourceSchema.index({ userId: 1, 'resource.id': 1 }, { unique: true });

module.exports = mongoose.model('FavoriteResource', favoriteResourceSchema);
