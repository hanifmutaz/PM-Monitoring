// src/validators/userValidator.js

function validateCreateUser(body) {
  const errors = {};

  if (!body || typeof body.username !== 'string' || body.username.trim() === '') {
    errors.username = 'Username wajib diisi';
  } else if (body.username.length > 50) {
    errors.username = 'Username maksimal 50 karakter';
  }

  if (!body || typeof body.password !== 'string' || body.password.length < 8) {
    errors.password = 'Password wajib diisi, minimal 8 karakter';
  }

  if (!body || typeof body.full_name !== 'string' || body.full_name.trim() === '') {
    errors.full_name = 'Full Name wajib diisi';
  } else if (body.full_name.length > 100) {
    errors.full_name = 'Full Name maksimal 100 karakter';
  }

  if (!body || !Number.isInteger(body.role_id)) {
    errors.role_id = 'Role ID wajib diisi (integer)';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateUpdateUser(body) {
  const errors = {};

  if (body.username !== undefined) {
    if (typeof body.username !== 'string' || body.username.trim() === '') {
      errors.username = 'Username tidak boleh kosong';
    } else if (body.username.length > 50) {
      errors.username = 'Username maksimal 50 karakter';
    }
  }
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    }
  }
  if (body.full_name !== undefined) {
    if (typeof body.full_name !== 'string' || body.full_name.trim() === '') {
      errors.full_name = 'Full Name tidak boleh kosong';
    } else if (body.full_name.length > 100) {
      errors.full_name = 'Full Name maksimal 100 karakter';
    }
  }
  if (body.role_id !== undefined && !Number.isInteger(body.role_id)) {
    errors.role_id = 'Role ID harus integer';
  }
  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    errors.is_active = 'Harus boolean';
  }
  if (Object.keys(body || {}).length === 0) {
    errors._general = 'Tidak ada field yang diubah';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCreateUser, validateUpdateUser };
