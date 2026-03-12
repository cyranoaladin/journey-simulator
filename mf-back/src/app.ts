/**
 * MFAI Backend - Main Application Entry Point
 * TypeScript/Prisma Professional Architecture
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDatabase, prisma } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';
import agentRoutes from './routes/agent.routes';
import journeyRoutes from './routes/journey.routes';
import neuralNexusRoutes from './routes/neuralNexus.routes';
import orchestrationRoutes from './routes/orchestration.routes';
import marketRoutes from './routes/market.routes';
import zynoStreamRoutes from './routes/zyno-stream.routes';
import cnftRoutes from './routes/cnft.routes';
import splTokenRoutes from './routes/splToken.routes';
import blinksRoutes from './routes/blinks.routes';
import solanaRoutes from './routes/solana.routes';
import daoRoutes from './routes/dao.routes';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/', indexRoutes);
app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/journey', journeyRoutes);
app.use('/neural-nexus', neuralNexusRoutes);
app.use('/resources', neuralNexusRoutes);  // Alias pour /resources/rag
app.use('/api/orchestration', orchestrationRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/zyno', zynoStreamRoutes);
app.use('/api/cnft', cnftRoutes);
app.use('/api/token', splTokenRoutes);
app.use('/api/blinks', blinksRoutes);
app.use('/solana/mint', solanaRoutes);
app.use('/dao', daoRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

export async function startServer(): Promise<void> {
  const PORT = parseInt(process.env.PORT || '3002', 10);
  try {
    await connectDatabase();

    // Seed test user in non-production
    if (process.env.NODE_ENV !== 'production') {
      try {
        const testUser = await prisma.user.findFirst({ where: { email: 'test@mfai.app' } });
        if (!testUser) {
          await prisma.user.create({
            data: {
              name: 'Test User',
              email: 'test@mfai.app',
              walletAddress: 'TestWallet123',
              role: 'FOUNDER',
            },
          });
          console.log('✅ Test user seeded (test@mfai.app)');
        }
      } catch (e) {
        console.log('Test user already exists or seed skipped');
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}
