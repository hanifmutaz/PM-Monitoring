// src/services/dashboardService.js
//
// Development Rules §23: "Dashboard tidak boleh menghitung business logic
// sendiri di frontend [maupun backend-nya sendiri]. Dashboard hanya membaca
// hasil yang sudah dihitung oleh Service." Semua angka di sini murni
// agregasi (count/filter/sort) dari pmPartService & pmLineService yang
// SUDAH menghitung status/threshold — tidak ada rumus PM baru di file ini.

const dashboardQueries = require('../sql/dashboardQueries');
const pmPartService = require('./pmPartService');
const pmLineService = require('./pmLineService');
const settingsService = require('./settingsService');
const dateUtils = require('../utils/dateUtils');

const STATUS_RANK = { OK: 0, WARNING: 1, DANGER: 2 };

function worstStatus(a, b) {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

async function getSummary() {
  const [partMetrics, lineStatuses, totalParts, activeLines] = await Promise.all([
    pmPartService.getAllComputedMetrics(),
    pmLineService.getPmLineStatus({}),
    dashboardQueries.countAllParts(),
    dashboardQueries.countActiveLines(),
  ]);

  const statusCounts = { OK: 0, WARNING: 0, DANGER: 0 };
  for (const p of partMetrics) statusCounts[p.status] += 1;

  // Status gabungan per Line = status terburuk antara Monthly & Weekly
  // (interpretasi presentasi Dashboard - bukan rumus PM baru, cuma cara
  // mengelompokkan 2 status yang sudah dihitung pmLineService jadi 1
  // kategori kesehatan Line untuk KPI card).
  const lineBuckets = { OK: 0, WARNING: 0, DANGER: 0 };
  for (const l of lineStatuses) {
    const worst = worstStatus(l.status_monthly, l.status_weekly);
    lineBuckets[worst] += 1;
  }

  return {
    total_parts: totalParts,
    status_ok: statusCounts.OK,
    status_warning: statusCounts.WARNING,
    status_danger: statusCounts.DANGER,
    active_lines: activeLines,
    lines_healthy: lineBuckets.OK,
    lines_warning: lineBuckets.WARNING,
    lines_critical: lineBuckets.DANGER,
  };
}

async function getAttention() {
  const limit = (await settingsService.getSetting('dashboard_upcoming_pm_limit')) || 10;
  const partMetrics = await pmPartService.getAllComputedMetrics();

  return partMetrics
    .filter((p) => p.status === 'WARNING' || p.status === 'DANGER')
    .sort((a, b) => a.remaining_shot - b.remaining_shot)
    .slice(0, limit);
}

const UPCOMING_WINDOW_DAYS = 7; // sesuai 05_UI_UX_SPECIFICATION.md §4.5 (Gantt Timeline 7 hari ke depan)

function withinUpcomingWindow(dateStr) {
  if (!dateStr) return false;
  const todayStr = dateUtils.todayString();
  const windowEndStr = dateUtils.addDaysToToday(UPCOMING_WINDOW_DAYS);
  return dateStr >= todayStr && dateStr <= windowEndStr;
}

async function getUpcoming() {
  const [partMetrics, lineStatuses] = await Promise.all([
    pmPartService.getAllComputedMetrics(),
    pmLineService.getPmLineStatus({}),
  ]);

  const items = [];

  for (const p of partMetrics) {
    if (withinUpcomingWindow(p.estimated_pm_date)) {
      items.push({
        type: 'PM_PART',
        line_name: p.line_name,
        label: p.part_name,
        estimated_date: p.estimated_pm_date,
        status: p.status,
      });
    }
  }

  for (const l of lineStatuses) {
    if (l.sisa_hari_monthly !== null) {
      const estDate = dateUtils.addDaysToToday(Math.max(l.sisa_hari_monthly, 0));
      if (withinUpcomingWindow(estDate)) {
        items.push({
          type: 'PM_LINE_MONTHLY',
          line_name: l.line_name,
          label: 'PM Monthly',
          estimated_date: estDate,
          status: l.status_monthly,
        });
      }
    }
    if (l.sisa_hari_weekly !== null) {
      const estDate = dateUtils.addDaysToToday(Math.max(l.sisa_hari_weekly, 0));
      if (withinUpcomingWindow(estDate)) {
        items.push({
          type: 'PM_LINE_WEEKLY',
          line_name: l.line_name,
          label: 'PM Weekly',
          estimated_date: estDate,
          status: l.status_weekly,
        });
      }
    }
  }

  items.sort((a, b) => (a.estimated_date > b.estimated_date ? 1 : -1));
  return items;
}

async function getSyncStatus() {
  const row = await dashboardQueries.getLastSyncInfo();
  if (!row || !row.last_synced_at) {
    return { last_synced_at: null, status: 'fail', rows_synced: 0 };
  }
  return {
    last_synced_at: row.last_synced_at,
    status: 'success',
    rows_synced: row.rows_synced || 0,
  };
}

module.exports = { getSummary, getAttention, getUpcoming, getSyncStatus };
