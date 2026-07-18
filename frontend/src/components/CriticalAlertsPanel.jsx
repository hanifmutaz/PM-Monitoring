// src/components/CriticalAlertsPanel.jsx
import { AlertTriangle } from 'lucide-react';

function AlertCard({ item }) {
  const isDanger = item.status === 'DANGER';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 14px',
        borderRadius: 8,
        marginBottom: 8,
        background: isDanger ? 'var(--danger-dim)' : 'var(--panel-2)',
        border: `1px solid ${isDanger ? 'var(--danger)' : 'var(--border)'}`,
      }}
    >
      <div>
        <div className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
          {item.line_name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.part_name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 13, color: isDanger ? 'var(--danger)' : 'var(--warn)' }}>
          sisa {item.remaining_shot.toLocaleString('id-ID')} shot
        </div>
        <div className="caption">{item.wear_percentage}% terpakai</div>
      </div>
    </div>
  );
}

function CriticalAlertsPanel({ items = [] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <AlertTriangle size={16} style={{ verticalAlign: -3, marginRight: 6 }} />
          Critical Alerts
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">Gak ada part yang butuh perhatian saat ini.</div>
      ) : (
        items.map((item) => <AlertCard key={item.part_id} item={item} />)
      )}
    </div>
  );
}

export default CriticalAlertsPanel;
