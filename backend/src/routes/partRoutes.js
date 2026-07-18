// src/routes/partRoutes.js
const express = require('express');
const partController = require('../controllers/partController');
const clMappingController = require('../controllers/clMappingController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const requireMasterDataEditAccess = require('../middlewares/masterDataAccess');

const router = express.Router();

router.use(requireAuth);

// Parts - GET: Admin & Operator
router.get('/', requireRole('Admin', 'Operator'), partController.list);

// Parts - POST/PATCH: Admin, atau Operator jika allow_operator_edit_master_data=true
router.post('/', requireMasterDataEditAccess, partController.create);
router.patch('/:id', requireMasterDataEditAccess, partController.update);

// Parts - DELETE: Admin only
router.delete('/:id', requireRole('Admin'), partController.remove);

// Part-CL Mapping (nested) - GET: Admin & Operator
router.get('/:partId/cl-mapping', requireRole('Admin', 'Operator'), clMappingController.list);

// Part-CL Mapping (nested) - POST: sama seperti POST /parts
router.post('/:partId/cl-mapping', requireMasterDataEditAccess, clMappingController.create);

// NOTE: bulk-import (POST /parts/bulk-import) SENGAJA belum diimplementasikan
// di Fase 2. Sesuai 03_API_SPECIFICATION.md §4, endpoint ini "dipakai sekali
// di Fase 2/9 untuk migrasi 1.559 data lama" — akan dibangun di Fase 9
// (bersamaan waktu migrasi data aktual dilakukan) supaya tidak menambah
// dependency (multer, parser CSV/XLSX) sebelum benar-benar dibutuhkan
// (YAGNI, Development Rules §2). Placeholder tidak dibuat sekarang.

module.exports = router;
