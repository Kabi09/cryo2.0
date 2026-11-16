import React, { useState, useEffect } from 'react';
import MaterialRequestsModule from './MaterialRequestsModule';
import ProductionMaterialIssueModule from './ProductionMaterialIssueModule';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import { ArrowDownLeft, CheckSquare } from 'lucide-react';

export default function ProdMaterialRequestsPage({
  materialRequests = [],
  materialIssues = [],
  workOrders = [],
  materials = [],
  boms = [],
  inventory = [],
  preSelectedWO = null,
  onSaveMaterialRequest,
  onSaveProductionMaterialIssue,
  onNavigateToPurchasing,
  onNavigateToManufacturing,
  onNavigateModule,
  showToast,
  defaultTab = 'requests'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedMRForIssue, setSelectedMRForIssue] = useState(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-materials"
        onNavigate={onNavigateModule}
        counts={{ materialRequests: materialRequests.length }}
      />

      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <ArrowDownLeft size={14} style={{ marginRight: 6 }} />
            Material Requests ({materialRequests.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <CheckSquare size={14} style={{ marginRight: 6 }} />
            Issued Materials ({materialIssues?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Material Requests */}
      {activeTab === 'requests' && (
        <MaterialRequestsModule
          materialRequests={materialRequests}
          workOrders={workOrders}
          materials={materials}
          boms={boms}
          inventory={inventory}
          preSelectedWO={preSelectedWO}
          onSave={onSaveMaterialRequest}
          onNavigateToIssue={(mr) => {
            setSelectedMRForIssue(mr);
            setActiveTab('issues');
          }}
          onNavigateToPurchasing={onNavigateToPurchasing}
          showToast={showToast}
        />
      )}

      {/* Tab 2: Issued Materials */}
      {activeTab === 'issues' && (
        <ProductionMaterialIssueModule
          materialIssues={materialIssues}
          materialRequests={materialRequests}
          inventory={inventory}
          preSelectedRequest={selectedMRForIssue}
          onClearPreSelectedRequest={() => setSelectedMRForIssue(null)}
          onNavigateToManufacturing={onNavigateToManufacturing}
          onSave={onSaveProductionMaterialIssue}
          showToast={showToast}
        />
      )}
    </div>
  );
}
