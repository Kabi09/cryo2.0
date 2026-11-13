import React, { useState } from 'react';
import ProductionExecutionModule from './ProductionExecutionModule';
import ProductionUpdatesModule from './ProductionUpdatesModule';
import ProductionCompletionModule from './ProductionCompletionModule';
import { PlayCircle, ListOrdered, CheckCircle2 } from 'lucide-react';

export default function ProductionTrackingPage({
  executions,
  workOrders,
  productionUpdates,
  completions,
  onStartExecution,
  onUpdateExecutionStatus,
  onSaveProductionUpdate,
  onSaveCompletion,
  onNavigateToQA,
  showToast,
  defaultTab = 'execution'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'execution' ? 'active' : ''}`}
            onClick={() => setActiveTab('execution')}
          >
            <PlayCircle size={14} style={{ marginRight: 6 }} />
            Shop Floor Execution ({executions.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
            onClick={() => setActiveTab('updates')}
          >
            <ListOrdered size={14} style={{ marginRight: 6 }} />
            Daily / Weekly Updates ({productionUpdates.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'completion' ? 'active' : ''}`}
            onClick={() => setActiveTab('completion')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Production Completion ({completions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'execution' && (
        <ProductionExecutionModule
          executions={executions}
          workOrders={workOrders}
          onStart={onStartExecution}
          onUpdateStatus={onUpdateExecutionStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'updates' && (
        <ProductionUpdatesModule
          productionUpdates={productionUpdates}
          workOrders={workOrders}
          onSave={onSaveProductionUpdate}
          showToast={showToast}
        />
      )}

      {activeTab === 'completion' && (
        <ProductionCompletionModule
          completions={completions}
          workOrders={workOrders}
          onSave={onSaveCompletion}
          onNavigateToQA={onNavigateToQA}
          showToast={showToast}
        />
      )}
    </div>
  );
}

