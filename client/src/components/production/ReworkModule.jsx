import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { RotateCcw, Wrench, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ReworkModule({
  reworkOrders = [],
  workOrders = [],
  onSave,
  onUpdateStatus,
  onSendForReQA,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedRework, setSelectedRework] = useState(null);

  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: 'WO-001',
    product: '',
    productName: 'Machine A',
    serialNumber: 'MA-009, MA-010',
    reworkQuantity: 2,
    defectDescription: 'Thermal reading 72°C and optical sensor misaligned.',
    failureReason: 'Cooling fan wire loose and thermal paste degraded.',
    reworkType: 'Repair',
    priority: 'High',
    assignedTechnician: 'Muthuvel (Lead Service Tech)',
    problemIdentified: 'Thermal interface paste dried; fan bracket loose.',
    repairAction: 'Reapplied compound, tightened bracket, replaced jumper cable.',
    replacementMaterials: '1x thermal paste, 1x cooling fan jumper cable',
    technicianRemarks: 'Bench tested for 30 min. Operating steady at 48°C. Ready for Re-QA.',
    retestRequired: true
  });

  const [actionData, setActionData] = useState({
    status: 'Repair Completed',
    repairAction: '',
    problemIdentified: '',
    replacementMaterials: '',
    technicianRemarks: ''
  });

  const handleOpenModal = () => {
    if (workOrders.length > 0 && !formData.workOrder) {
      const wo = workOrders[0];
      setFormData(prev => ({
        ...prev,
        workOrder: wo._id,
        workOrderNumber: wo.workOrderNumber,
        product: wo.product?._id || wo.product || '',
        productName: wo.productName || ''
      }));
    }
    setIsModalOpen(true);
  };

  const handleOpenActionModal = (row) => {
    setSelectedRework(row);
    setActionData({
      status: 'Repair Completed',
      repairAction: row.repairAction || 'Replaced defective sensor and recalibrated cooling circuit.',
      problemIdentified: row.problemIdentified || row.defectDescription || 'Sensor offset',
      replacementMaterials: row.replacementMaterials || '1x Optical sensor, 1x fan cable',
      technicianRemarks: row.technicianRemarks || 'Repaired and bench-verified for 30 minutes.'
    });
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRework) return;

    try {
      await onUpdateStatus(selectedRework._id, {
        status: actionData.status,
        repairAction: actionData.repairAction,
        problemIdentified: actionData.problemIdentified,
        replacementMaterials: actionData.replacementMaterials,
        technicianRemarks: actionData.technicianRemarks
      });
      setIsActionModalOpen(false);
      showToast('Rework repair updated! Unit sent for Quality Re-Testing (Re-QA).', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating rework status', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Rework order logged! Assigned to technician bay.', 'success');
    } catch (err) {
      showToast(err.message || 'Error creating rework order', 'error');
    }
  };

  const columns = [
    {
      header: 'Rework No',
      accessor: 'reworkNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.reworkNumber}</span>
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Units',
      accessor: 'reworkQuantity',
      render: (row) => `${row.reworkQuantity || 1} Units`
    },
    {
      header: 'Identified Defect',
      accessor: 'defectDescription',
      render: (row) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.defectDescription}</span>
    },
    {
      header: 'Technician',
      accessor: 'assignedTechnician',
      render: (row) => row.assignedTechnician
    },
    {
      header: 'Retest Status',
      accessor: 'retestStatus',
      render: (row) => <StatusBadge status={row.retestStatus || 'Pending'} />
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Pending'} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleOpenActionModal(row)}
          title="Update repair and send for Re-QA"
        >
          <Wrench size={13} /> Update / Re-QA
        </button>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* Rework Loop Info Card */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RotateCcw size={20} style={{ color: 'var(--danger)' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Closed-Loop Defect Remediation:</strong> Failed QA units are repaired and re-tested in a controlled cycle. Failed products <strong>cannot enter Finished Goods</strong> until a passing Re-QA record is generated.
          </div>
        </div>
      </div>

      <DataTable
        title="Rework, Rebuild & Defect Rectification"
        subtitle="Manage failed product repairs, replacement parts, and technician sign-offs before QA re-testing"
        columns={columns}
        data={reworkOrders}
        onAdd={handleOpenModal}
        addLabel="Manual Rework Order"
      />

      {/* Update Rework Action Modal */}
      {isActionModalOpen && (
        <Modal
          title={`Update Rework Order: ${selectedRework?.reworkNumber}`}
          subtitle="Record technician repair activities, replacement parts used, and benchmark bench verification"
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleActionSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wrench size={16} /> 1. Diagnostic & Action Log
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Problem Identified on Bench <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={actionData.problemIdentified}
                      onChange={(e) => setActionData({ ...actionData, problemIdentified: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Repair Action Taken <span className="req">*</span></label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={actionData.repairAction}
                      onChange={(e) => setActionData({ ...actionData, repairAction: e.target.value })}
                      placeholder="e.g. Reapplied compound, tightened fan bracket, calibrated optical sensor..."
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Replacement Materials / Spare Parts Used</label>
                    <input
                      type="text"
                      className="form-input"
                      value={actionData.replacementMaterials}
                      onChange={(e) => setActionData({ ...actionData, replacementMaterials: e.target.value })}
                      placeholder="e.g. 1x sensor, 1x fan cable from spare store"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Rework Bay Status</label>
                    <select
                      className="form-select"
                      value={actionData.status}
                      onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                    >
                      <option value="In Progress">In Progress (Under Repair)</option>
                      <option value="Repair Completed">Repair Completed (Ready for Re-QA)</option>
                      <option value="Re-QA Pending">Send for Re-QA Testing</option>
                      <option value="Passed">Passed Re-QA</option>
                      <option value="Scrapped">Scrapped / Irreparable</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Technician Sign-Off Remarks</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={actionData.technicianRemarks}
                      onChange={(e) => setActionData({ ...actionData, technicianRemarks: e.target.value })}
                      placeholder="Bench test duration, temperature readings, stability verified..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsActionModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <ShieldCheck size={14} /> Complete Repair & Send for Re-QA
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Manual Rework Modal */}
      {isModalOpen && (
        <Modal
          title="Create Rework / Rebuild Order"
          subtitle="Initiate defect rectification loop for failed assemblies"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleCreateSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={16} /> 1. Work Order & Defect Details
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Select Work Order <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.workOrder}
                      onChange={(e) => {
                        const wo = workOrders.find(w => w._id === e.target.value);
                        setFormData({
                          ...formData,
                          workOrder: e.target.value,
                          workOrderNumber: wo ? wo.workOrderNumber : '',
                          product: wo?.product?._id || wo?.product || '',
                          productName: wo?.productName || ''
                        });
                      }}
                      required
                    >
                      <option value="">Select Work Order</option>
                      {workOrders.map(wo => (
                        <option key={wo._id} value={wo._id}>
                          {wo.workOrderNumber} — {wo.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      placeholder="Auto-linked from WO"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial / Batch Number <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity to Rework <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.reworkQuantity}
                      onChange={(e) => setFormData({ ...formData, reworkQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rework Type</label>
                    <select
                      className="form-select"
                      value={formData.reworkType}
                      onChange={(e) => setFormData({ ...formData, reworkType: e.target.value })}
                    >
                      <option value="Repair">Component Repair</option>
                      <option value="Rebuild">Sub-Assembly Rebuild</option>
                      <option value="Component Replacement">Component Replacement</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Assigned Lead Technician <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.assignedTechnician}
                      onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Defect Description <span className="req">*</span></label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.defectDescription}
                      onChange={(e) => setFormData({ ...formData, defectDescription: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Rework Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

