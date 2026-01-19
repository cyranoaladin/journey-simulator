/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const User = require('../models/user');
const dotenv = require('dotenv');
const AuthService = require('../services/authService');

dotenv.config({
  quiet: true
});

exports.registerUser = async (req, res) => {
  try {
    const result = await AuthService.createUser(req.body);
    if (!result.success) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    const refreshToken = AuthService.generateRefreshToken(result.user);
    await result.user.save();

    res.status(201).json({
      success: true,
      user: AuthService.sanitizeUserResponse(result.user),
      accessToken: AuthService.generateAccessToken(result.user),
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

exports.createWalletChallenge = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    const result = await AuthService.createWalletChallenge(wallet_address);
    if (!result.success) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      nonce: result.nonce
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create wallet challenge',
      error: error.message
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validation = await AuthService.validateCredentials(email, password);

    if (!validation.valid) {
      return res.status(validation.error.status).json({ success: false, message: validation.error.message });
    }

    const accessToken = AuthService.generateAccessToken(validation.user);
    const refreshToken = AuthService.generateRefreshToken(validation.user);
    await validation.user.save();

    res.status(200).json({
      success: true,
      user: AuthService.sanitizeUserResponse(validation.user),
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

// Helper functions for wallet login - using AuthService
const validateWalletLoginInput = (walletAddress) => {
  if (!walletAddress) {
    return { valid: false, error: { status: 400, message: 'Wallet address is required' } };
  }
  return { valid: true };
};

const validateUserForLogin = (user) => {
  if (!user) {
    return { valid: false, error: { status: 404, message: 'User not found' } };
  }
  if (!user.is_active) {
    return { valid: false, error: { status: 401, message: 'Your account has been deactivated' } };
  }
  return { valid: true };
};

const checkStrictModeRequirement = (isStrict, hasProof, walletAddress) => {
  if (isStrict && !hasProof) {
    console.warn(`[Auth] Rejected insecure wallet login for ${walletAddress} (Strict Mode ON)`);
    return {
      blocked: true,
      error: {
        status: 400,
        message: 'Signature and message required. Insecure login is disabled.'
      }
    };
  }
  return { blocked: false };
};

exports.loginWithWallet = async (req, res) => {
  try {
    const { wallet_address, signature, message } = req.body;

    const inputValidation = validateWalletLoginInput(wallet_address);
    if (!inputValidation.valid) {
      return res.status(inputValidation.error.status).json({
        success: false,
        message: inputValidation.error.message
      });
    }

    const user = await User.findOne({ wallet_address });
    const userValidation = validateUserForLogin(user);
    if (!userValidation.valid) {
      return res.status(userValidation.error.status).json({
        success: false,
        message: userValidation.error.message
      });
    }

    const isStrict = process.env.ENABLE_STRICT_WALLET_LOGIN === 'true';
    const hasProof = signature && message;

    const strictCheck = checkStrictModeRequirement(isStrict, hasProof, wallet_address);
    if (strictCheck.blocked) {
      return res.status(strictCheck.error.status).json({
        success: false,
        message: strictCheck.error.message
      });
    }

    if (hasProof) {
      const secureLoginResult = await AuthService.performSecureLogin(user, signature, message, wallet_address);
      if (!secureLoginResult.valid) {
        return res.status(secureLoginResult.error.status).json({
          success: false,
          message: secureLoginResult.error.message,
          ...(secureLoginResult.error.error && { error: secureLoginResult.error.error })
        });
      }
    } else {
      console.warn(`[Security Warning] Insecure wallet login used for ${wallet_address}. Enable ENABLE_STRICT_WALLET_LOGIN=true for production.`);
    }

    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = AuthService.generateRefreshToken(user);
    await user.save();

    const userToReturn = AuthService.sanitizeUserResponse(user);

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

    const user = await User.findById(req.params.id);
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

exports.debugWhoAmI = async (req, res) => {
  // Guard: Dev only or Admin
  if (process.env.NODE_ENV === 'production' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Debug endpoint not available' });
  }

  res.status(200).json({
    success: true,
    data: {
      mongoId: req.user._id,
      email: req.user.email,
      wallet_address: req.user.wallet_address,
      role: req.user.role,
      wallet_nonce_set: !!req.user.wallet_nonce
    }
  });
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

    const refreshTokenHash = AuthService.hashRefreshToken(refreshToken);
    // Find user by hashed refresh token (preferred) or legacy raw token (temporary)
    const user = await User.findOne({
      $or: [{ refreshTokenHash }, { refreshToken }],
    });
    if (user) {
      user.refreshToken = undefined;
      user.refreshTokenHash = undefined;
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

    const refreshTokenHash = AuthService.hashRefreshToken(refreshToken);
    // Find user by hashed refresh token (preferred) or legacy raw token (temporary)
    const user = await User.findOne({
      refreshTokenExpiry: { $gt: new Date() },
      $or: [{ refreshTokenHash }, { refreshToken }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const accessToken = AuthService.generateAccessToken(user);
    // Rotate refresh token on every refresh to reduce replay window
    const nextRefreshToken = AuthService.generateRefreshToken(user);
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: nextRefreshToken,
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

// Helper functions to reduce cognitive complexity
const normalizeStringField = (value) => {
  return typeof value === 'string' ? value.trim() : undefined;
};

const normalizeNumericField = (value, min = 0, max = 100) => {
  return Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : undefined;
};

const normalizePhase = (phase) => {
  return Number.isFinite(Number(phase)) ? Number(phase) : undefined;
};

const validateRarity = (rarity, allowedRarities) => {
  const normalized = normalizeStringField(rarity)?.toLowerCase();
  if (normalized && !allowedRarities.includes(normalized)) {
    return { valid: false, error: 'Invalid rarity provided' };
  }
  return { valid: true, value: normalized };
};

const resolveMintAddress = (nftAddress, mintAddress) => {
  const resolved = nftAddress || mintAddress;
  return typeof resolved === 'string' ? resolved.trim() : '';
};

const verifyNFTSecurity = async (resolvedAddress, walletAddress, userId) => {
  const shouldVerify = process.env.NODE_ENV !== 'test' || process.env.ENABLE_SOLANA_TESTS === 'true';
  if (!shouldVerify) return { success: true };

  try {
    await verifyTransaction(resolvedAddress, walletAddress);
    return { success: true };
  } catch (verificationError) {
    const errorMsg = verificationError instanceof Error ? verificationError.message : String(verificationError);
    if (process.env.NODE_ENV !== 'test') {
      console.error('NFT verification failed', { userId, error: errorMsg });
    }
    return {
      success: false,
      error: errorMsg,
      message: 'NFT Verification Failed: Invalid transaction or wallet mismatch.'
    };
  }
};

const buildCertificatePayload = (data, resolvedAddress) => {
  const allowedRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique'];
  const rarityValidation = validateRarity(data.rarity, allowedRarities);
  if (!rarityValidation.valid) {
    return { error: rarityValidation.error };
  }

  const resolvedPhase = normalizePhase(data.phase);
  const numericXp = normalizeNumericField(data.xp_earned, 0, 1000);
  const numericScore = normalizeNumericField(data.score, 0, 100) || 0;

  return {
    payload: {
      ...(resolvedPhase !== undefined && !Number.isNaN(resolvedPhase) && { phase: resolvedPhase }),
      nft_address: resolvedAddress,
      mint_address: resolvedAddress,
      score: numericScore,
      mint_date: new Date(),
      ...(normalizeStringField(data.title) && { title: normalizeStringField(data.title) }),
      ...(normalizeStringField(data.description) && { description: normalizeStringField(data.description) }),
      ...(normalizeStringField(data.image_url) && { image_url: normalizeStringField(data.image_url) }),
      ...(rarityValidation.value && { rarity: rarityValidation.value }),
      ...(numericXp !== undefined && !Number.isNaN(numericXp) && { xp_earned: numericXp })
    }
  };
};

exports.addNFTCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const resolvedAddress = resolveMintAddress(req.body.nft_address, req.body.mint_address);

    if (!resolvedAddress || resolvedAddress.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid NFT mint address/signature is required'
      });
    }

    const securityCheck = await verifyNFTSecurity(resolvedAddress, req.user.wallet_address, userId);
    if (!securityCheck.success) {
      return res.status(400).json({
        success: false,
        message: securityCheck.message,
        error: securityCheck.error
      });
    }

    const duplicateCertificate = await User.findOne({
      'nft_certificates.mint_address': resolvedAddress,
    });

    if (duplicateCertificate) {
      return res.status(409).json({
        success: false,
        message: 'NFT certificate already recorded',
      });
    }

    const certificateResult = buildCertificatePayload(req.body, resolvedAddress);
    if (certificateResult.error) {
      return res.status(400).json({
        success: false,
        message: certificateResult.error,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          nft_certificates: certificateResult.payload
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

/**
 * PHASE 5: Neural Handshake Status Retrieval
 */
exports.getNeuralHandshakeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('neural_handshake');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      neural_handshake: user.neural_handshake || { progress: 0, files_transferred: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PHASE 5: Neural Handshake State Synchronization
 * Saves progress and validated file hashes to user profile.
 */
exports.syncNeuralHandshake = async (req, res) => {
  try {
    const { progress, integrity_hash, files } = req.body;

    const updateData = {
      'neural_handshake.last_sync_at': new Date(),
      'neural_handshake.progress': progress || 0,
      'neural_handshake.integrity_hash': integrity_hash || null,
    };

    if (Array.isArray(files)) {
      updateData['neural_handshake.files_transferred'] = files.map(f => ({
        filename: f.filename,
        size: f.size,
        status: f.status || 'VALIDATED',
        hash: f.hash
      }));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('neural_handshake');

    res.status(200).json({
      success: true,
      message: 'Neuro-state synced to core.',
      handshake: user.neural_handshake
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
