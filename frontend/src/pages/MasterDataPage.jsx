// src/pages/MasterDataPage.jsx
import { useState } from 'react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import LinesTab from '../components/masterdata/LinesTab';
import PartsTab from '../components/masterdata/PartsTab';
import ImportMasterDataTab from '../components/masterdata/ImportMasterDataTab';
import InventoryTab from '../components/masterdata/InventoryTab';

const TABS = [
  { key: 'lines', label: 'Lines' },
  { key: 'parts', label: 'Parts' },
  { key: 'import', label: 'Import Excel' },
  { key: 'inventory', label: 'Inventory' },
];

function MasterDataPage() {
  usePageHeader({ title: 'Master Data' });
  const [activeTab, setActiveTab] = useState('lines');

  return (
    <div className="panel">
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-item${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'lines' && <LinesTab />}
      {activeTab === 'parts' && <PartsTab />}
      {activeTab === 'import' && <ImportMasterDataTab />}
      {activeTab === 'inventory' && <InventoryTab />}
    </div>
  );
}

export default MasterDataPage;
