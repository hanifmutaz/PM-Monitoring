// src/services/pmLineHistoryService.test.js
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { determineHelperUpdate } = require('./pmLineHistoryService');

describe('determineHelperUpdate - Reset Rule MASTER DOCUMENT Bagian 2.D', () => {
  test('WEEKLY: hanya update tgl_pm_weekly_terakhir, tidak menyentuh Monthly', () => {
    const result = determineHelperUpdate('WEEKLY', '2026-07-11', null, true);
    assert.deepEqual(result, { tgl_pm_weekly_terakhir: '2026-07-11' });
  });

  test('MONTHLY + global default true + line override null -> ikut global (reset 2 kolom)', () => {
    const result = determineHelperUpdate('MONTHLY', '2026-07-11', null, true);
    assert.deepEqual(result, {
      tgl_pm_monthly_terakhir: '2026-07-11',
      akumulasi_poin_monthly: 0,
      tgl_pm_weekly_terakhir: '2026-07-11',
    });
  });

  test('MONTHLY + global default false + line override null -> ikut global (reset 1 kolom saja)', () => {
    const result = determineHelperUpdate('MONTHLY', '2026-07-11', null, false);
    assert.deepEqual(result, {
      tgl_pm_monthly_terakhir: '2026-07-11',
      akumulasi_poin_monthly: 0,
    });
  });

  test('MONTHLY + global default true TAPI line override eksplisit false -> override menang (tidak reset weekly)', () => {
    const result = determineHelperUpdate('MONTHLY', '2026-07-11', false, true);
    assert.deepEqual(result, {
      tgl_pm_monthly_terakhir: '2026-07-11',
      akumulasi_poin_monthly: 0,
    });
  });

  test('MONTHLY + global default false TAPI line override eksplisit true -> override menang (tetap reset weekly)', () => {
    const result = determineHelperUpdate('MONTHLY', '2026-07-11', true, false);
    assert.deepEqual(result, {
      tgl_pm_monthly_terakhir: '2026-07-11',
      akumulasi_poin_monthly: 0,
      tgl_pm_weekly_terakhir: '2026-07-11',
    });
  });

  test('akumulasi_poin_monthly SELALU direset ke 0 setiap kali PM Monthly baru dieksekusi', () => {
    const r1 = determineHelperUpdate('MONTHLY', '2026-01-01', null, true);
    const r2 = determineHelperUpdate('MONTHLY', '2026-01-01', false, false);
    assert.equal(r1.akumulasi_poin_monthly, 0);
    assert.equal(r2.akumulasi_poin_monthly, 0);
  });
});
