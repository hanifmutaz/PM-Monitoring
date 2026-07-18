// src/controllers/userManagementController.js
const userManagementService = require('../services/userManagementService');
const { validateCreateUser, validateUpdateUser } = require('../validators/userValidator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const { role, is_active } = req.query;
  const data = await userManagementService.listUsers({
    role,
    isActive: is_active === undefined ? undefined : is_active === 'true',
  });
  res.status(200).json({ success: true, message: 'Success', data });
});

const create = asyncHandler(async (req, res) => {
  const body = { ...req.body, role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : undefined };
  const { valid, errors } = validateCreateUser(body);
  if (!valid) throw AppError.badRequest('Validasi gagal', errors);

  const data = await userManagementService.createUser(body, req.user.id);
  res.status(201).json({ success: true, message: 'Success', data });
});

const update = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.role_id !== undefined) body.role_id = Number(body.role_id);

  const { valid, errors } = validateUpdateUser(body);
  if (!valid) throw AppError.badRequest('Validasi gagal', errors);

  const data = await userManagementService.updateUser(Number(req.params.id), body, req.user.id);
  res.status(200).json({ success: true, message: 'Success', data });
});

module.exports = { list, create, update };
