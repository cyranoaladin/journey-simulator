const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ quiet: true });

// Import Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth-routes'); // Correction du nom
const journeyRouter = require('./routes/journey-routes');
const orchestrationRouter = require('./routes/zyno-routes'); // Routes pour l'IA
const daoRouter = require('./routes/dao-routes'); // Routes DAO
const ragRouter = require('./routes/rag-routes');
const demoRouter = require('./routes/demo-routes'); // Routes Demo
const userRouter = require('./routes/user-routes'); // Routes User

// Database Connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/journey')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const app = express();

// Middleware
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
  'http://localhost:3003',
  'http://127.0.0.1:3003',
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
app.use('/', ragRouter);
app.use('/demo', demoRouter);           // Routes Demo
app.use('/user', userRouter);           // Routes User

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
