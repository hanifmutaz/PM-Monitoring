// src/components/KpiCard.jsx
function KpiCard({ icon, label, value, caption, status = 'accent' }) {
  // 'muted' dipakai buat state "belum ada data" - sengaja BUKAN salah satu
  // dari accent/warn/danger (yang berarti baik/waspada/kritis), jadi gak
  // dipetakan ke var(--{status}-dim) seperti biasa. Dibedain manual pakai
  // token netral yang sudah ada (panel-3/text-faint) - tidak menambah token
  // baru ke tokens.css.
  const isMuted = status === 'muted';
  const iconStyle = isMuted
    ? { background: 'var(--panel-3)', color: 'var(--text-faint)' }
    : { background: `var(--${status}-dim)`, color: `var(--${status})` };

  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={iconStyle}>
        {icon}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {caption && <div className="kpi-caption">{caption}</div>}
    </div>
  );
}

export default KpiCard;
