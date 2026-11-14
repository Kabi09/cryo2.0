import React, { useState } from 'react';
import DeliveryTrackingModule from './DeliveryTrackingModule';
import { Truck, CheckCircle2, AlertTriangle, Navigation } from 'lucide-react';

export default function DispatchTrackingPage({
  trackingRecords = [],
  deliveryPlans = [],
  onSaveTrackingMilestone,
  showToast,
  defaultTab = 'in-transit'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Segment tracking records by status
  const inTransitRecords = trackingRecords.filter(t => t.currentStatus === 'In Transit' || t.currentStatus === 'Dispatched');
  const deliveredRecords = trackingRecords.filter(t => t.currentStatus === 'Delivered');
  const exceptionRecords = trackingRecords.filter(t => t.currentStatus === 'Delayed' || t.currentStatus === 'Exception' || t.delayReason);

  const currentList = activeTab === 'in-transit'
    ? inTransitRecords
    : activeTab === 'delivered'
    ? deliveredRecords
    : exceptionRecords;

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'in-transit' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-transit')}
          >
            <Truck size={14} style={{ marginRight: 6 }} />
            In Transit ({inTransitRecords.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Delivered ({deliveredRecords.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('exceptions')}
          >
            <AlertTriangle size={14} style={{ marginRight: 6, color: exceptionRecords.length > 0 ? 'var(--danger)' : 'inherit' }} />
            Exceptions & Delays ({exceptionRecords.length})
          </button>
        </div>
      </div>

      {/* Reused DeliveryTrackingModule with filtered view */}
      <DeliveryTrackingModule
        trackingRecords={currentList.length > 0 ? currentList : (trackingRecords.length > 0 && activeTab === 'in-transit' ? trackingRecords : currentList)}
        deliveryPlans={deliveryPlans}
        onSave={onSaveTrackingMilestone}
        showToast={showToast}
      />
    </div>
  );
}
