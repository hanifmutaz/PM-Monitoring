// server.js
const app = require('./app');
const env = require('./src/config/env');
const db = require('./src/config/db');
const logger = require('./src/utils/logger');

async function start() {
  try {
    // Cek koneksi DB saat startup — gagal cepat kalau DB tidak bisa diakses,
    // daripada baru ketahuan saat request pertama masuk.
    await db.query('SELECT 1');
    logger.info('Database connection OK');

    app.listen(env.port, () => {
      logger.info(`PM Monitoring API running on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
