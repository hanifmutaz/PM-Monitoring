// src/middlewares/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Semua endpoint kecuali /auth/login wajib lewat middleware ini
 * (03_API_SPECIFICATION.md - "Semua endpoint (kecuali login) wajib
 * melalui middleware auth + role check").
 *
 * Token dibaca dari httpOnly cookie `token` (keputusan JWT storage di
 * 06_ENVIRONMENT_AND_BOOTSTRAP.md §3), bukan header Authorization —
 * karena frontend tidak menyimpan/mengirim token secara manual.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    throw AppError.unauthorized('Token tidak ada');
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, username, role }
    next();
  } catch (err) {
    throw AppError.unauthorized('Token tidak valid atau expired');
  }
});

module.exports = requireAuth;
