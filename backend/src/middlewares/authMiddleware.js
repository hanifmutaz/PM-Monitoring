// src/middlewares/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const userQueries = require('../sql/userQueries');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    throw AppError.unauthorized('Token tidak ada');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw AppError.unauthorized('Token tidak valid atau expired');
  }

  const user = await userQueries.findUserById(payload.id);

  if (!user || !user.is_active) {
    throw AppError.unauthorized('User tidak ditemukan atau tidak aktif');
  }

  req.user = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role_name,
  };
  next();
});

module.exports = requireAuth;