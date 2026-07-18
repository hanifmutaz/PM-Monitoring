// src/routes/pmPartHistoryRoutes.js
const express = require('express');
const pmPartHistoryController = require('../controllers/pmPartHistoryController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin', 'Operator'));

router.get('/', pmPartHistoryController.list);
router.post('/', pmPartHistoryController.create);

module.exports = router;
