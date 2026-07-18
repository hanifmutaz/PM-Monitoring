// src/services/userManagementService.js
//
// CATATAN KRITIS (03_API_SPECIFICATION.md §11 & Development Rules §22):
// "Password di-hash sebelum simpan. Audit log tercatat (tanpa mencatat
// password di old/new value)." Semua path CREATE/UPDATE di file ini
// WAJIB strip password/password_hash sebelum dikirim ke recordAudit().

const bcrypt = require('bcrypt');
const db = require('../config/db');
const userQueries = require('../sql/userQueries');
const { recordAudit } = require('../utils/auditLog');
const AppError = require('../utils/AppError');

const BCRYPT_ROUNDS = 10;

async function listUsers({ role, isActive }) {
  return userQueries.findAll({ role, isActive });
}

async function createUser(data, actorUserId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const roleOk = await userQueries.roleExists(data.role_id, client);
    if (!roleOk) {
      throw AppError.badRequest('Validasi gagal', { role_id: 'Role tidak ditemukan' });
    }

    const exists = await userQueries.usernameExists(data.username, client);
    if (exists) {
      throw AppError.badRequest('Validasi gagal', { username: 'Username sudah dipakai' });
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const created = await userQueries.createUser(
      { username: data.username, passwordHash, fullName: data.full_name, roleId: data.role_id },
      client
    );

    // created dari RETURNING sudah TIDAK mengandung password_hash (lihat
    // userQueries.createUser) - aman langsung dipakai sebagai newValue.
    await recordAudit(
      { tableName: 'users', recordId: created.id, action: 'CREATE', oldValue: null, newValue: created, userId: actorUserId },
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

async function updateUser(id, fields, actorUserId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const before = await userQueries.findRawById(id, client);
    if (!before) {
      throw AppError.notFound('User tidak ditemukan');
    }

    if (fields.role_id !== undefined) {
      const roleOk = await userQueries.roleExists(fields.role_id, client);
      if (!roleOk) {
        throw AppError.badRequest('Validasi gagal', { role_id: 'Role tidak ditemukan' });
      }
    }

    if (fields.username !== undefined && fields.username !== before.username) {
      const exists = await userQueries.usernameExists(fields.username, client);
      if (exists) {
        throw AppError.badRequest('Validasi gagal', { username: 'Username sudah dipakai' });
      }
    }

    const updateFields = { ...fields };
    if (updateFields.password !== undefined) {
      updateFields.password_hash = await bcrypt.hash(updateFields.password, BCRYPT_ROUNDS);
      delete updateFields.password;
    }

    const updated = await userQueries.updateUser(id, updateFields, client);

    // `before` (findRawById) dan `updated` (RETURNING di userQueries.updateUser)
    // sama-sama TIDAK mengandung password_hash — jadi aman dipakai langsung
    // sebagai old_value/new_value tanpa perlu strip manual lagi di sini.
    await recordAudit(
      { tableName: 'users', recordId: id, action: 'UPDATE', oldValue: before, newValue: updated, userId: actorUserId },
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

module.exports = { listUsers, createUser, updateUser };
