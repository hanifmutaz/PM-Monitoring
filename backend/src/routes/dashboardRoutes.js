// src/routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// View-only - sama alasannya dengan pmLineRoutes.js
router.use(requireAuth);

router.get('/summary', dashboardController.summary);
router.get('/attention', dashboardController.attention);
router.get('/upcoming', dashboardController.upcoming);
router.get('/sync-status', dashboardController.syncStatus);
router.get('/part-summary', dashboardController.partSummary);
router.get('/line-summary', dashboardController.lineSummary);

module.exports = router;