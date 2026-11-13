import React, { useState } from 'react';
import ProductionPlanningModule from './ProductionPlanningModule';
import ProductionScheduleModule from './ProductionScheduleModule';
import { Calendar, Clock } from 'lucide-react';

export default function ProductionOrdersPage({
  workOrders,
  salesOrders,
  products,
  boms,
  schedules,
  onSaveWorkOrder,
  onUpdateWorkOrderStatus,
  onSaveSchedule,
  showToast,
  defaultTab = 'planning'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveTab('planning')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} />
            Work Order Planning ({workOrders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Production Schedule ({schedules.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'planning' && (
        <ProductionPlanningModule
          workOrders={workOrders}
          salesOrders={salesOrders}
          products={products}
          boms={boms}
          onSave={onSaveWorkOrder}
          onUpdateStatus={onUpdateWorkOrderStatus}
          showToast={showToast}
        />
      )}

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

