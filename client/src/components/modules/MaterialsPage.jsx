import React from 'react';
import MaterialMasterModule from './MaterialMasterModule';

export default function MaterialsPage({
  materials = [],
  suppliers = [],
  supplierLinks = [],
  onSaveMaterial,
  onUpdateMaterial,
  onNavigateToPO,
  onNavigateToSupplierLinks,
  showToast
}) {
  return (
    <div className="module-container">
      <MaterialMasterModule
        materials={materials}
        suppliers={suppliers}
        supplierLinks={supplierLinks}
        onSave={onSaveMaterial}
        onUpdate={onUpdateMaterial}
        onNavigateToPO={onNavigateToPO}
        onNavigateToSupplierLinks={onNavigateToSupplierLinks}
        showToast={showToast}
      />
    </div>
  );
}
