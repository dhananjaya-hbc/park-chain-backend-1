try {
  const app = require('../src/app');
  module.exports = app;
} catch (error) {
  console.error('CRITICAL: Failed to load Express app:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Failed to load Express app during serverless initialization',
      message: error.message,
      stack: error.stack
    });
  };
}
