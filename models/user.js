const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { subscription } = require('../controllers/user-controller');

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
    },
    persona: {
        type: String,
        enum: ['student', 'entrepreneur', 'developer', 'creator'],
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true,
    },
    is_active : {
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
            mint_date: {
                type: Date,
                default: Date.now,
            },
            score: {
                type: Number,
                default: 0,
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

    subscription:{
        type: String,
        enum: ['gold', 'platinum', 'diamond'],
        default : false, 
    },
    subscription_date:{
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

});

// Hash password before saving
userSchema.pre('save', async function(next) {
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
  userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };


const User = mongoose.model('User', userSchema);

module.exports = User;