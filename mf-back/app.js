const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({
  quiet: true
});
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user-routes');
const coursRoutes = require('./routes/cours-routes');
const journey = require('./routes/journey-routes');
const analyticsRoutes = require('./routes/analytics-routes');
const zynoRoutes = require('./routes/zyno-routes');
const ragRoutes = require('./routes/rag-routes');
const exportRoutes = require('./routes/export-routes');
const daoRoutes = require('./routes/dao-routes');
const feedbackRoutes = require('./routes/feedback');
const app = express();

const shouldSkipDbConnection = process.env.SKIP_DB_CONNECTION === 'true';
const MONGO_URI = process.env.MONGO_URI;

if (!shouldSkipDbConnection) {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  mongoose.connect(MONGO_URI)
    .then(() => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('✅ MongoDB Connected - Database is ready');
      }
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173'
]

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-api-key', 'X-API-KEY']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user', userRouter);
app.use('/cours', coursRoutes);
app.use('/journey', journey);
app.use('/analytics', analyticsRoutes);
app.use('/', zynoRoutes);
app.use('/', ragRoutes);
app.use('/', exportRoutes);
app.use('/', daoRoutes);
app.use('/api/feedback', feedbackRoutes);

// Auth verification route
app.get('/auth/verify', (req, res) => {
  res.status(200).json({ message: 'Auth verification endpoint' });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
