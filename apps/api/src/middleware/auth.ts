/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { JwtPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : '');

if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // API Key auth for testing
    if (req.headers['x-api-key'] && (req.headers['x-api-key'] === process.env.MFAI_TEST_KEY || process.env.NODE_ENV === 'test')) {
      req.user = {
        id: 'test-admin-rag',
        walletAddress: 'TEST_WALLET',
        name: 'RAG Admin',
        email: 'rag@moneyfactory.ai',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
        reputationScore: 0,
        totalXP: 0,
        mfaiTokens: 0,
        votingPower: 0,
      };
      return next();
    }

    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    // Demo mode
    if (token === 'demo-token') {
      req.user = {
        id: 'demo-user-id',
        walletAddress: 'DEMO_WALLET_ADDRESS',
        name: 'Demo User',
        email: 'demo@moneyfactory.ai',
        role: 'FOUNDER',
        createdAt: new Date(),
        updatedAt: new Date(),
        reputationScore: 0,
        totalXP: 0,
        mfaiTokens: 0,
        votingPower: 0,
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        res.status(401).json({ success: false, message: 'Token is not valid. User not found.' });
        return;
      }

      req.user = user;
      next();
    } catch {
      res.status(401).json({ success: false, message: 'Token is not valid.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error in authentication.' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    if (token === 'demo-token') {
      req.user = {
        id: 'demo-user-id',
        walletAddress: 'DEMO_WALLET_ADDRESS',
        name: 'Demo User',
        email: 'demo@moneyfactory.ai',
        role: 'FOUNDER',
        createdAt: new Date(),
        updatedAt: new Date(),
        reputationScore: 0,
        totalXP: 0,
        mfaiTokens: 0,
        votingPower: 0,
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      req.user = user || undefined;
    } catch {
      req.user = undefined;
    }
    next();
  } catch (error) {
    console.error('OptionalAuth middleware error:', error);
    next();
  }
};
