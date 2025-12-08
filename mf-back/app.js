const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth-routes'); // Correction du nom
const journeyRouter = require('./routes/journey-routes');
const orchestrationRouter = require('./routes/zyno-routes'); // Routes pour l'IA
const daoRouter = require('./routes/dao-routes'); // Routes DAO

// Database Connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/journey')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const app = express();

// Middleware
app.use(helmet());
app.use(cors()); // En production, restreindre l'origine si possible
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

// Base API health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
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
