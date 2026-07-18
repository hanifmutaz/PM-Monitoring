// src/components/KpiCard.jsx
function KpiCard({ icon, label, value, caption, status = 'accent' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `var(--${status}-dim)`, color: `var(--${status})` }}>
        {icon}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {caption && <div className="kpi-caption">{caption}</div>}
    </div>
  );
}

export default KpiCard;
