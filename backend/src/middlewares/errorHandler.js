// src/middlewares/errorHandler.js
const logger = require('../utils/logger');

/**
 * Global Error Handler (Express 4-arg middleware). Semua error dari
 * controller/service (lewat asyncHandler -> next(err)) berakhir di sini.
 * Development Rules §15: tidak boleh try/catch + res.send() manual
 * tersebar di tiap controller.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);
  }

  const response = {
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : err.message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan` });
}

module.exports = { errorHandler, notFoundHandler };
