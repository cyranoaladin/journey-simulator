const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : null);
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, wallet: user.wallet_address, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// --- WEB 2 AUTHENTICATION (Email/Password) ---

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name: name || 'New User',
            email,
            password: hashedPassword,
            persona: 'investor',
            wallet_address: null // No wallet yet
        });

        await user.save();

        const token = generateToken(user);
        res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password (if user has one - web3 users might not)
        if (!user.password) {
            return res.status(400).json({ error: 'Please login with your Wallet' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- WEB 3 AUTHENTICATION (Wallet) ---

// POST /auth/connect-wallet
router.post('/connect-wallet', async (req, res) => {
    try {
        // This endpoint is legacy/insecure when used without signature.
        // Prefer SIWS-like flow:
        // 1) POST /user/wallet-challenge
        // 2) Wallet signs message
        // 3) POST /user/login-wallet
        //
        // In production, disallow insecure connect-wallet unless explicitly enabled.
        if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_CONNECT_WALLET !== 'true') {
            return res.status(410).json({
                error: 'Deprecated: use /user/wallet-challenge + /user/login-wallet (signature-based login).'
            });
        }

        const { walletAddress, chain = 'solana', persona = 'investor' } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        let user = await User.findOne({ wallet_address: walletAddress });

        if (user) {
            user.last_activity = new Date();
            // Ensure wallet is in list
            if (user.wallets && !user.wallets.some(w => w.address === walletAddress)) {
                user.wallets.push({ address: walletAddress, chain, is_primary: true });
            }
            await user.save();
        } else {
            user = new User({
                name: `User ${walletAddress.slice(0, 6)}`,
                email: `${walletAddress}@placeholder.mfai`,
                password: '', // No password for wallet users
                wallet_address: walletAddress,
                persona: persona,
                wallets: [{ address: walletAddress, chain, is_primary: true }]
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

// GET /auth/me
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /auth/verify - Verify token validity
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        // Special handling for demo token
        if (token === 'demo-token') {
            return res.json({
                success: true,
                valid: true,
                user: {
                    id: '507f1f77bcf86cd799439011',
                    name: 'Demo User',
                    email: 'demo@moneyfactory.ai'
                }
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
            const user = await User.findById(decoded.id).select('-password');

            if (!user || !user.is_active) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }

            res.json({
                success: true,
                valid: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (jwtError) {
            // Handle JWT-specific errors (expired, malformed, etc.)
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                    expired: true
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token format'
                });
            }
            throw jwtError; // Re-throw if it's not a JWT error
        }
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { token, refreshToken } = req.body;

        if (!token && !refreshToken) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const tokenToUse = refreshToken || token;

        // Try to decode the token (even if expired)
        let decoded;
        try {
            decoded = jwt.verify(tokenToUse, process.env.JWT_SECRET || 'dev-secret-key', { ignoreExpiration: true });
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }

        // Generate new token
        const newToken = generateToken(user);

        res.json({
            success: true,
            accessToken: newToken,
            token: newToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ success: false, message: 'Token refresh failed' });
    }
});

module.exports = router;
