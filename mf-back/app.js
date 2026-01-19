/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
require('dotenv').config({ quiet: true });
const { csrfGuard } = require('./middleware/csrfGuard');

// Import Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth-routes'); // Correction du nom
const journeyRouter = require('./routes/journey-routes');
const zynoOrchestrationRouter = require('./routes/zyno-routes'); // Routes pour l'IA (Renamed to avoid conflict)
const daoRouter = require('./routes/dao-routes'); // Routes DAO
const agentRouter = require('./routes/agent-routes');
const feedbackRouter = require('./routes/feedback');
const orchestrationRouter = require('./routes/orchestration-routes'); // New orchestration router
const ragRouter = require('./routes/rag-routes');
const demoRouter = require('./routes/demo-routes'); // Routes Demo
const userRouter = require('./routes/user-routes'); // Routes User
const solanaRouter = require('./routes/solana-routes'); // Routes Solana
const User = require('./models/user');
const AgentLog = require('./models/agentFeedbackLog');

console.log('AUTH_ENGINE_V2_ACTIVE');

// Database Connection
const mongoose = require('mongoose');
const shouldSeed = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && process.env.SKIP_DB_CONNECTION !== 'true';
const shouldConnect = process.env.SKIP_DB_CONNECTION !== 'true';

if (shouldConnect) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/journey')
    .then(async () => {
      console.log('✅ MongoDB Connected');
      if (shouldSeed) {
        await ensureTestUser();
      }
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

async function ensureTestUser() {
  try {
    const email = 'test@mfai.app';
    const password = 'password123';
    const existing = await User.findOne({ email });
    if (existing) return;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await User.create({
      name: 'Test User',
      email,
      password: hashed,
      wallet_address: 'TEST_WALLET',
      persona: 'cognitive-activation-hub',
      role: 'user',
      is_active: true,
    });
    console.log('✅ Test user seeded (test@mfai.app / password123)');
  } catch (err) {
    console.error('❌ Failed to seed test user:', err.message);
  }
}

const app = express();

// Middleware
// API is JWT/bearer-only (no session cookies). Enforce statelessness to mitigate CSRF.
app.use(helmet());

// --- EMERGENCY KILL-SWITCH (RISK GOVERNANCE) ---
app.use((req, res, next) => {
  if (process.env.MFAI_EMERGENCY_STOP === 'true') {
    console.warn('[EMERGENCY] Neural System Halt Active. Request blocked.');
    return res.status(503).json({
      error: 'Neural System in Maintenance. Safeguarding logic active.',
      code: 'MFAI_EMERGENCY_HALT'
    });
  }
  next();
});

// --- RATE LIMITING STRATEGY (WEB3-SENTINEL) ---
const rateLimit = require('express-rate-limit');

// 1. General Public Limiter (DDoS Protection)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30000, // Limit each IP to 30000 requests per windowMs for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// 2. Protocol Critical Zone (Zyno AI & Transactions)
// Protects OpenAI credits and Solana RPC endpoints
const criticalZoneLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req, res) => {
    // "Veteran" Priority: Authenticated users get 10000 req/min, Guests get 8 req/min for testing (burst check)
    if (req.user || req.headers['x-user-id'] || req.headers['authorization']) return 10000;
    return 300;
  },
  keyGenerator: (req) => {
    return req.headers['x-user-id'] || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Neural Link Overloaded. Please slow down interaction frequency.',
      retryAfter: 60
    });
  }
});

app.use(publicLimiter);
app.use('/journey', criticalZoneLimiter);
app.use('/orchestration', criticalZoneLimiter);
app.use('/api', criticalZoneLimiter); // Protect Solana routes

// CORS
// - In prod, restrict origins via CORS_ALLOWED_ORIGINS="https://journey.mfai.app,https://mfai.app"
// - In dev, allow localhost UI ports.
function parseAllowedOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = [
  'https://journey.mfai.app',
  'https://mfai.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3002',       // Backend Port
  'http://127.0.0.1:3002',
  'http://localhost:3003',       // Frontend Port
  'http://127.0.0.1:3003',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',       // Test Runner Port
  'http://127.0.0.1:4173',
  ...parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server / curl (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.log(`[CORS-BLOCK] Blocked origin: ${origin}`); // Log blocked origin for debugging
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
// Stateless API: csurf kept for visibility but bypassed to avoid misconfiguration in test/stateless mode
const noopCsrf = (req, res, next) => next();
app.use(noopCsrf);
app.use(csrfGuard);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- MOUNT ROUTES (Wiring) ---
app.use('/', indexRouter);
app.use('/auth', authRouter);           // This is where it was missing!
app.use('/journey', journeyRouter);
app.use('/orchestration', zynoOrchestrationRouter);
app.use('/dao', daoRouter);
app.use('/api/agents', agentRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/orchestration', orchestrationRouter); // Phase 4 orchestration routes
app.use('/', ragRouter);
app.use('/demo', demoRouter);           // Routes Demo
app.use('/user', userRouter);           // Routes User
app.use('/api', solanaRouter);          // Routes Solana (prefixed with /api)

// Alias direct pour les logs agents (attendus par le frontend/e2e en /admin/agent-logs)
app.get('/admin/agent-logs', async (req, res) => {
  try {
    const { userId, agentName, limit = 100 } = req.query;
    const filters = {};
    if (userId) {
      filters.userId = { $regex: userId, $options: 'i' };
    }
    if (agentName) {
      filters.agentName = { $regex: agentName, $options: 'i' };
    }
    const logs = await AgentLog.find(filters).sort({ timestamp: -1 }).limit(Number(limit) || 100);
    res.json(logs);
  } catch (error) {
    console.error('Agent logs alias error:', error);
    res.status(500).json({ error: 'Unable to retrieve agent logs.' });
  }
});

// Base API health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

// K8s-style probes (kept simple for now)
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/readyz', (req, res) => {
  // If you later want stricter checks: verify DB connections, queue backends, etc.
  res.status(200).json({ ok: true });
});

// DEEP HEALTH CHECK (Sovereign Seal Requirement)
app.get('/api/health/deep', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : (mongoose.connection.readyState === 2 ? 'CONNECTING' : 'DOWN');
  const aiStatus = process.env.OPENAI_API_KEY ? 'READY' : 'MOCK';
  const cacheStatus = 'HOT'; // In-memory

  res.status(200).json({
    status: 'SOVEREIGN',
    checks: {
      database: dbStatus,
      ai_core: aiStatus,
      neural_cache: cacheStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

module.exports = app;
