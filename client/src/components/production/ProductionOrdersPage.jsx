import React, { useState, useEffect } from 'react';
import ProductionPlanningModule from './ProductionPlanningModule';
import BOMModule from './BOMModule';
import ProductionScheduleModule from './ProductionScheduleModule';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import { Calendar, Layers, Clock } from 'lucide-react';

export default function ProductionOrdersPage({
  workOrders = [],
  salesOrders = [],
  products = [],
  boms = [],
  materials = [],
  schedules = [],
  inventory = [],
  onSaveWorkOrder,
  onUpdateWorkOrderStatus,
  onSaveBOM,
  onSaveSchedule,
  onNavigateToMaterials,
  onNavigateToManufacturing,
  onNavigateModule,
  showToast,
  defaultTab = 'orders'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'planning' ? 'orders' : defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab === 'planning' ? 'orders' : defaultTab);
    }
  }, [defaultTab]);

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-orders"
        onNavigate={onNavigateModule}
        counts={{ workOrders: workOrders.length }}
      />

      {/* Sub-Tabs Switcher: All Orders | BOM | Schedule */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} />
            All Work Orders ({workOrders.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'bom' ? 'active' : ''}`}
            onClick={() => setActiveTab('bom')}
          >
            <Layers size={14} style={{ marginRight: 6 }} />
            Bill of Materials (BOM) ({boms.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Production Schedule ({schedules.length})
          </button>
        </div>
      </div>

      {/* Tab 1: All Work Orders */}
      {activeTab === 'orders' && (
        <ProductionPlanningModule
          workOrders={workOrders}
          salesOrders={salesOrders}
          products={products}
          boms={boms}
          inventory={inventory}
          onSave={onSaveWorkOrder}
          onUpdateStatus={onUpdateWorkOrderStatus}
          onNavigateToBOM={() => setActiveTab('bom')}
          onNavigateToSchedule={() => setActiveTab('schedule')}
          onNavigateToMaterials={onNavigateToMaterials}
          onNavigateToManufacturing={onNavigateToManufacturing}
          showToast={showToast}
        />
      )}

      {/* Tab 2: BOM */}
      {activeTab === 'bom' && (
        <BOMModule
          boms={boms}
          products={products}
          materials={materials}
          onSave={onSaveBOM}
          showToast={showToast}
        />
      )}

      {/* Tab 3: Schedule */}
      {activeTab === 'schedule' && (
        <ProductionScheduleModule
          schedules={schedules}
          workOrders={workOrders}
          onSave={onSaveSchedule}
          showToast={showToast}
        />
      )}
    </div>
  );
}
