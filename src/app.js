// src/app.js
// Express application setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --------------- Middleware ---------------
app.use(helmet());                    // Security headers
app.use(cors());                       // Allow cross-origin requests
app.use(morgan('dev'));                // Request logging
app.use(express.json());              // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// --------------- Health Check ---------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Routes (will add in later commits) ---------------
// app.use('/api/auth', require('./routes/AuthRoutes'));
// app.use('/api/spots', require('./routes/SpotRoutes'));
// app.use('/api/bookings', require('./routes/BookingRoutes'));
// app.use('/api/payments', require('./routes/Web3Routes'));
// app.use('/api/users', require('./routes/UserRoutes'));

// --------------- Error Handling ---------------
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;