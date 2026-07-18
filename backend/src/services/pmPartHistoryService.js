// src/services/pmPartHistoryService.js
//
// Efek "update tgl_pasang_terakhir pada parts terkait" (03_API_SPECIFICATION.md
// §7) TIDAK butuh UPDATE eksplisit ke kolom `parts` — karena skema final
// (04_DATABASE_SCHEMA.sql + query kunci Master Document Bagian 3) menghitung
// "Tgl Pasang Terakhir" secara live lewat MAX(tgl_ganti) dari pm_part_history,
// bukan kolom cache terpisah. Insert row baru ke pm_part_history SUDAH CUKUP
// untuk membuat efek itu terjadi otomatis di query PM Part berikutnya.

const db = require('../config/db');
const pmPartHistoryQueries = require('../sql/pmPartHistoryQueries');
const { recordAudit } = require('../utils/auditLog');
const AppError = require('../utils/AppError');

async function listHistory({ lineId, partId, jenis, dateFrom, dateTo, page, limit }) {
  const pageNum = Number(page) > 0 ? Number(page) : 1;
  const limitNum = Number(limit) > 0 ? Number(limit) : 20;
  return pmPartHistoryQueries.findAll({ lineId, partId, jenis, dateFrom, dateTo, page: pageNum, limit: limitNum });
}

async function createHistory(data, userId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const partOk = await pmPartHistoryQueries.partExists(data.part_id, client);
    if (!partOk) {
      throw AppError.badRequest('Validasi gagal', { part_id: 'Part tidak ditemukan' });
    }

    const created = await pmPartHistoryQueries.create({ ...data, user_id: userId }, client);

    await recordAudit(
      {
        tableName: 'pm_part_history',
        recordId: created.id,
        action: 'CREATE',
        oldValue: null,
        newValue: created,
        userId,
      },
      client
    );

    await client.query('COMMIT');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listHistory, createHistory };
