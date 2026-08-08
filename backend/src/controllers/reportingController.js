// src/controllers/reportingController.js
const dashboardService = require('../services/dashboardService');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reporting/site-summary
// Dipanggil oleh instance LAIN (Internal), bukan browser. Reuse service yang
// sama dengan dashboard biasa - jangan duplikasi query, cukup bungkus ulang
// bentuk response-nya + tag site_id biar pemanggil tau ini data dari mana.
const siteSummary = asyncHandler(async (req, res) => {
  const [summary, attention, lineSummary, partSummary] = await Promise.all([
    dashboardService.getSummary(),
    dashboardService.getAttention(),
    dashboardService.getLineSummary(),
    dashboardService.getPartSummary(),
  ]);

  res.json({
    site_id: env.siteId,
    generated_at: new Date().toISOString(),
    summary,
    attention,
    line_summary: lineSummary,
    part_summary: partSummary,
  });
});

module.exports = { siteSummary };
