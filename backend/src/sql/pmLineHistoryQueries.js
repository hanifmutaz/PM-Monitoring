// src/sql/pmLineHistoryQueries.js
const db = require('../config/db');

const LIST_SELECT = `
  SELECT h.id, h.line_id, l.line_name, h.tgl_input, h.jenis_pm, h.keterangan,
         h.user_id, u.full_name AS user_full_name, h.created_at
  FROM pm_monthly_history h
  JOIN lines l ON l.id = h.line_id
  JOIN users u ON u.id = h.user_id
`;

async function findAll({ lineId, jenis, dateFrom, dateTo, page = 1, limit = 20 } = {}, runner = db) {
  const conditions = [];
  const params = [];

  if (lineId) {
    params.push(lineId);
    conditions.push(`h.line_id = $${params.length}`);
  }
  if (jenis) {
    params.push(jenis);
    conditions.push(`h.jenis_pm = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`h.tgl_input >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`h.tgl_input <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const itemsResult = await runner.query(
    `${LIST_SELECT} ${where} ORDER BY h.tgl_input DESC, h.id DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`,
    [...params, limit, offset]
  );
  const countResult = await runner.query(
    `SELECT COUNT(*)::int AS total FROM pm_monthly_history h ${where}`,
    params
  );

  return { items: itemsResult.rows, total: countResult.rows[0].total, page, limit };
}

async function create(data, runner = db) {
  const result = await runner.query(
    `INSERT INTO pm_monthly_history (line_id, tgl_input, jenis_pm, keterangan, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, line_id, tgl_input, jenis_pm, keterangan, user_id, created_at`,
    [data.line_id, data.tgl_input, data.jenis_pm, data.keterangan ?? null, data.user_id]
  );
  return result.rows[0];
}

module.exports = { findAll, create };
