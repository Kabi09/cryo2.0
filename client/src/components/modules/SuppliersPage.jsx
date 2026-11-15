import React, { useState, useEffect } from 'react';
import { Building2, Link2 } from 'lucide-react';
import SuppliersModule from './SuppliersModule';
import SupplierMaterialLinkModule from './SupplierMaterialLinkModule';

export default function SuppliersPage({
  suppliers = [],
  materials = [],
  supplierLinks = [],
  purchaseOrders = [],
  onSaveSupplier,
  onUpdateSupplier,
  onSaveSupplierLink,
  onUpdateSupplierLink,
  onNavigateToPO,
  showToast,
  defaultTab = 'suppliers'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <div className="module-container">
      {/* SCM Suppliers Sub-Tabs Navigation */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <Building2 size={14} style={{ marginRight: 6 }} />
            Suppliers ({suppliers.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <Link2 size={14} style={{ marginRight: 6 }} />
            Supplier Material Links ({supplierLinks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <SuppliersModule
          suppliers={suppliers}
          materials={materials}
          supplierLinks={supplierLinks}
          purchaseOrders={purchaseOrders}
          onSave={onSaveSupplier}
          onUpdate={onUpdateSupplier}
          onNavigateToPO={onNavigateToPO}
          showToast={showToast}
        />
      )}

      {/* Tab 2: Supplier Material Links */}
      {activeTab === 'links' && (
        <SupplierMaterialLinkModule
          links={supplierLinks}
          suppliers={suppliers}
          materials={materials}
          onSave={onSaveSupplierLink}
          onUpdate={onUpdateSupplierLink}
          showToast={showToast}
        />
      )}
    </div>
  );
}
