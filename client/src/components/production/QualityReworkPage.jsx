import React, { useState } from 'react';
import ProductionQAModule from './ProductionQAModule';
import ReworkModule from './ReworkModule';
import { ShieldCheck, RotateCcw } from 'lucide-react';

export default function QualityReworkPage({
  qaTests,
  workOrders,
  completions,
  reworkOrders,
  onSaveQA,
  onSaveReworkOrder,
  onUpdateReworkStatus,
  showToast,
  defaultTab = 'qa'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            Quality Assurance (QA) ({qaTests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'rework' ? 'active' : ''}`}
            onClick={() => setActiveTab('rework')}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            Rework & Repair ({reworkOrders.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'qa' && (
        <ProductionQAModule
          qaTests={qaTests}
          workOrders={workOrders}
          completions={completions}
          onSave={onSaveQA}
          onNavigateToRework={() => setActiveTab('rework')}
          showToast={showToast}
        />
      )}

      {activeTab === 'rework' && (
        <ReworkModule
          reworkOrders={reworkOrders}
          workOrders={workOrders}
          onSave={onSaveReworkOrder}
          onUpdateStatus={onUpdateReworkStatus}
          showToast={showToast}
        />
      )}
    </div>
  );
}

