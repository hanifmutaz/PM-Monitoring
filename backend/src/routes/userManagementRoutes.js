// src/routes/userManagementRoutes.js
const express = require('express');
const userManagementController = require('../controllers/userManagementController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin'));

router.get('/', userManagementController.list);
router.post('/', userManagementController.create);
router.patch('/:id', userManagementController.update);

module.exports = router;
