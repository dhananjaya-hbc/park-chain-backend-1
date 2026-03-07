// src/config/db.js
// PostgreSQL connection using Neon serverless PostgreSQL
const { Pool } = require('pg');
const secrets = require('../../secrets');

const pool = new Pool({
  connectionString: secrets.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 20,                     // Max connections in pool
  idleTimeoutMillis: 30000,    // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
});

// Test the connection when this module loads
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Helper: run a single query
const query = (text, params) => pool.query(text, params);

// Helper: get a client from the pool (for transactions)
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };