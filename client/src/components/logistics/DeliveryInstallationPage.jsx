import React, { useState } from 'react';
import DeliveryConfirmationModule from './DeliveryConfirmationModule';
import InstallationModule from './InstallationModule';
import InstallationCompletionModule from './InstallationCompletionModule';
import { FileCheck, Wrench, Award } from 'lucide-react';

export default function DeliveryInstallationPage({
  confirmations,
  deliveryPlans,
  installations,
  installationCompletions,
  onSaveDeliveryConfirmation,
  onSaveInstallation,
  onUpdateInstallationStatus,
  onSaveInstallationCompletion,
  showToast,
  defaultTab = 'confirmation'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'confirmation' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmation')}
          >
            <FileCheck size={14} style={{ marginRight: 6 }} />
            Delivery Confirmation (POD) ({confirmations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'installation' ? 'active' : ''}`}
            onClick={() => setActiveTab('installation')}
          >
            <Wrench size={14} style={{ marginRight: 6 }} />
            Installation Scheduling ({installations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'completion' ? 'active' : ''}`}
            onClick={() => setActiveTab('completion')}
          >
            <Award size={14} style={{ marginRight: 6 }} />
            7-Point QA Commissioning Checklist ({installationCompletions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'confirmation' && (
        <DeliveryConfirmationModule
          confirmations={confirmations}
          deliveryPlans={deliveryPlans}
          onSave={onSaveDeliveryConfirmation}
          showToast={showToast}
        />
      )}

      {activeTab === 'installation' && (
        <InstallationModule
          installations={installations}
          deliveryPlans={deliveryPlans}
          onSave={onSaveInstallation}
          onUpdateStatus={onUpdateInstallationStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'completion' && (
        <InstallationCompletionModule
          completions={installationCompletions}
          installations={installations}
          onSave={onSaveInstallationCompletion}
          showToast={showToast}
        />
      )}
    </div>
  );
}

