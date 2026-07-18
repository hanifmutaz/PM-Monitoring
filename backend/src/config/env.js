// src/config/env.js
require('dotenv').config();

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    // Fail fast saat startup kalau config wajib belum di-set — lebih baik
    // gagal di awal daripada error tak jelas di tengah request.
    throw new Error(`[CONFIG] Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  logLevel: process.env.LOG_LEVEL || 'info',
};
