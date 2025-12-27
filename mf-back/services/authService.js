const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const nacl = require('tweetnacl');
const bs58 = require('bs58').default || require('bs58');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : null);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

/**
 * Service d'authentification
 * Extrait la logique métier des controllers pour réduire la complexité cognitive
 */
class AuthService {
  /**
   * Génère un token d'accès
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Hash un refresh token
   */
  static hashRefreshToken(token) {
    return crypto.createHash('sha256').update(String(token)).digest('hex');
  }

  /**
   * Génère un refresh token
   */
  static generateRefreshToken(user) {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    user.refreshTokenHash = this.hashRefreshToken(refreshToken);
    user.refreshTokenExpiry = refreshTokenExpiry;
    user.refreshToken = undefined;

    return refreshToken;
  }

  /**
   * Valide les credentials d'un utilisateur
   */
  static async validateCredentials(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      return { valid: false, error: { status: 401, message: 'Invalid email or password' } };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { valid: false, error: { status: 401, message: 'Invalid email or password' } };
    }

    if (!user.is_active) {
      return { valid: false, error: { status: 401, message: 'Your account has been deactivated' } };
    }

    return { valid: true, user };
  }

  /**
   * Crée un utilisateur
   */
  static async createUser(userData) {
    const { name, email, password, wallet_address, persona } = userData;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return { success: false, error: { status: 400, message: 'User with this email already exists' } };
    }

    const user = await User.create({
      name,
      email,
      password,
      wallet_address,
      persona,
    });

    if (!user) {
      return { success: false, error: { status: 400, message: 'Invalid user data' } };
    }

    return { success: true, user };
  }

  /**
   * Prépare la réponse utilisateur (sans données sensibles)
   */
  static sanitizeUserResponse(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet_address: user.wallet_address,
      persona: user.persona,
    };
  }

  /**
   * Génère un challenge pour l'authentification wallet
   */
  static async createWalletChallenge(walletAddress) {
    const user = await User.findOne({ wallet_address: walletAddress });
    if (!user) {
      return { success: false, error: { status: 404, message: 'User not found' } };
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    user.wallet_nonce = nonce;
    user.wallet_nonce_expiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const message = `Sign this message to log in to Money Factory AI\n\nNonce: ${nonce}`;
    return { success: true, message, nonce };
  }

  /**
   * Valide le format du message de challenge
   */
  static validateMessageFormat(message, nonce) {
    const expectedMessage = `Sign this message to log in to Money Factory AI\n\nNonce: ${nonce}`;
    if (message !== expectedMessage) {
      return {
        valid: false,
        error: { status: 401, message: 'Invalid message format or nonce mismatch' }
      };
    }
    return { valid: true };
  }

  /**
   * Vérifie la signature wallet
   */
  static verifyWalletSignature(signature, message, walletAddress) {
    try {
      const signatureUint8 = bs58.decode(signature);
      const messageUint8 = new TextEncoder().encode(message);
      const publicKeyUint8 = bs58.decode(walletAddress);
      const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
      if (!verified) {
        return { valid: false, error: { status: 401, message: 'Invalid wallet signature' } };
      }
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: { status: 400, message: 'Cryptographic verification failed', error: err.message }
      };
    }
  }

  /**
   * Valide le challenge wallet
   */
  static validateChallenge(user) {
    if (!user.wallet_nonce || !user.wallet_nonce_expiry || user.wallet_nonce_expiry < new Date()) {
      return {
        valid: false,
        error: { status: 401, message: 'Login challenge expired or invalid. Please request a new challenge.' }
      };
    }
    return { valid: true };
  }

  /**
   * Effectue une connexion sécurisée avec wallet
   */
  static async performSecureLogin(user, signature, message, walletAddress) {
    const challengeCheck = this.validateChallenge(user);
    if (!challengeCheck.valid) {
      return challengeCheck;
    }

    const messageCheck = this.validateMessageFormat(message, user.wallet_nonce);
    if (!messageCheck.valid) {
      return messageCheck;
    }

    const signatureCheck = this.verifyWalletSignature(signature, message, walletAddress);
    if (!signatureCheck.valid) {
      return signatureCheck;
    }

    user.wallet_nonce = null;
    user.wallet_nonce_expiry = null;
    await user.save();

    return { valid: true };
  }
}

module.exports = AuthService;

