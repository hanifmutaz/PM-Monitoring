// src/routes/pmLineHistoryRoutes.js
const express = require('express');
const pmLineHistoryController = require('../controllers/pmLineHistoryController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin', 'Operator'));

router.get('/', pmLineHistoryController.list);
router.post('/', pmLineHistoryController.create);

module.exports = router;
