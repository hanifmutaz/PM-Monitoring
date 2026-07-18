// src/components/LineStatusDonut.jsx
function LineStatusDonut({ healthy = 0, warning = 0, critical = 0 }) {
  const total = healthy + warning + critical;
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);

  const okPct = pct(healthy);
  const warnPct = pct(warning);
  // sisanya (danger) otomatis ngisi sampai 100%

  const gradient = `conic-gradient(
    var(--ok) 0% ${okPct}%,
    var(--warn) ${okPct}% ${okPct + warnPct}%,
    var(--danger) ${okPct + warnPct}% 100%
  )`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: total > 0 ? gradient : 'var(--panel-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--panel)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="kpi-value">{total}</div>
          <div className="caption">Total Line</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <StatusRow color="ok" label="Sehat" value={healthy} />
        <StatusRow color="warn" label="Perlu Perhatian" value={warning} />
        <StatusRow color="danger" label="Kritis" value={critical} />
      </div>
    </div>
  );
}

function StatusRow({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${color})` }} />
      <span style={{ fontSize: 13, color: 'var(--text-dim)', minWidth: 110 }}>{label}</span>
      <span className="mono" style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

export default LineStatusDonut;
