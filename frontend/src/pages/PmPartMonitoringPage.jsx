// src/pages/PmPartMonitoringPage.jsx
import { useState } from 'react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { usePmPartList } from '../hooks/usePmPartList';
import { useLines } from '../hooks/useLines';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import WearRing from '../components/WearRing';
import StatusBadge from '../components/StatusBadge';
import StatusFilterPills from '../components/StatusFilterPills';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const LIMIT = 20;

function PmPartMonitoringPage() {
  usePageHeader({ title: 'Monitoring PM Part' });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [lineId, setLineId] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const { data: lines = [] } = useLines({ isActive: true });

  const { data, isLoading, isError } = usePmPartList({
    search: debouncedSearch || undefined,
    status: status || undefined,
    line_id: lineId || undefined,
    page,
    limit: LIMIT,
  });

  function handleFilterChange(setter) {
    return (val) => {
      setter(val);
      setPage(1);
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={search} onChange={handleFilterChange(setSearch)} placeholder="Cari drawing no / nama part..." />

        <select
          className="form-select"
          value={lineId}
          onChange={(e) => handleFilterChange(setLineId)(e.target.value)}
        >
          <option value="">Semua Line</option>
          {lines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.line_name}
            </option>
          ))}
        </select>

        <StatusFilterPills value={status} onChange={handleFilterChange(setStatus)} />
      </div>

      <div className="panel">
        {isError && <div className="error-state">Gagal memuat data. Coba lagi.</div>}

        {isLoading && !data && <div className="empty-state">Memuat data...</div>}

        {data && data.items.length === 0 && (
          <div className="empty-state">Belum ada part yang cocok dengan filter ini.</div>
        )}

        {data && data.items.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Line</th>
                  <th>Drawing No / Part Name</th>
                  <th className="mono">Counter</th>
                  <th className="mono">Target Shot</th>
                  <th className="mono">Sisa Shot</th>
                  <th className="mono">Estimasi PM</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.part_id}>
                    <td>
                      <WearRing percentage={item.wear_percentage} status={item.status} />
                    </td>
                    <td className="mono">{item.line_name}</td>
                    <td>
                      <div>{item.part_name}</div>
                      <div className="caption mono">
                        {item.drawing_no} <span className="caption">({item.jig_name})</span>
                      </div>
                    </td>
                    <td className="mono">{item.counter.toLocaleString('id-ID')}</td>
                    <td className="mono">{item.target_shot.toLocaleString('id-ID')}</td>
                    <td className="mono">{item.remaining_shot.toLocaleString('id-ID')}</td>
                    <td className="mono">{item.estimated_pm_date || '-'}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default PmPartMonitoringPage;