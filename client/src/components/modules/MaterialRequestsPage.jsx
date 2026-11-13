import React from 'react';
import MaterialIssueModule from './MaterialIssueModule';

export default function MaterialRequestsPage({
  materialIssues,
  materials,
  inventory,
  onSaveMaterialIssue,
  showToast
}) {
  return (
    <div className="module-container">
      <MaterialIssueModule
        materialIssues={materialIssues}
        materials={materials}
        inventory={inventory}
        onSave={onSaveMaterialIssue}
        showToast={showToast}
      />
    </div>
  );
}

