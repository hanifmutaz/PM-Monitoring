// src/services/authService.js
const bcrypt = require('bcrypt');
const userQueries = require('../sql/userQueries');
const loginAuditQueries = require('../sql/loginAuditQueries');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

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

module.exports = { login, logout, getMe };