// src/pages/DashboardPage.jsx
import { Package, Factory, AlertTriangle, ShieldAlert } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useDashboardAttention, useDashboardUpcoming } from '../hooks/useDashboardExtras';
import KpiCard from '../components/KpiCard';
import LineStatusDonut from '../components/LineStatusDonut';
import CriticalAlertsPanel from '../components/CriticalAlertsPanel';
import GanttUpcomingPanel from '../components/GanttUpcomingPanel';

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