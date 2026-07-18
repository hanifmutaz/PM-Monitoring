// src/routes/pmPartRoutes.js
const express = require('express');
const pmPartController = require('../controllers/pmPartController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('Admin', 'Operator'));

router.get('/', pmPartController.list);
router.get('/:partId', pmPartController.detail);

module.exports = router;
