// src/components/GanttUpcomingPanel.jsx
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const DAYS_AHEAD = 7;

function buildColumns() {
  return Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => {
    const d = dayjs().add(i, 'day');
    return { key: d.format('YYYY-MM-DD'), label: d.format('ddd D') };
  });
}

function groupByLine(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.line_name)) map.set(item.line_name, []);
    map.get(item.line_name).push(item);
  }
  return Array.from(map.entries());
}

const STATUS_COLOR = { OK: 'var(--ok)', WARNING: 'var(--warn)', DANGER: 'var(--danger)' };

function GanttUpcomingPanel({ items = [] }) {
  const columns = buildColumns();
  const rows = groupByLine(items);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Upcoming PM (7 Hari ke Depan)</h2>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">Gak ada jadwal PM dalam 7 hari ke depan.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `150px repeat(${columns.length}, 1fr)`, gap: 4 }}>
            <div />
            {columns.map((col) => (
              <div key={col.key} className="table-header-text" style={{ textAlign: 'center', padding: '4px 0' }}>
                {col.label}
              </div>
            ))}

            {rows.map(([lineName, lineItems]) => (
              <RowContent key={lineName} lineName={lineName} lineItems={lineItems} columns={columns} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RowContent({ lineName, lineItems, columns }) {
  return (
    <>
      <div className="mono" style={{ fontSize: 12, padding: '10px 0', color: 'var(--text-dim)' }}>
        {lineName}
      </div>
      {columns.map((col) => {
        const dayItems = lineItems.filter((it) => it.estimated_date === col.key);
        return (
          <div
            key={col.key}
            style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              borderLeft: '1px solid var(--border-soft)',
            }}
          >
            {dayItems.map((it, idx) => (
              <span
                key={idx}
                title={`${it.label} (${it.status})`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_COLOR[it.status] || 'var(--text-faint)',
                }}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

export default GanttUpcomingPanel;
