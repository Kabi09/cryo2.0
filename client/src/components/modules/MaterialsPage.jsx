import React from 'react';
import MaterialMasterModule from './MaterialMasterModule';

export default function MaterialsPage({
  materials,
  onSaveMaterial,
  onUpdateMaterial,
  showToast
}) {
  return (
    <div className="module-container">
      <MaterialMasterModule
        materials={materials}
        onSave={onSaveMaterial}
        onUpdate={onUpdateMaterial}
        showToast={showToast}
      />
    </div>
  );
}
