// src/pages/DashboardMultiSitePage.jsx
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Package, Factory, AlertTriangle, ShieldAlert } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useDashboardMultiSite } from '../hooks/useDashboardExtras';
import KpiCard from '../components/KpiCard';
import SiteStatusBadge from '../components/SiteStatusBadge';

dayjs.locale('id');

function formatFetchedAt(iso) {
  if (!iso) return 'Belum pernah berhasil ditarik';
  return `Update terakhir ${dayjs(iso).format('DD MMM YYYY, HH:mm')}`;
}

function SiteSummaryPanel({ site }) {
  const summary = site.data?.summary;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">{site.site_label}</h2>
        <SiteStatusBadge status={site.status} />
      </div>
      <div className="caption" style={{ marginTop: -8, marginBottom: 16 }}>
        {formatFetchedAt(site.fetched_at)}
        {site.status === 'stale' &&
          ' — nampilin data terakhir yang berhasil ditarik, koneksi lokasi ini lagi bermasalah'}
      </div>

      {!summary && (
        <div className="empty-state">
          Belum pernah berhasil narik data dari lokasi ini.
          {site.error && ` (${site.error})`}
        </div>
      )}

      {summary && (
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
    </div>
  );
}

function DashboardMultiSitePage() {
  usePageHeader({ title: 'Dashboard Multi-Lokasi' });

  const { data: sites = [], isLoading, isError, error } = useDashboardMultiSite();

  if (isError) {
    // 403 dari backend berarti instance ini BUKAN Internal (endpoint memang
    // cuma hidup di sana - lihat dashboardController.multiSite) - bedain
    // pesannya dari error jaringan biasa biar gak membingungkan.
    const isForbidden = error?.response?.status === 403;
    return (
      <div className="error-state">
        {isForbidden
          ? 'Dashboard Multi-Lokasi cuma tersedia di instance Internal.'
          : 'Gagal memuat dashboard multi-lokasi. Coba lagi.'}
      </div>
    );
  }

  if (isLoading) {
    return <div className="empty-state">Menarik data dari semua lokasi...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sites.map((site) => (
        <SiteSummaryPanel key={site.site_id} site={site} />
      ))}
    </div>
  );
}

export default DashboardMultiSitePage;
