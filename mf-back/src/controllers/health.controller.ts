/**
 * Health Controller - TypeScript/Prisma
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'UP' : 'DOWN',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const healthz = (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const readyz = async (_req: Request, res: Response): Promise<void> => {
  let dbReady = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReady = true;
  } catch {
    dbReady = false;
  }

  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ready' : 'not-ready',
    database: dbReady ? 'connected' : 'disconnected',
  });
};
