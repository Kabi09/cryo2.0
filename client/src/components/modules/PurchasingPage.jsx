import React, { useState } from 'react';
import PurchaseOrdersModule from './PurchaseOrdersModule';
import GRNModule from './GRNModule';
import SupplierReturnsModule from './SupplierReturnsModule';
import { ShoppingCart, FileCheck, RotateCcw } from 'lucide-react';

export default function PurchasingPage({
  purchaseOrders,
  suppliers,
  materials,
  supplierLinks,
  grns,
  supplierReturns,
  qcTests,
  onSavePO,
  onUpdatePOStatus,
  onSaveGRN,
  onNavigateToQC,
  onSaveSupplierReturn,
  showToast,
  defaultTab = 'po'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Header */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'po' ? 'active' : ''}`}
            onClick={() => setActiveTab('po')}
          >
            <ShoppingCart size={14} style={{ marginRight: 6 }} />
            Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'grn' ? 'active' : ''}`}
            onClick={() => setActiveTab('grn')}
          >
            <FileCheck size={14} style={{ marginRight: 6 }} />
            Goods Receipt (GRN) ({grns.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            Supplier Returns ({supplierReturns.length})
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'po' && (
        <PurchaseOrdersModule
          purchaseOrders={purchaseOrders}
          suppliers={suppliers}
          materials={materials}
          supplierLinks={supplierLinks}
          onSave={onSavePO}
          onUpdateStatus={onUpdatePOStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'grn' && (
        <GRNModule
          grns={grns}
          purchaseOrders={purchaseOrders}
          onSave={onSaveGRN}
          showToast={showToast}
          onNavigateToQC={onNavigateToQC}
        />
      )}

      {activeTab === 'returns' && (
        <SupplierReturnsModule
          supplierReturns={supplierReturns}
          qcTests={qcTests}
          onSave={onSaveSupplierReturn}
          showToast={showToast}
        />
      )}
    </div>
  );
}

