// src/pages/SettingsPage.jsx
import { useState } from 'react';
import { Sliders, Award, CalendarClock, Repeat, RefreshCw, LayoutGrid, Users } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';
import ToggleSwitch from '../components/ToggleSwitch';

// Urutan & metadata 7 kategori sesuai MASTER DOCUMENT Bagian 4
const CATEGORY_META = {
  threshold_pm_part: { no: 1, title: 'Threshold PM Part', icon: Sliders },
  skema_poin_monthly: { no: 2, title: 'Skema Poin PM Monthly', icon: Award },
  threshold_monthly_weekly: { no: 3, title: 'Threshold Monthly & Weekly', icon: CalendarClock },
  relasi_monthly_weekly: { no: 4, title: 'Relasi Monthly ↔ Weekly', icon: Repeat },
  sync_data_produksi: { no: 5, title: 'Sync Data Produksi', icon: RefreshCw },
  dashboard_tampilan: { no: 6, title: 'Dashboard & Tampilan', icon: LayoutGrid },
  user_role: { no: 7, title: 'User & Role', icon: Users },
};

function SettingRow({ setting }) {
  const updateMutation = useUpdateSetting();
  const [localValue, setLocalValue] = useState(setting.value);
  const [error, setError] = useState('');

  async function save(rawValue) {
    setError('');
    let castedValue = rawValue;
    if (setting.value_type === 'number') castedValue = Number(rawValue);
    if (setting.value_type === 'boolean') castedValue = rawValue === true || rawValue === 'true';

    try {
      await updateMutation.mutateAsync({ key: setting.key, value: castedValue });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
      setLocalValue(setting.value); // rollback tampilan ke nilai server
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-soft)',
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 13 }}>
          {setting.key}
        </div>
        {setting.description && <div className="caption">{setting.description}</div>}
        {error && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2 }}>{error}</div>}
      </div>

      <div style={{ flexShrink: 0 }}>
        {setting.value_type === 'boolean' && (
          <ToggleSwitch
            checked={localValue === 'true' || localValue === true}
            disabled={updateMutation.isPending}
            onChange={(next) => {
              setLocalValue(next);
              save(next);
            }}
          />
        )}
        {setting.value_type === 'number' && (
          <input
            type="number"
            className="form-input mono"
            style={{ width: 70, textAlign: 'right' }}
            value={localValue}
            disabled={updateMutation.isPending}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => save(e.target.value)}
          />
        )}
        {setting.value_type === 'text' && (
          <input
            type="text"
            className="form-input"
            style={{ width: 160 }}
            value={localValue}
            disabled={updateMutation.isPending}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => save(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

function CategoryCard({ categoryKey, settings }) {
  const meta = CATEGORY_META[categoryKey] || { no: '-', title: categoryKey, icon: Sliders };
  const Icon = meta.icon;
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} />
          <span className="mono" style={{ color: 'var(--text-faint)' }}>
            {String(meta.no).padStart(2, '0')}
          </span>
          {meta.title}
        </h2>
      </div>
      {settings.map((s) => (
        <SettingRow key={s.key} setting={s} />
      ))}
    </div>
  );
}

function SettingsPage() {
  usePageHeader({ title: 'Settings' });
  const { data, isLoading, isError } = useSettings();

  if (isError) {
    return <div className="error-state">Gagal memuat settings. Coba lagi.</div>;
  }
  if (isLoading) {
    return <div className="empty-state">Memuat data...</div>;
  }

  const grouped = {};
  for (const s of data) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  const orderedCategories = Object.keys(grouped).sort(
    (a, b) => (CATEGORY_META[a]?.no || 99) - (CATEGORY_META[b]?.no || 99)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {orderedCategories.map((cat) => (
        <CategoryCard key={cat} categoryKey={cat} settings={grouped[cat]} />
      ))}
    </div>
  );
}

export default SettingsPage;
