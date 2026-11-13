import React, { useState } from 'react';
import DeliveryPlanningModule from './DeliveryPlanningModule';
import VehicleCourierModule from './VehicleCourierModule';
import { Calendar, Truck } from 'lucide-react';

export default function DeliveryPlanningPage({
  deliveryPlans,
  salesOrders,
  finishedGoods,
  vehiclesCouriers,
  onSaveDeliveryPlan,
  onSaveVehicleCourier,
  onUpdateVehicleCourier,
  showToast,
  defaultTab = 'plans'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} />
            Delivery Plans ({deliveryPlans.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            <Truck size={14} style={{ marginRight: 6 }} />
            Vehicle & Courier Fleet ({vehiclesCouriers.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' && (
        <DeliveryPlanningModule
          deliveryPlans={deliveryPlans}
          salesOrders={salesOrders}
          finishedGoods={finishedGoods}
          onSave={onSaveDeliveryPlan}
          showToast={showToast}
        />
      )}

      {activeTab === 'fleet' && (
        <VehicleCourierModule
          items={vehiclesCouriers}
          onSave={onSaveVehicleCourier}
          onUpdate={onUpdateVehicleCourier}
          showToast={showToast}
        />
      )}
    </div>
  );
}

