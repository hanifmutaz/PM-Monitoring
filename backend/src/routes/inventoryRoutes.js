// src/routes/inventoryRoutes.js
const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const requireMasterDataEditAccess = require('../middlewares/masterDataAccess');

const router = express.Router();
router.use(requireAuth);

// GET - Admin & Operator (sama seperti akses baca Master Data lain)
router.get('/', requireRole('Admin', 'Operator'), inventoryController.list);
router.get('/rop-status', requireRole('Admin', 'Operator'), inventoryController.ropStatus);
router.get('/:id', requireRole('Admin', 'Operator'), inventoryController.detail);
router.get('/:id/movements', requireRole('Admin', 'Operator'), inventoryController.movements);

// Create/Update Inventory Item - dianggap Master Data (bikin/ubah "jenis
// spare part" itu sendiri) - Admin, atau Operator kalau
// allow_operator_edit_master_data = true. Sama pola dengan Parts/Lines.
router.post('/', requireMasterDataEditAccess, inventoryController.create);
router.patch('/:id', requireMasterDataEditAccess, inventoryController.update);

// Stock movement (IN/OUT/ADJUSTMENT) - dianggap OPERASIONAL harian, bukan
// Master Data - dibuka untuk Admin & Operator sama rata, konsisten dengan
// pola submit PM Part History (pmPartHistoryRoutes.js) yang juga operasional.
router.post('/:id/adjust-stock', requireRole('Admin', 'Operator'), inventoryController.adjustStock);

// Delete Inventory Item - Admin only (sama pola dengan delete Line/Part)
router.delete('/:id', requireRole('Admin'), inventoryController.remove);

module.exports = router;
