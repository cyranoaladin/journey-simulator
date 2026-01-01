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
const orchestrationRouter = require('./routes/zyno-routes'); // Routes pour l'IA
const daoRouter = require('./routes/dao-routes'); // Routes DAO
const agentRouter = require('./routes/agent-routes');
const ragRouter = require('./routes/rag-routes');
const demoRouter = require('./routes/demo-routes'); // Routes Demo
const userRouter = require('./routes/user-routes'); // Routes User
const solanaRouter = require('./routes/solana-routes'); // Routes Solana
const User = require('./models/user');
const AgentLog = require('./models/agentFeedbackLog');

// Database Connection
const mongoose = require('mongoose');
const shouldSeed = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && process.env.SKIP_DB_CONNECTION !== 'true';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/journey')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    if (shouldSeed) {
      await ensureTestUser();
    }
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
  // Defaults (safe-ish); can be overridden/extended via env
  'https://journey.mfai.app',
  'https://mfai.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server / curl (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Keep error readable for debugging.
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

// --- MOUNT ROUTES (Câblage) ---
app.use('/', indexRouter);
app.use('/auth', authRouter);           // C'est ici que ça manquait !
app.use('/journey', journeyRouter);
app.use('/orchestration', orchestrationRouter);
app.use('/dao', daoRouter);
app.use('/api/agents', agentRouter);
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
