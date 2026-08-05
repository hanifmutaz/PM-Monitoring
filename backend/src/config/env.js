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

  // Kredensial DB ConMas TIDAK di-require saat startup (§REQUIRED_VARS) -
  // supaya app tetap bisa jalan buat development/testing walau ConMas
  // belum/gak bisa diakses. Sync job (src/jobs/conmasSyncJob.js) yang
  // handle kalau kredensial ini kosong/salah, bukan bikin seluruh app crash.
  conmas: {
    host: process.env.CONMAS_DB_HOST,
    port: parseInt(process.env.CONMAS_DB_PORT, 10) || 5432,
    database: process.env.CONMAS_DB_NAME,
    user: process.env.CONMAS_DB_USER,
    password: process.env.CONMAS_DB_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  // Kredensial SMTP TIDAK di-require saat startup (§REQUIRED_VARS) - sama
  // filosofi dengan ConMas: app tetap jalan walau SMTP belum dikonfigurasi.
  // notificationService yang handle kalau config ini kosong (log warning,
  // skip pengiriman) - bukan bikin seluruh app crash.
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'PM Monitoring <no-reply@hirose.local>',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  logLevel: process.env.LOG_LEVEL || 'info',
};
