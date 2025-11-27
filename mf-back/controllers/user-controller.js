const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({
  quiet: true
});

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : null);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Generate access token - short lived (15-60 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' } // Short-lived token
  );
};

// Generate refresh token - longer lived (days/weeks)
const generateRefreshToken = (user) => {
  // Create a random token
  const refreshToken = crypto.randomBytes(40).toString('hex');

  // Set expiry date - 7 days from now
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

  // Save to user
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = refreshTokenExpiry;

  return refreshToken;
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, wallet_address, persona } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      wallet_address,
      persona,
    });

    if (user) {
      // Generate refresh token
      const refreshToken = generateRefreshToken(user);
      await user.save(); // Save the refresh token to user

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          wallet_address: user.wallet_address,
          persona: user.persona,
        },
        accessToken: generateAccessToken(user),
        refreshToken
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);

    // Create a refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    // Clear sensitive data
    const userToReturn = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet_address: user.wallet_address,
    };

    // Send response with tokens
    res.status(200).json({
      success: true,
      user: userToReturn,
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

exports.loginWithWallet = async (req, res) => {
  try {
    const { wallet_address } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    // Find user by wallet address
    const user = await User.findOne({ wallet_address });

    if (!user) {
      // User not found - Frontend should redirect to registration
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Save refresh token
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Clear sensitive data
    const userToReturn = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet_address: user.wallet_address,
    };

    res.status(200).json({
      success: true,
      user: userToReturn,
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to login with wallet',
      error: error.message
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    console.log("🔍 Get user profile request received");

    // The user object should be attached to req by the protect middleware
    const user = req.user;

    if (!user) {
      console.log("❌ No user attached to request");
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Returning profile for user: ${user.email}`);

    // Return user data (excluding sensitive fields)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
        persona: user.persona,
      }
    });
  } catch (error) {
    console.error("🚨 Get profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    // Get user from the auth middleware
    const userId = req.user.id;

    // Check if a file was uploaded
    //const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.email && { email: req.body.email }),
        ...(req.body.wallet_address && { wallet_address: req.body.wallet_address }),
        ...(req.body.persona && { persona: req.body.persona }),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Only allow admins or the user themselves to delete their account
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete - set is_active to false
    user.is_active = false;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change user roles'
      });
    }

    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: error.message
    });
  }
};

exports.subscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !['gold', 'platinum', 'diamond'].includes(subscription)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription specified'
      });
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.subscription = subscription;
    user.subscription_date = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User subscription updated to ${subscription}`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe user',
      error: error.message
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Find user by refresh token and clear it
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      user.refreshTokenExpiry = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Find user by refresh token
    const user = await User.findOne({
      refreshToken,
      refreshTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};

exports.updateTokenBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mfai_tokens } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        'token_transactions.mfai_tokens': mfai_tokens,
        'token_transactions.last_updated': new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token balance updated successfully',
      user: {
        id: user._id,
        token_transactions: user.token_transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update token balance',
      error: error.message
    });
  }
};

const { verifyTransaction } = require('../utils/solana');

exports.addNFTCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phase,
      nft_address,
      mint_address,
      score,
      title,
      description,
      image_url,
      rarity,
      xp_earned
    } = req.body;

    // In the frontend, 'mint_address' is sent as the transaction signature (txSig)
    // We use this to verify the transaction on-chain.
    const resolvedAddressRaw = nft_address || mint_address;
    const resolvedAddress = typeof resolvedAddressRaw === 'string' ? resolvedAddressRaw.trim() : '';

    if (!resolvedAddress || resolvedAddress.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid NFT mint address/signature is required'
      });
    }

    // --- SECURITY CHECK: Verify Transaction on Solana ---
    // Skip verification in test environment if needed, or mock it.
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_SOLANA_TESTS === 'true') {
      try {
        await verifyTransaction(resolvedAddress, req.user.wallet_address);
      } catch (verificationError) {
        console.error(`NFT Verification Failed for user ${userId}:`, verificationError.message);
        return res.status(400).json({
          success: false,
          message: 'NFT Verification Failed: Invalid transaction or wallet mismatch.',
          error: verificationError.message
        });
      }
    }
    // ----------------------------------------------------

    const duplicateCertificate = await User.findOne({
      'nft_certificates.mint_address': resolvedAddress,
    });

    if (duplicateCertificate) {
      return res.status(409).json({
        success: false,
        message: 'NFT certificate already recorded',
      });
    }

    const allowedRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique'];

    const resolvedPhase = Number.isFinite(Number(phase)) ? Number(phase) : undefined;

    const numericXp = Number.isFinite(Number(xp_earned)) ? Math.max(0, Math.min(1000, Number(xp_earned))) : undefined;

    const normalizedRarity = typeof rarity === 'string' && rarity.trim().length > 0
      ? rarity.trim().toLowerCase()
      : undefined;

    if (normalizedRarity && !allowedRarities.includes(normalizedRarity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rarity provided',
      });
    }

    const normalizedTitle = typeof title === 'string' ? title.trim() : undefined;
    const normalizedDescription = typeof description === 'string' ? description.trim() : undefined;
    const normalizedImageUrl = typeof image_url === 'string' ? image_url.trim() : undefined;

    const numericScore = Number.isFinite(Number(score)) ? Math.max(0, Math.min(100, Number(score))) : 0;

    const certificatePayload = {
      ...(resolvedPhase !== undefined && !Number.isNaN(resolvedPhase) && { phase: resolvedPhase }),
      nft_address: resolvedAddress,
      mint_address: resolvedAddress,
      score: numericScore,
      mint_date: new Date(),
      ...(normalizedTitle && { title: normalizedTitle }),
      ...(normalizedDescription && { description: normalizedDescription }),
      ...(normalizedImageUrl && { image_url: normalizedImageUrl }),
      ...(normalizedRarity && { rarity: normalizedRarity }),
      ...(numericXp !== undefined && !Number.isNaN(numericXp) && { xp_earned: numericXp })
    };

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          nft_certificates: certificatePayload
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'NFT certificate added successfully',
      user: {
        id: user._id,
        nft_certificates: user.nft_certificates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add NFT certificate',
      error: error.message
    });
  }
};