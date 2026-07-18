// src/services/partService.js
const db = require('../config/db');
const partQueries = require('../sql/partQueries');
const { recordAudit } = require('../utils/auditLog');
const AppError = require('../utils/AppError');

async function listParts({ lineId, search, page, limit }) {
  const pageNum = Number(page) > 0 ? Number(page) : 1;
  const limitNum = Number(limit) > 0 ? Number(limit) : 20;
  return partQueries.findAll({ lineId, search, page: pageNum, limit: limitNum });
}

async function createPart(data, userId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const lineOk = await partQueries.lineExists(data.line_id, client);
    if (!lineOk) {
      throw AppError.badRequest('Validasi gagal', { line_id: 'Line tidak ditemukan' });
    }

    const existing = await partQueries.findByLineAndDrawing(data.line_id, data.drawing_no, client);
    if (existing) {
      throw AppError.badRequest('Validasi gagal', { drawing_no: 'Drawing No sudah dipakai di Line ini' });
    }

    const created = await partQueries.create(data, client);

    await recordAudit(
      { tableName: 'parts', recordId: created.id, action: 'CREATE', oldValue: null, newValue: created, userId },
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

async function updatePart(id, fields, userId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const before = await partQueries.findRawById(id, client);
    if (!before) {
      throw AppError.notFound('Part tidak ditemukan');
    }

    const targetLineId = fields.line_id !== undefined ? fields.line_id : before.line_id;
    const targetDrawingNo = fields.drawing_no !== undefined ? fields.drawing_no : before.drawing_no;

    if (fields.line_id !== undefined) {
      const lineOk = await partQueries.lineExists(fields.line_id, client);
      if (!lineOk) {
        throw AppError.badRequest('Validasi gagal', { line_id: 'Line tidak ditemukan' });
      }
    }

    if (fields.line_id !== undefined || fields.drawing_no !== undefined) {
      const existing = await partQueries.findByLineAndDrawing(targetLineId, targetDrawingNo, client);
      if (existing && existing.id !== id) {
        throw AppError.badRequest('Validasi gagal', { drawing_no: 'Drawing No sudah dipakai di Line ini' });
      }
    }

    const updated = await partQueries.update(id, fields, client);

    await recordAudit(
      { tableName: 'parts', recordId: id, action: 'UPDATE', oldValue: before, newValue: updated, userId },
      client
    );

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deletePart(id, userId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const before = await partQueries.findRawById(id, client);
    if (!before) {
      throw AppError.notFound('Part tidak ditemukan');
    }

    const historyCount = await partQueries.countHistoryByPart(id, client);
    if (historyCount > 0) {
      throw AppError.conflict('Part masih memiliki riwayat penggantian, tidak bisa dihapus');
    }

    await partQueries.remove(id, client);

    await recordAudit(
      { tableName: 'parts', recordId: id, action: 'DELETE', oldValue: before, newValue: null, userId },
      client
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listParts, createPart, updatePart, deletePart };
