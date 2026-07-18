// src/routes/pmLineRoutes.js
const express = require('express');
const pmLineController = require('../controllers/pmLineController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin', 'Operator'));

router.get('/', pmLineController.status);

module.exports = router;
