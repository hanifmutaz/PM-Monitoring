// src/utils/logger.js
// Logger minimal, tanpa dependency tambahan (YAGNI — cukup untuk kebutuhan
// saat ini, bisa diganti winston/pino kalau kebutuhan bertambah).

const LEVELS = { error: 0, warn: 1, info: 2 };
const env = require('../config/env');

const currentLevel = LEVELS[env.logLevel] ?? LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function info(message, meta) {
  if (currentLevel >= LEVELS.info) {
    console.log(`[INFO]  ${timestamp()} ${message}`, meta !== undefined ? meta : '');
  }
}

function warn(message, meta) {
  if (currentLevel >= LEVELS.warn) {
    console.warn(`[WARN]  ${timestamp()} ${message}`, meta !== undefined ? meta : '');
  }
}

function error(message, err) {
  if (currentLevel >= LEVELS.error) {
    console.error(`[ERROR] ${timestamp()} ${message}`, err && err.stack ? err.stack : err || '');
  }
}

module.exports = { info, warn, error };
