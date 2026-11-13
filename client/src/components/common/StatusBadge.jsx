import React from 'react';

const statusColorMap = {
  // Common
  'Active': 'badge-success',
  'Inactive': 'badge-neutral',
  'Draft': 'badge-neutral',
  'Pending': 'badge-warning',
  'Approved': 'badge-info',
  'Cancelled': 'badge-danger',

  // PO & GRN
  'Partially Received': 'badge-warning',
  'QC Pending': 'badge-warning',
  'Completed': 'badge-success',

  // QC
  'Pass': 'badge-success',
  'Partial Pass': 'badge-warning',
  'Reject': 'badge-danger',

  // Inventory
  'In Stock': 'badge-success',
  'Available': 'badge-success',
  'Low Stock': 'badge-warning',
  'Out of Stock': 'badge-danger',

  // Issues & Returns
  'Issued': 'badge-info',
  'Returned': 'badge-success'
};

export default function StatusBadge({ status }) {
  const badgeClass = statusColorMap[status] || 'badge-neutral';
  return (
    <span className={`badge ${badgeClass}`}>
      <span className="pulse-dot" style={{ width: 5, height: 5 }} />
      {status || 'Unknown'}
    </span>
  );
}

