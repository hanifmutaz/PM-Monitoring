// src/utils/auditLog.js
//
// Helper pencatatan audit_log, dipanggil dari Service layer (BUKAN
// controller, BUKAN trigger DB) — sesuai 02_DEVELOPMENT_RULES.md §22.
//
// Tabel yang WAJIB pakai recordAudit() saat CREATE/UPDATE/DELETE:
//   - Master Data: lines, parts, part_cl_mapping
//   - app_settings
//   - users (kecuali field password tidak boleh masuk old_value/new_value)
//   - History PM: pm_part_history, pm_monthly_history
//
// Dipakai mulai Fase 5 (Master Data) dan seterusnya. Diletakkan di Fase 1
// karena ini infrastruktur bersama yang dipakai banyak Service.

const db = require('../config/db');

/**
 * @param {object} params
 * @param {string} params.tableName
 * @param {number|null} params.recordId
 * @param {'CREATE'|'UPDATE'|'DELETE'} params.action
 * @param {object|null} [params.oldValue]
 * @param {object|null} [params.newValue]
 * @param {number|null} params.userId
 * @param {import('pg').PoolClient} [client] - opsional, kalau dipanggil dalam transaksi
 */
async function recordAudit(params, client) {
  const { tableName, recordId, action, oldValue = null, newValue = null, userId } = params;

  const runner = client || db;

  await runner.query(
    `INSERT INTO audit_log (table_name, record_id, action, old_value, new_value, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      tableName,
      recordId,
      action,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      userId,
    ]
  );
}

module.exports = { recordAudit };
