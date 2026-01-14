/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const personaValues = [
    'cognitive-activation-hub',
    'capital-foundry',
    'system-architect',
    'experience-studio',
    'impact-engine',
    'resilience-master',
    // Legacy personas for backward compatibility
    'curious-student',
    'web2-entrepreneur',
    'web3-developer',
    'content-creator',
    'community-communicator',
    'project-manager',
    'defi-explorer',
    'nft-creator',
    'investor',
    'student',
    'entrepreneur',
    'developer',
    'creator'
];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    wallet_address: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
    },
    // New field for multi-wallet support
    wallets: [{
        address: { type: String, required: true },
        chain: { type: String, default: 'solana' },
        connected_at: { type: Date, default: Date.now },
        is_primary: { type: Boolean, default: false }
    }],
    persona: {
        type: String,
        enum: personaValues,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    last_activity: {
        type: Date,
        default: Date.now,
    },
    total_xp: {
        type: Number,
        default: 0,
    },
    current_level: {
        type: Number,
        default: 0,
    },
    completed_phases: {
        type: Number,
        default: 0,
    },
    nft_certificates: [
        {
            phase: {
                type: Number,
            },
            nft_address: {
                type: String,
            },
            mint_address: {
                type: String,
            },
            mint_date: {
                type: Date,
                default: Date.now,
            },
            score: {
                type: Number,
                default: 0,
            },
            title: {
                type: String,
            },
            description: {
                type: String,
            },
            image_url: {
                type: String,
            },
            rarity: {
                type: String,
            },
            xp_earned: {
                type: Number,
            },
        }
    ],
    token_transactions: {
        mfai_tokens: {
            type: Number,
            default: 0,
        },
        last_updated: {
            type: Date,
            default: Date.now,
        },
    },

    subscription: {
        type: String,
        enum: ['free plan', 'gold', 'platinum', 'diamond'],
        default: 'free plan',
    },
    subscription_date: {
        type: Date,
        default: null,
    },

    preferences: {
        language: {
            type: String,
            default: 'en',
        },
        notifications: {
            type: Boolean,
            default: true,
        },
        privacy_level: {
            type: String,
        },
    },

    demo_mode: {
        enabled: {
            type: Boolean,
            default: false,
        },
        persona_id: {
            type: String,
            default: null,
        },
        last_loaded_at: {
            type: Date,
            default: null,
        },
        completed_phase_indexes: {
            type: [Number],
            default: [],
        },
    },

    // JWT refresh token fields
    // Prefer storing a hash of the refresh token (not the raw token).
    refreshTokenHash: {
        type: String,
        default: null,
    },
    // Legacy (kept temporarily for backward compatibility during token rotation).
    refreshToken: {
        type: String,
        default: null,
    },
    refreshTokenExpiry: {
        type: Date,
        default: null,
    },

    // Wallet login nonce
    wallet_nonce: {
        type: String,
        default: null,
    },
    wallet_nonce_expiry: {
        type: Date,
        default: null,
    },

    // Analytics fields
    analytics: {
        certificate_downloads: {
            type: Number,
            default: 0,
        },
        certificate_shares: {
            type: Number,
            default: 0,
        },
        holder_interactions: {
            type: Number,
            default: 0,
        },
        download_history: [{
            certificate_id: String,
            phase: Number,
            timestamp: Date,
        }],
        share_history: [{
            certificate_id: String,
            platform: String,
            phase: Number,
            timestamp: Date,
        }],
        interaction_history: [{
            holder_id: String,
            interaction_type: String,
            timestamp: Date,
        }],
    },

});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;
