import React, { useState } from 'react';
import MaterialMasterModule from './MaterialMasterModule';
import SupplierMaterialLinkModule from './SupplierMaterialLinkModule';
import { Package, Link as LinkIcon } from 'lucide-react';

export default function MaterialsPage({
  materials,
  suppliers,
  supplierLinks,
  onSaveMaterial,
  onUpdateMaterial,
  onSaveSupplierLink,
  onDeleteSupplierLink,
  showToast,
  defaultTab = 'catalog'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Internal Sub-Tabs Navigation */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Package size={14} style={{ marginRight: 6 }} />
            Raw Material Master ({materials.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <LinkIcon size={14} style={{ marginRight: 6 }} />
            Supplier Material Links ({supplierLinks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'catalog' && (
        <MaterialMasterModule
          materials={materials}
          onSave={onSaveMaterial}
          onUpdate={onUpdateMaterial}
          showToast={showToast}
        />
      )}

      {activeTab === 'links' && (
        <SupplierMaterialLinkModule
          links={supplierLinks}
          suppliers={suppliers}
          materials={materials}
          onSave={onSaveSupplierLink}
          onDelete={onDeleteSupplierLink}
          showToast={showToast}
        />
      )}
    </div>
  );
}

