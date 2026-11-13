import React, { useState } from 'react';
import DispatchModule from './DispatchModule';
import DeliveryTrackingModule from './DeliveryTrackingModule';
import { PackageCheck, MapPin } from 'lucide-react';

export default function DispatchTrackingPage({
  dispatches,
  deliveryPlans,
  vehiclesCouriers,
  finishedGoods,
  trackingRecords,
  onSaveDispatch,
  onSaveTrackingMilestone,
  showToast,
  defaultTab = 'dispatch'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatch')}
          >
            <PackageCheck size={14} style={{ marginRight: 6 }} />
            Warehouse Dispatch ({dispatches.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <MapPin size={14} style={{ marginRight: 6 }} />
            Live Delivery Tracking ({trackingRecords.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
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

      {activeTab === 'tracking' && (
        <DeliveryTrackingModule
          trackingRecords={trackingRecords}
          deliveryPlans={deliveryPlans}
          onSave={onSaveTrackingMilestone}
          showToast={showToast}
        />
      )}
    </div>
  );
}

