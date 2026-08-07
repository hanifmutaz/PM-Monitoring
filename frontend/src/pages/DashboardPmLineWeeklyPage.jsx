// src/pages/DashboardPmLineWeeklyPage.jsx
import { Factory, AlertTriangle, ShieldAlert } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useDashboardLineSummary } from '../hooks/useDashboardExtras';
import KpiCard from '../components/KpiCard';
import LineStatusDonut from '../components/LineStatusDonut';
import StatusBadge from '../components/StatusBadge';

function DashboardPmLineWeeklyPage() {
    usePageHeader({ title: 'Dashboard PM Monthly and Weekly' });

    const { data, isLoading, isError } = useDashboardLineSummary();

    if (isError) {
        return <div className="error-state">Gagal memuat dashboard PM Monthly and Weekly. Coba lagi.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {isLoading ? (
                <div className="kpi-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="kpi-card empty-state">
                            ...
                        </div>
                    ))}
                </div>
            ) : (
                <div className="kpi-grid">
                    <KpiCard icon={<Factory size={18} />} label="Total Line" value={data.total_lines} status="accent" />
                    <KpiCard
                        icon={<AlertTriangle size={18} />}
                        label="Perlu Perhatian (Monthly)"
                        value={data.monthly.WARNING + data.monthly.DANGER}
                        caption={`${data.monthly.DANGER} danger, ${data.monthly.WARNING} warning`}
                        status="warn"
                    />
                    <KpiCard
                        icon={<ShieldAlert size={18} />}
                        label="Perlu Perhatian (Weekly)"
                        value={data.weekly.WARNING + data.weekly.DANGER}
                        caption={`${data.weekly.DANGER} danger, ${data.weekly.WARNING} warning`}
                        status="danger"
                    />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Status Monthly</h2>
                    </div>
                    {!isLoading && (
                        <LineStatusDonut
                            healthy={data.monthly.OK}
                            warning={data.monthly.WARNING}
                            critical={data.monthly.DANGER}
                            totalLabel="Total Line"
                        />
                    )}
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Status Weekly</h2>
                    </div>
                    {!isLoading && (
                        <LineStatusDonut
                            healthy={data.weekly.OK}
                            warning={data.weekly.WARNING}
                            critical={data.weekly.DANGER}
                            totalLabel="Total Line"
                        />
                    )}
                </div>
            </div>

            {!isLoading && (
                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Line Butuh Perhatian</h2>
                    </div>
                    {data.attention.length === 0 ? (
                        <div className="empty-state">Semua Line dalam status OK.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Line</th>
                                    <th className="mono">Sisa Hari Monthly</th>
                                    <th>Status Monthly</th>
                                    <th className="mono">Sisa Hari Weekly</th>
                                    <th>Status Weekly</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.attention.map((line) => (
                                    <tr key={line.line_id}>
                                        <td className="mono">{line.line_name}</td>
                                        <td className="mono">{line.sisa_hari_monthly ?? '-'}</td>
                                        <td>
                                            <StatusBadge status={line.status_monthly} />
                                        </td>
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
            )}
        </div>
    );
}

export default DashboardPmLineWeeklyPage;