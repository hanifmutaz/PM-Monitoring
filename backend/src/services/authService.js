// src/services/authService.js
const bcrypt = require('bcrypt');
const userQueries = require('../sql/userQueries');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Login: validasi kredensial, update last_login, generate JWT.
 * Tidak membedakan pesan error "user tidak ada" vs "password salah"
 * ke client (mencegah user enumeration) — sesuai respons 400 generik
 * di 03_API_SPECIFICATION.md §1.
 */
async function login(username, password) {
  const user = await userQueries.findActiveUserByUsername(username);
  if (!user) {
    throw AppError.badRequest('Username atau password salah');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw AppError.badRequest('Username atau password salah');
  }

  await userQueries.updateLastLogin(user.id);

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

module.exports = { login, getMe };
