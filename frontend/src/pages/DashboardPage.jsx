// src/pages/DashboardPage.jsx
import { Package, Factory, AlertTriangle, ShieldAlert, Target, TrendingDown } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import {
  useDashboardAttention,
  useDashboardUpcoming,
  useDashboardKetepatanAttention,
} from '../hooks/useDashboardExtras';
import KpiCard from '../components/KpiCard';
import LineStatusDonut from '../components/LineStatusDonut';
import CriticalAlertsPanel from '../components/CriticalAlertsPanel';
import GanttUpcomingPanel from '../components/GanttUpcomingPanel';

function formatKetepatan(percentage) {
  return percentage === null || percentage === undefined ? '-' : `${percentage}%`;
}

// 'muted' (bukan 'accent') buat "belum ada data" - null itu netral, bukan
// "bagus". Lihat KpiCard.jsx buat kenapa ini token terpisah dari accent/warn/danger.
function ketepatanStatus(percentage) {
  if (percentage === null || percentage === undefined) return 'muted';
  if (percentage >= 90) return 'accent';
  if (percentage >= 50) return 'warn';
  return 'danger';
}

function ketepatanCaption(percentage, total, defaultCaption) {
  if (percentage === null || percentage === undefined) return 'Belum ada event tahun ini';
  return `${defaultCaption} — dari ${total} event`;
}

function badgeClassFor(percentage) {
  if (percentage === null || percentage === undefined) return 'badge badge-muted';
  if (percentage >= 90) return 'badge badge-ok';
  if (percentage >= 50) return 'badge badge-warning';
  return 'badge badge-danger';
}

function KetepatanAttentionPanel() {
  const { data = [], isLoading } = useDashboardKetepatanAttention();

  if (isLoading) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <TrendingDown size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
          Line Perlu Perhatian — Ketepatan PM Terendah (Tahun Berjalan)
        </h2>
      </div>
      {data.length === 0 && (
        <div className="empty-state">Belum ada data ketepatan PM tahun ini buat dirangking.</div>
      )}
      {data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Line</th>
              <th className="mono">Ketepatan PM Part</th>
              <th className="mono">Ketepatan Monthly</th>
              <th className="mono">Ketepatan Weekly</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.line_id}>
                <td className="mono">{row.line_name}</td>
                <td>
                  <span className={badgeClassFor(row.part_percentage)}>{formatKetepatan(row.part_percentage)}</span>
                </td>
                <td>
                  <span className={badgeClassFor(row.monthly_percentage)}>
                    {formatKetepatan(row.monthly_percentage)}
                  </span>
                </td>
                <td>
                  <span className={badgeClassFor(row.weekly_percentage)}>
                    {formatKetepatan(row.weekly_percentage)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DashboardPage() {
  usePageHeader({ title: 'Dashboard Management' });

  const { data: summary, isLoading: loadingSummary, isError: errorSummary } = useDashboardSummary();
  const { data: attention = [], isLoading: loadingAttention } = useDashboardAttention();
  const { data: upcoming = [], isLoading: loadingUpcoming } = useDashboardUpcoming();

  if (errorSummary) {
    return <div className="error-state">Gagal memuat data dashboard. Coba lagi.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loadingSummary ? (
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card empty-state">
              ...
            </div>
          ))}
        </div>
      ) : (
        <div className="kpi-grid">
          <KpiCard
            icon={<Package size={18} />}
            label="Total Parts"
            value={summary.total_parts.toLocaleString('id-ID')}
            caption={`${summary.status_ok} OK`}
            status="accent"
          />
          <KpiCard
            icon={<Factory size={18} />}
            label="Active Lines"
            value={summary.active_lines}
            caption={`${summary.lines_healthy} sehat`}
            status="accent"
          />
          <KpiCard
            icon={<AlertTriangle size={18} />}
            label="Part Butuh Perhatian"
            value={summary.status_warning + summary.status_danger}
            caption={`${summary.status_danger} danger, ${summary.status_warning} warning`}
            status="warn"
          />
          <KpiCard
            icon={<ShieldAlert size={18} />}
            label="Line Kritis"
            value={summary.lines_critical}
            caption={`${summary.lines_warning} perlu perhatian`}
            status="danger"
          />
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Ketepatan PM (Tahun Berjalan)</h2>
        </div>
        {!loadingSummary && (
          <div className="kpi-grid">
            <KpiCard
              icon={<Target size={18} />}
              label="Ketepatan PM Part"
              value={formatKetepatan(summary.ketepatan_pm_part_percentage)}
              caption={ketepatanCaption(
                summary.ketepatan_pm_part_percentage,
                summary.ketepatan_pm_part_total,
                'Diganti sebelum/tepat target shot'
              )}
              status={ketepatanStatus(summary.ketepatan_pm_part_percentage)}
            />
            <KpiCard
              icon={<Target size={18} />}
              label="Ketepatan PM Monthly"
              value={formatKetepatan(summary.ketepatan_pm_monthly_percentage)}
              caption={ketepatanCaption(
                summary.ketepatan_pm_monthly_percentage,
                summary.ketepatan_pm_monthly_total,
                'Input sebelum poin mentok cap'
              )}
              status={ketepatanStatus(summary.ketepatan_pm_monthly_percentage)}
            />
            <KpiCard
              icon={<Target size={18} />}
              label="Ketepatan PM Weekly"
              value={formatKetepatan(summary.ketepatan_pm_weekly_percentage)}
              caption={ketepatanCaption(
                summary.ketepatan_pm_weekly_percentage,
                summary.ketepatan_pm_weekly_total,
                'Input dalam siklus hari weekly'
              )}
              status={ketepatanStatus(summary.ketepatan_pm_weekly_percentage)}
            />
          </div>
        )}
      </div>

      <KetepatanAttentionPanel />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Ringkasan Status Line</h2>
        </div>
        {!loadingSummary && (
          <LineStatusDonut
            healthy={summary.lines_healthy}
            warning={summary.lines_warning}
            critical={summary.lines_critical}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {!loadingAttention && <CriticalAlertsPanel items={attention} />}
        {!loadingUpcoming && <GanttUpcomingPanel items={upcoming} />}
      </div>
    </div>
  );
}

export default DashboardPage;