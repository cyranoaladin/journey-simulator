
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, wallet: user.wallet_address, role: user.role },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
    );
};

// POST /api/auth/connect-wallet
// Connects a wallet, creates user if not exists, returns JWT
router.post('/connect-wallet', async (req, res) => {
    try {
        const { walletAddress, chain = 'solana', persona = 'investor' } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        // Find existing user by wallet address
        let user = await User.findOne({ wallet_address: walletAddress });

        if (user) {
            // Update last activity
            user.last_activity = new Date();

            // Ensure wallet is in wallets array
            const walletExists = user.wallets.some(w => w.address === walletAddress);
            if (!walletExists) {
                user.wallets.push({
                    address: walletAddress,
                    chain: chain,
                    is_primary: true
                });
            }

            await user.save();
        } else {
            // Create new user
            user = new User({
                name: `User ${walletAddress.slice(0, 6)}`,
                email: `${walletAddress}@placeholder.mfai`, // Placeholder email
                password: 'wallet-login-no-password', // Dummy password
                wallet_address: walletAddress,
                persona: persona,
                wallets: [{
                    address: walletAddress,
                    chain: chain,
                    is_primary: true
                }]
            });
            await user.save();
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                wallet: user.wallet_address,
                persona: user.persona,
                xp: user.total_xp,
                level: user.current_level
            }
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// GET /api/auth/me
// Returns current user profile based on JWT
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
