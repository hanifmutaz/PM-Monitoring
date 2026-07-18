// src/sql/dashboardQueries.js
const db = require('../config/db');

async function countAllParts(runner = db) {
  const result = await runner.query(`SELECT COUNT(*)::int AS count FROM parts`);
  return result.rows[0].count;
}

async function countActiveLines(runner = db) {
  const result = await runner.query(`SELECT COUNT(*)::int AS count FROM lines WHERE is_active = TRUE`);
  return result.rows[0].count;
}

/**
 * Status sync production_cache terakhir. Karena Adapter Sync ConMas
 * (MASTER DOCUMENT Fase 3) belum dibangun (lihat catatan blocker di
 * pmLineService.js / pmPartService.js), tidak ada log job terpisah untuk
 * sync ini — satu-satunya jejak yang tersedia adalah kolom `synced_at` di
 * production_cache sendiri. Endpoint ini baca apa adanya dari situ; begitu
 * job sync beneran ada, hasilnya otomatis ikut akurat tanpa perlu ubah query.
 */
async function getLastSyncInfo(runner = db) {
  const result = await runner.query(
    `SELECT
       MAX(synced_at) AS last_synced_at,
       (SELECT COUNT(*)::int FROM production_cache WHERE synced_at = (SELECT MAX(synced_at) FROM production_cache)) AS rows_synced
     FROM production_cache`
  );
  return result.rows[0];
}

module.exports = { countAllParts, countActiveLines, getLastSyncInfo };
