// src/components/StatusBadge.jsx
const LABELS = { OK: 'OK', WARNING: 'Warning', DANGER: 'Danger' };

function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();
  const className = `badge badge-${normalized.toLowerCase()}`;
  return (
    <span className={className}>
      <span className="dot" />
      {LABELS[normalized] || status}
    </span>
  );
}

export default StatusBadge;
