/**
 * Global Error Handler Middleware
 * Handles Prisma errors and other exceptions
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ErrorHandler]', err);

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const target = (err.meta?.target as string[]) || ['field'];
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `A record with this ${target.join(', ')} already exists.`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        });

      case 'P2025':
        // Record not found
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'The requested record was not found.',
          code: 'RECORD_NOT_FOUND',
        });

      case 'P2003':
        // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid reference. The related record does not exist.',
          code: 'FOREIGN_KEY_VIOLATION',
        });

      case 'P2014':
        // Required relation violation
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Required relation is missing.',
          code: 'REQUIRED_RELATION_MISSING',
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Database Error',
          message: 'A database error occurred.',
          code: err.code,
        });
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid data provided.',
      code: 'VALIDATION_ERROR',
    });
  }

  // Prisma initialization errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection failed.',
      code: 'DB_CONNECTION_ERROR',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token.',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token has expired.',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Default error response
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal Server Error' : 'Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    code: 'ROUTE_NOT_FOUND',
  });
};
