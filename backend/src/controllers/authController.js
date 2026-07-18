// src/controllers/authController.js
const authService = require('../services/authService');
const { validateLoginBody } = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const COOKIE_NAME = 'token';

// Secure flag butuh HTTPS aktif. Di production (NGINX+Tailscale) selalu HTTPS,
// di local dev (http://localhost) Secure harus off supaya cookie kebaca browser.
// Ini bukan deviasi dari keputusan dokumen (httpOnly + SameSite=Strict tetap
// dipertahankan) — cuma penyesuaian environment dev vs prod yang lazim.
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000, // 8 jam, selaras dengan JWT_EXPIRES_IN default
  };
}

const login = asyncHandler(async (req, res) => {
  const { valid, errors } = validateLoginBody(req.body);
  if (!valid) {
    throw AppError.badRequest('Validasi gagal', errors);
  }

  const { username, password } = req.body;
  const { token, user } = await authService.login(username, password);

  res.cookie(COOKIE_NAME, token, cookieOptions());

  res.status(200).json({
    success: true,
    message: 'Success',
    data: { token, user },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.status(200).json({ success: true, message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({ success: true, message: 'Success', data: user });
});

module.exports = { login, logout, me };
