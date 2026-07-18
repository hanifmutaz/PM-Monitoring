// src/validators/authValidator.js
// Validasi dasar (format) di Controller layer — bukan business logic.

function validateLoginBody(body) {
  const errors = {};

  if (!body || typeof body.username !== 'string' || body.username.trim() === '') {
    errors.username = 'Username wajib diisi';
  }
  if (!body || typeof body.password !== 'string' || body.password === '') {
    errors.password = 'Password wajib diisi';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateLoginBody };
