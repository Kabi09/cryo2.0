import React, { useState } from 'react';
import DeliveryPlanningModule from './DeliveryPlanningModule';
import DispatchModule from './DispatchModule';
import VehicleCourierModule from './VehicleCourierModule';
import { Calendar, Send, Truck } from 'lucide-react';

export default function DeliveryPlanningPage({
  deliveryPlans = [],
  dispatches = [],
  salesOrders = [],
  finishedGoods = [],
  vehiclesCouriers = [],
  onSaveDeliveryPlan,
  onSaveDispatch,
  onSaveVehicleCourier,
  onUpdateVehicleCourier,
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
            Delivery Planning ({deliveryPlans.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatch')}
          >
            <Send size={14} style={{ marginRight: 6 }} />
            Dispatch ({dispatches.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <Truck size={14} style={{ marginRight: 6 }} />
            Vehicles & Couriers ({vehiclesCouriers.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Delivery Planning */}
      {activeTab === 'planning' && (
        <DeliveryPlanningModule
          deliveryPlans={deliveryPlans}
          salesOrders={salesOrders}
          finishedGoods={finishedGoods}
          onSave={onSaveDeliveryPlan}
          showToast={showToast}
        />
      )}

      {/* Tab 2: Dispatch */}
      {activeTab === 'dispatch' && (
        <DispatchModule
          dispatches={dispatches}
          deliveryPlans={deliveryPlans}
          vehiclesCouriers={vehiclesCouriers}
          finishedGoods={finishedGoods}
          onSave={onSaveDispatch}
          showToast={showToast}
        />
      )}

      {/* Tab 3: Vehicles & Couriers */}
      {activeTab === 'vehicles' && (
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
