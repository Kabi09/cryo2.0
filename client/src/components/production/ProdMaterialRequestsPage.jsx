import React, { useState } from 'react';
import MaterialRequestsModule from './MaterialRequestsModule';
import ProductionMaterialIssueModule from './ProductionMaterialIssueModule';
import { ArrowDownLeft, CheckSquare } from 'lucide-react';

export default function ProdMaterialRequestsPage({
  materialRequests,
  workOrders,
  materials,
  boms,
  inventory,
  materialIssues,
  onSaveMaterialRequest,
  onSaveProductionMaterialIssue,
  showToast,
  defaultTab = 'requests'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <ArrowDownLeft size={14} style={{ marginRight: 6 }} />
            Material Requests to Store ({materialRequests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <CheckSquare size={14} style={{ marginRight: 6 }} />
            Material Issue Slips & Status ({materialIssues?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <MaterialRequestsModule
          materialRequests={materialRequests}
          workOrders={workOrders}
          materials={materials}
          boms={boms}
          inventory={inventory}
          onSave={onSaveMaterialRequest}
          showToast={showToast}
        />
      )}

      {activeTab === 'issues' && (
        <ProductionMaterialIssueModule
          materialIssues={materialIssues}
          materialRequests={materialRequests}
          inventory={inventory}
          onSave={onSaveProductionMaterialIssue}
          showToast={showToast}
        />
      )}
    </div>
  );
}

