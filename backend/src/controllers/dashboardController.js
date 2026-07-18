// src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.status(200).json({ success: true, message: 'Success', data });
});

const attention = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAttention();
  res.status(200).json({ success: true, message: 'Success', data });
});

const upcoming = asyncHandler(async (req, res) => {
  const data = await dashboardService.getUpcoming();
  res.status(200).json({ success: true, message: 'Success', data });
});

const syncStatus = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSyncStatus();
  res.status(200).json({ success: true, message: 'Success', data });
});

module.exports = { summary, attention, upcoming, syncStatus };
