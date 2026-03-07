// index.js
// Entry point - starts the Express server
const app = require('./src/app');
const secrets = require('./secrets');
const { pool } = require('./src/config/db');

const startServer = async () => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('📦 Database time:', result.rows[0].now);

    // Start server
    app.listen(secrets.PORT, () => {
      console.log(`🚀 Server running on port ${secrets.PORT}`);
      console.log(`📍 Environment: ${secrets.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();