// src/routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin', 'Operator'));

router.get('/summary', dashboardController.summary);
router.get('/attention', dashboardController.attention);
router.get('/upcoming', dashboardController.upcoming);
router.get('/sync-status', dashboardController.syncStatus);

module.exports = router;
