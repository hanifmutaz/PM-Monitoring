// src/services/pmLineHistoryService.js
//
// Reset rule MASTER DOCUMENT Bagian 2.D — TIDAK DIUBAH:
//   jenis_pm = MONTHLY -> update tgl_pm_monthly_terakhir, DAN (jika
//              auto_reset_weekly_on_monthly efektif = true) update juga
//              tgl_pm_weekly_terakhir.
//   jenis_pm = WEEKLY  -> update tgl_pm_weekly_terakhir SAJA.
//
// "auto_reset_weekly_on_monthly efektif" mengikuti deviasi terdokumentasi
// yang sudah disetujui: override per-Line (lines.auto_reset_weekly_on_monthly)
// kalau di-set eksplisit (bukan NULL), fallback ke setting global di
// app_settings kalau NULL.
//
// akumulasi_poin_monthly di-reset ke 0 saat PM Monthly baru dieksekusi,
// karena basis perhitungannya "akumulasi poin SEJAK Tgl PM Monthly
// Terakhir" (Bagian 2.B) — begitu tanggal terakhir berubah ke hari ini,
// akumulasi dari baseline baru itu otomatis mulai dari 0.

const db = require('../config/db');
const pmLineQueries = require('../sql/pmLineQueries');
const pmLineHistoryQueries = require('../sql/pmLineHistoryQueries');
const settingsService = require('./settingsService');
const { recordAudit } = require('../utils/auditLog');
const AppError = require('../utils/AppError');

/**
 * Fungsi MURNI (tanpa DB) yang implementasikan reset rule Bagian 2.D —
 * dipisah dari submitPmLineHistory() supaya bisa di-unit-test langsung
 * (06_ENVIRONMENT_AND_BOOTSTRAP.md §5: "wajib ditest ... reset rule
 * Monthly -> Weekly, termasuk kondisi toggle on/off").
 *
 * @param {'MONTHLY'|'WEEKLY'} jenisPm
 * @param {string} tglInput - 'YYYY-MM-DD'
 * @param {boolean|null|undefined} lineOverride - lines.auto_reset_weekly_on_monthly
 * @param {boolean} globalDefault - app_settings.auto_reset_weekly_on_monthly
 * @returns {object} field yang harus di-UPDATE ke pm_monthly_helper
 */
function determineHelperUpdate(jenisPm, tglInput, lineOverride, globalDefault) {
  if (jenisPm === 'WEEKLY') {
    return { tgl_pm_weekly_terakhir: tglInput };
  }

  // MONTHLY
  const effectiveAutoReset =
    lineOverride !== null && lineOverride !== undefined ? lineOverride : globalDefault === true;

  const fields = {
    tgl_pm_monthly_terakhir: tglInput,
    akumulasi_poin_monthly: 0,
  };
  if (effectiveAutoReset) {
    fields.tgl_pm_weekly_terakhir = tglInput;
  }
  return fields;
}

async function listPmLineHistory({ lineId, jenis, dateFrom, dateTo, page, limit }) {
  const pageNum = Number(page) > 0 ? Number(page) : 1;
  const limitNum = Number(limit) > 0 ? Number(limit) : 20;
  return pmLineHistoryQueries.findAll({ lineId, jenis, dateFrom, dateTo, page: pageNum, limit: limitNum });
}

async function submitPmLineHistory(data, userId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const line = await pmLineQueries.findLineById(data.line_id, client);
    if (!line) {
      throw AppError.badRequest('Validasi gagal', { line_id: 'Line tidak ditemukan' });
    }

    await pmLineQueries.ensureHelperExists(data.line_id, client);

    const globalDefault = await settingsService.getSetting('auto_reset_weekly_on_monthly');
    const helperUpdateFields = determineHelperUpdate(
      data.jenis_pm,
      data.tgl_input,
      line.auto_reset_weekly_on_monthly,
      globalDefault
    );

    await pmLineQueries.updateHelper(data.line_id, helperUpdateFields, client);

    const createdHistory = await pmLineHistoryQueries.create({ ...data, user_id: userId }, client);

    // Audit untuk history PM Line (wajib - Development Rules §22). Efek reset
    // ke pm_monthly_helper TIDAK diaudit terpisah — tabel itu bukan bagian
    // dari daftar wajib audit §22 (lines/parts/part_cl_mapping/app_settings/
    // users/pm_part_history/pm_monthly_history saja); perubahan pada
    // pm_monthly_helper sudah cukup terlacak lewat row pm_monthly_history ini.
    await recordAudit(
      {
        tableName: 'pm_monthly_history',
        recordId: createdHistory.id,
        action: 'CREATE',
        oldValue: null,
        newValue: createdHistory,
        userId,
      },
      client
    );

    await client.query('COMMIT');
    return createdHistory;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listPmLineHistory, submitPmLineHistory, determineHelperUpdate };
