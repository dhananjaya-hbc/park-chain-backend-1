// secrets.js
// Loads environment variables and exports them
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  XRPL_NETWORK: process.env.XRPL_NETWORK,
  ADMIN_WALLET_SEED: process.env.ADMIN_WALLET_SEED,
  ADMIN_WALLET_ADDRESS: process.env.ADMIN_WALLET_ADDRESS,
  ADMIN_COMMISSION_PERCENT: parseInt(process.env.ADMIN_COMMISSION_PERCENT) || 20,
  SELLER_SHARE_PERCENT: parseInt(process.env.SELLER_SHARE_PERCENT) || 80,
};