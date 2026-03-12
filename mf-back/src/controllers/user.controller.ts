/**
 * User Controller - TypeScript/Prisma
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { User } from '@prisma/client';

// SECURITY FIX 2026-03-11: Fail explicitly if JWT_SECRET is not set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;

interface UserResponse {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  walletAddress: string;
  reputationScore: number;
  totalXP: number;
  mfaiTokens: number;
}

const generateAccessToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, wallet: user.walletAddress, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const sanitizeUser = (user: User): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  walletAddress: user.walletAddress,
  reputationScore: user.reputationScore,
  totalXP: user.totalXP,
  mfaiTokens: user.mfaiTokens,
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // NAMING FIX 2026-03-11: Support both snake_case and camelCase for backward compatibility
    const { name, email, wallet_address, walletAddress } = req.body;
    const walletAddr = (walletAddress || wallet_address) || `wallet_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }



    const user = await prisma.user.create({
      data: {
        name: name || 'New User',
        email,
        walletAddress: walletAddr,
        role: 'FOUNDER',
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};

export const createWalletChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet_address, walletAddress } = req.body;
    const walletAddr = walletAddress || wallet_address;
    if (!walletAddr) {
      res.status(400).json({ success: false, message: 'Wallet address is required' });
      return;
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    const message = `Sign this message to authenticate with MFAI: ${nonce}`;

    res.status(200).json({ success: true, message, nonce });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create wallet challenge' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
};

export const loginWithWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet_address } = req.body;

    if (!wallet_address) {
      res.status(400).json({ success: false, message: 'Wallet address is required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { walletAddress: wallet_address } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `User ${wallet_address.slice(0, 6)}`,
          walletAddress: wallet_address,
          role: 'FOUNDER',
        },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to login with wallet' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user as User),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.user?.id;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID required' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
      return;
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
        totalXP: true,
        reputationScore: true,
      },
    });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to change user roles' });
      return;
    }

    const { role } = req.body;
    const validRoles = ['FOUNDER', 'INVESTOR', 'ADMIN'];

    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change user role' });
  }
};

export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to refresh token' });
  }
};

export const updateTokenBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { mfai_tokens } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { mfaiTokens: parseInt(mfai_tokens) || 0 },
    });

    res.status(200).json({
      success: true,
      message: 'Token balance updated successfully',
      user: { id: user.id, mfaiTokens: user.mfaiTokens },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update token balance' });
  }
};

export const addNFTCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { nft_address, mint_address, title, description } = req.body;
    const resolvedAddress = nft_address || mint_address;

    if (!resolvedAddress || resolvedAddress.length < 10) {
      res.status(400).json({ success: false, message: 'Valid NFT mint address is required' });
      return;
    }

    const nftMint = await prisma.nftMint.create({
      data: {
        userId,
        wallet: req.user?.walletAddress || 'unknown',
        mintAddress: resolvedAddress,
        txId: `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'completion_badge',
        metadata: { title, description },
      },
    });

    res.status(200).json({
      success: true,
      message: 'NFT certificate added successfully',
      nftMint,
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      res.status(409).json({ success: false, message: 'NFT certificate already recorded' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to add NFT certificate' });
  }
};

export const getNeuralHandshakeStatus = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    neural_handshake: { progress: 100, files_transferred: [] },
  });
};

export const syncNeuralHandshake = async (req: Request, res: Response): Promise<void> => {
  const { progress, integrity_hash, files } = req.body;
  res.status(200).json({
    success: true,
    message: 'Neuro-state synced to core.',
    handshake: { progress, integrity_hash, files_transferred: files || [] },
  });
};
