// src/pages/PmLineStatusPage.jsx
import { usePageHeader } from '../contexts/PageHeaderContext';
import { usePmLineStatus } from '../hooks/usePmLineStatus';
import StatusBadge from '../components/StatusBadge';
import Banner from '../components/Banner';

function PmLineStatusPage() {
  usePageHeader({ title: 'Monitoring PM Monthly and Weekly' });

  const { data, isLoading, isError } = usePmLineStatus({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Banner>
        Status Monthly dihitung dari akumulasi poin (cap 30), status Weekly murni hitung mundur kalender 7 hari.
        Reset Monthly bisa ikut nge-reset Weekly tergantung setting <code className="mono">auto_reset_weekly_on_monthly</code>.
      </Banner>

      <div className="panel">
        {isError && <div className="error-state">Gagal memuat status Line. Coba lagi.</div>}
        {isLoading && <div className="empty-state">Memuat data...</div>}
        {data && data.length === 0 && <div className="empty-state">Belum ada Line aktif.</div>}

        {data && data.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Line</th>
                <th className="mono">Tgl Monthly Terakhir</th>
                <th className="mono">Poin</th>
                <th className="mono">Sisa Hari Monthly</th>
                <th>Status Monthly</th>
                <th className="mono">Tgl Weekly Terakhir</th>
                <th className="mono">Sisa Hari Weekly</th>
                <th>Status Weekly</th>
              </tr>
            </thead>
            <tbody>
              {data.map((line) => (
                <tr key={line.line_id}>
                  <td className="mono">{line.line_name}</td>
                  <td className="mono">{line.tgl_pm_monthly_terakhir || '-'}</td>
                  <td className="mono">{line.akumulasi_poin_monthly}</td>
                  <td className="mono">{line.sisa_hari_monthly ?? '-'}</td>
                  <td>
                    <StatusBadge status={line.status_monthly} />
                  </td>
                  <td className="mono">{line.tgl_pm_weekly_terakhir || '-'}</td>
                  <td className="mono">{line.sisa_hari_weekly ?? '-'}</td>
                  <td>
                    <StatusBadge status={line.status_weekly} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PmLineStatusPage;