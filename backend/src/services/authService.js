// src/services/authService.js
const bcrypt = require('bcrypt');
const db = require('../config/db');
const userQueries = require('../sql/userQueries');
const loginAuditQueries = require('../sql/loginAuditQueries');
const { signToken } = require('../utils/jwt');
const { validatePassword } = require('../utils/passwordPolicy');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 10;

async function logLoginEvent(eventType, usernameAttempted, userId, context = {}) {
  try {
    await loginAuditQueries.recordLoginEvent({
      eventType,
      usernameAttempted,
      userId,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  } catch (err) {
    logger.error('Gagal mencatat login_audit_log', err);
  }
}

/**
 * @param {string} username
 * @param {string} password
 * @param {{ ip?: string, userAgent?: string }} context - metadata request untuk audit log
 */
async function login(username, password, context = {}) {
  const user = await userQueries.findByUsernameAnyStatus(username);

  if (!user) {
    await logLoginEvent('LOGIN_FAILED_USER_NOT_FOUND', username, null, context);
    throw AppError.badRequest('Username atau password salah');
  }

  if (!user.is_active) {
    await logLoginEvent('LOGIN_FAILED_ACCOUNT_DISABLED', username, user.id, context);
    throw AppError.badRequest('Username atau password salah');
  }

  // Status PENDING/REJECTED di-block TOTAL - dicek SEBELUM password
  // diverifikasi (tidak perlu bcrypt.compare kalau akun memang belum/tidak
  // boleh login). Pesan ke CLIENT tetap generik, konsisten dengan pola
  // LOGIN_FAILED_ACCOUNT_DISABLED di atas - tidak membocorkan status akun
  // ke siapa pun yang menebak username orang lain.
  if (user.status === 'PENDING') {
    await logLoginEvent('LOGIN_FAILED_PENDING_APPROVAL', username, user.id, context);
    throw AppError.badRequest('Username atau password salah');
  }
  if (user.status === 'REJECTED') {
    await logLoginEvent('LOGIN_FAILED_REJECTED', username, user.id, context);
    throw AppError.badRequest('Username atau password salah');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    await logLoginEvent('LOGIN_FAILED_INVALID_PASSWORD', username, user.id, context);
    throw AppError.badRequest('Username atau password salah');
  }

  await userQueries.updateLastLogin(user.id);
  await logLoginEvent('LOGIN_SUCCESS', username, user.id, context);

  const userPayload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role_name,
  };

  const token = signToken(userPayload);

  return { token, user: userPayload };
}

/**
 * Self-registration (Q1-Q11 diskusi User Approval): akun baru dibuat dengan
 * status PENDING & role_id NULL - TIDAK langsung bisa login, TIDAK dapat
 * token. Harus di-approve Admin dulu (assign role) lewat User Management
 * sebelum bisa login normal.
 */
async function register({ username, password, full_name, email }) {
  const { valid, error } = validatePassword(password, username);
  if (!valid) {
    throw AppError.badRequest('Validasi gagal', { password: error });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const exists = await userQueries.usernameExists(username, client);
    if (exists) {
      throw AppError.badRequest('Validasi gagal', { username: 'Username sudah dipakai' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const created = await userQueries.createUser(
      { username, passwordHash, fullName: full_name, roleId: null, email, status: 'PENDING' },
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

/**
 * Logout: tidak ada state server-side yang perlu dihapus selain cookie
 * (dilakukan di controller), tapi tetap dicatat untuk audit trail sesi.
 */
async function logout(username, userId, context = {}) {
  await logLoginEvent('LOGOUT', username, userId, context);
}

/**
 * GET /auth/me — ambil data user yang sedang login berdasarkan req.user (dari JWT).
 */
async function getMe(userId) {
  const user = await userQueries.findUserById(userId);
  if (!user || !user.is_active) {
    throw AppError.unauthorized('User tidak ditemukan atau tidak aktif');
  }

  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role_name,
  };
}

module.exports = { login, register, logout, getMe };