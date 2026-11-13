import React from 'react';

const statusColorMap = {
  // Common
  'Active': 'badge-success',
  'Inactive': 'badge-neutral',
  'Deactivated': 'badge-neutral',
  'Draft': 'badge-neutral',
  'Pending': 'badge-warning',
  'Approved': 'badge-info',
  'Cancelled': 'badge-danger',

  // SCM PO & GRN
  'Ordered': 'badge-info',
  'Partially Received': 'badge-warning',
  'QC Pending': 'badge-warning',
  'Completed': 'badge-success',

  // QC & QA
  'Pass': 'badge-success',
  'Partial Pass': 'badge-warning',
  'Reject': 'badge-danger',
  'Fail': 'badge-danger',
  'Finished Goods': 'badge-success',
  'Repair Completed': 'badge-success',
  'Re-QA Pending': 'badge-warning',

  // Inventory & Stock
  'In Stock': 'badge-success',
  'Available': 'badge-success',
  'Low Stock': 'badge-warning',
  'Out of Stock': 'badge-danger',
  'Reserved for Dispatch': 'badge-info',

  // SCM Issues & Returns
  'Issued': 'badge-info',
  'Returned': 'badge-success',

  // Sales CRM
  'New': 'badge-info',
  'Contacted': 'badge-info',
  'Qualified': 'badge-success',
  'Proposal Sent': 'badge-info',
  'Negotiation': 'badge-warning',
  'Won': 'badge-success',
  'Lost': 'badge-danger',
  'Paid': 'badge-success',
  'Partially Paid': 'badge-warning',
  'Verified': 'badge-success',

  // Production
  'Planned': 'badge-info',
  'Running': 'badge-info',
  'In Progress': 'badge-info',
  'On Hold': 'badge-warning',
  'Paused': 'badge-warning',
  'Material Pending': 'badge-warning',
  'Material Issued': 'badge-success',
  'QA Pending': 'badge-warning',
  'Rework': 'badge-danger',

  // Logistics & Delivery
  'Dispatched': 'badge-info',
  'In Transit': 'badge-warning',
  'Out for Delivery': 'badge-warning',
  'Delivered': 'badge-success',
  'Accepted': 'badge-success',
  'Damaged / Rejected': 'badge-danger',
  'Scheduled': 'badge-info',
  'Failed - Retest Required': 'badge-danger'
};

export default function StatusBadge({ status }) {
  const badgeClass = statusColorMap[status] || 'badge-neutral';
  return (
    <span className={`badge ${badgeClass}`}>
      <span className="pulse-dot" style={{ width: 6, height: 6 }} />
      {status || 'Unknown'}
    </span>
  );
}
