import React, { useState } from 'react';
import QCTestsModule from './QCTestsModule';
import InventoryModule from './InventoryModule';
import InventoryReportModule from './InventoryReportModule';
import { ShieldCheck, Boxes, FileSpreadsheet } from 'lucide-react';

export default function QualityInventoryPage({
  qcTests,
  grns,
  inventory,
  reportsData,
  onSaveQCTest,
  onAdjustStock,
  preSelectedGRN,
  showToast,
  defaultTab = 'qc'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'qc' ? 'active' : ''}`}
            onClick={() => setActiveTab('qc')}
          >
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            QC Inspection Tests ({qcTests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={14} style={{ marginRight: 6 }} />
            Warehouse Stock Inventory ({inventory.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileSpreadsheet size={14} style={{ marginRight: 6 }} />
            Inventory Analytics & Reports
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'qc' && (
        <QCTestsModule
          qcTests={qcTests}
          grns={grns}
          onSave={onSaveQCTest}
          showToast={showToast}
          preSelectedGRN={preSelectedGRN}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryModule
          inventory={inventory}
          onAdjustStock={onAdjustStock}
          showToast={showToast}
        />
      )}

      {activeTab === 'reports' && (
        <InventoryReportModule
          reportsData={reportsData}
          showToast={showToast}
        />
      )}
    </div>
  );
}

