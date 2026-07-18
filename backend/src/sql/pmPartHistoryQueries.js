// src/sql/pmPartHistoryQueries.js
const db = require('../config/db');

const LIST_SELECT = `
  SELECT
    h.id, h.part_id, p.line_id, l.line_name, p.drawing_no, p.part_name,
    h.tgl_ganti, h.shift, h.counter_saat_diganti, h.jenis_penggantian, h.remark,
    h.user_id, u.full_name AS user_full_name, h.created_at
  FROM pm_part_history h
  JOIN parts p ON p.id = h.part_id
  JOIN lines l ON l.id = p.line_id
  JOIN users u ON u.id = h.user_id
`;

async function findAll({ lineId, partId, jenis, dateFrom, dateTo, page = 1, limit = 20 } = {}, runner = db) {
  const conditions = [];
  const params = [];

  if (lineId) {
    params.push(lineId);
    conditions.push(`p.line_id = $${params.length}`);
  }
  if (partId) {
    params.push(partId);
    conditions.push(`h.part_id = $${params.length}`);
  }
  if (jenis) {
    params.push(jenis);
    conditions.push(`h.jenis_penggantian = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`h.tgl_ganti >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`h.tgl_ganti <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const itemsResult = await runner.query(
    `${LIST_SELECT} ${where} ORDER BY h.tgl_ganti DESC, h.id DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`,
    [...params, limit, offset]
  );

  const countResult = await runner.query(
    `SELECT COUNT(*)::int AS total FROM pm_part_history h JOIN parts p ON p.id = h.part_id ${where}`,
    params
  );

  return { items: itemsResult.rows, total: countResult.rows[0].total, page, limit };
}

async function partExists(partId, runner = db) {
  const result = await runner.query(`SELECT id FROM parts WHERE id = $1`, [partId]);
  return !!result.rows[0];
}

async function create(data, runner = db) {
  const result = await runner.query(
    `INSERT INTO pm_part_history (part_id, tgl_ganti, shift, counter_saat_diganti, jenis_penggantian, remark, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, part_id, tgl_ganti, shift, counter_saat_diganti, jenis_penggantian, remark, user_id, created_at`,
    [data.part_id, data.tgl_ganti, data.shift ?? null, data.counter_saat_diganti, data.jenis_penggantian, data.remark ?? null, data.user_id]
  );
  return result.rows[0];
}

module.exports = { findAll, partExists, create };
