const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config({
  quiet: true
});

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : null);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Special handling for demo mode
    if (token === 'demo-token') {
      // Create a demo user object for demo mode
      req.user = {
        id: '507f1f77bcf86cd799439011', // Consistent demo user ID
        name: 'Demo User',
        email: 'demo@moneyfactory.ai',
        role: 'user',
        wallet_address: 'DEMO_WALLET_ADDRESS',
        persona: 'cognitive-activation-hub',
        is_active: true,
        total_xp: 0,
        current_level: 0,
        completed_phases: 0,
        nft_certificates: [],
        token_transactions: {
          mfai_tokens: 0,
          last_updated: new Date()
        },
        subscription: 'free plan',
        _id: '507f1f77bcf86cd799439011'
      };
      next();
      return;
    }

    try {
      // Verify real JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { protect, adminOnly };
