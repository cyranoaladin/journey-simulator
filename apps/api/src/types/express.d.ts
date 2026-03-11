/**
 * Express Request Type Extensions
 */

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        _id?: string;
        wallet_address?: string;
        is_active?: boolean;
      };
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: User;
}

export interface JwtPayload {
  id: string;
  wallet: string;
  role: string;
  iat?: number;
  exp?: number;
}
