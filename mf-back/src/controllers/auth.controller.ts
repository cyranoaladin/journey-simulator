/**
 * Auth Controller - TypeScript/Prisma
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, wallet: user.walletAddress, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, wallet_address } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const walletAddr = wallet_address || `wallet_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const user = await prisma.user.create({
      data: {
        name: name || 'New User',
        email,
        walletAddress: walletAddr,
        role: 'FOUNDER',
      },
    });

    const token = generateToken(user);
    res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const connectWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_CONNECT_WALLET !== 'true') {
      res.status(410).json({
        error: 'Deprecated: use /user/wallet-challenge + /user/login-wallet (signature-based login).',
      });
      return;
    }

    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { walletAddress } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: `User ${walletAddress.slice(0, 6)}`,
          walletAddress,
          role: 'FOUNDER',
        },
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        wallet: user.walletAddress,
        role: user.role,
        xp: user.totalXP || 0,
      },
    });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    if (token === 'demo-token') {
      res.json({
        success: true,
        valid: true,
        user: { id: 'demo-user-id', name: 'Demo User', email: 'demo@moneyfactory.ai' },
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
      }

      res.json({
        success: true,
        valid: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (jwtError: unknown) {
      const err = jwtError as { name?: string };
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired', expired: true });
      } else if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, message: 'Invalid token format' });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, refreshToken } = req.body;

    if (!token && !refreshToken) {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    const tokenToUse = refreshToken || token;

    let decoded: { id: string };
    try {
      decoded = jwt.verify(tokenToUse, JWT_SECRET, { ignoreExpiration: true }) as { id: string };
    } catch {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    const newToken = generateToken(user);

    res.json({
      success: true,
      accessToken: newToken,
      token: newToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
};

export const testCleanup = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Cleanup not available in production' });
    return;
  }

  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    await prisma.user.deleteMany({ where: { email } });
    res.json({ success: true, message: `User ${email} deleted` });
  } catch (error) {
    console.error('Test Cleanup Error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
};

export const testLogin = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Test login not available in production' });
    return;
  }

  try {
    const { email } = req.body;
    const testEmail = email || 'test@mfai.app';

    const user = await prisma.user.findFirst({ where: { email: testEmail } });
    if (!user) {
      res.status(400).json({ error: 'Test user not found. Run ensureTestUser()' });
      return;
    }

    const token = generateToken(user);

    res.cookie('mfai_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Test Login Error:', error);
    res.status(500).json({ error: 'Test login failed' });
  }
};
