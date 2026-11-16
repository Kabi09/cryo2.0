import React, { useState } from 'react';
import ProductionExecutionModule from './ProductionExecutionModule';
import ProductionUpdatesModule from './ProductionUpdatesModule';
import ProductionCompletionModule from './ProductionCompletionModule';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import { PlayCircle, ListOrdered, CheckCircle2 } from 'lucide-react';

export default function ProductionTrackingPage({
  executions = [],
  workOrders = [],
  productionUpdates = [],
  completions = [],
  onStartExecution,
  onUpdateExecutionStatus,
  onSaveProductionUpdate,
  onSaveCompletion,
  onNavigateToQA,
  onNavigateModule,
  showToast,
  defaultTab = 'execution'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-manufacturing"
        onNavigate={onNavigateModule}
        counts={{ executions: executions.length }}
      />

      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'execution' ? 'active' : ''}`}
            onClick={() => setActiveTab('execution')}
          >
            <PlayCircle size={14} style={{ marginRight: 6 }} />
            In Progress ({executions.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
            onClick={() => setActiveTab('updates')}
          >
            <ListOrdered size={14} style={{ marginRight: 6 }} />
            Daily Updates ({productionUpdates.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'completion' ? 'active' : ''}`}
            onClick={() => setActiveTab('completion')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Completed ({completions.length})
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
          onNavigateToCompletion={() => setActiveTab('completion')}
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
