// src/components/SiteStatusBadge.jsx
// Sengaja komponen TERPISAH dari StatusBadge.jsx - itu buat status Part/Line
// (OK/WARNING/DANGER, arti "kondisi part/mesin"), ini buat status koneksi
// ke site lain (ok/stale/unreachable, arti "seberapa segar datanya"). Beda
// makna walau visualnya mirip, jadi gak dipaksa 1 komponen. Reuse class
// badge/dot yang sudah ada di components.css - gak nambah CSS baru.
const CONFIG = {
  ok: { label: 'Live', className: 'badge badge-ok' },
  stale: { label: 'Data Lama', className: 'badge badge-warning' },
  unreachable: { label: 'Gak Terhubung', className: 'badge badge-danger' },
};

function SiteStatusBadge({ status }) {
  const config = CONFIG[status] || { label: status, className: 'badge badge-muted' };
  return (
    <span className={config.className}>
      <span className="dot" />
      {config.label}
    </span>
  );
}

export default SiteStatusBadge;
