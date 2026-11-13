import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { CheckCircle2, ShieldCheck, Factory, AlertCircle } from 'lucide-react';

export default function ProductionCompletionModule({
  completions = [],
  workOrders = [],
  onSave,
  onNavigateToQA,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    product: '',
    productName: '',
    plannedQuantity: 10,
    producedQuantity: 10,
    acceptedDuringProduction: 10,
    rejectedQuantity: 0,
    actualStartDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    actualCompletionDate: new Date().toISOString().split('T')[0],
    productionSupervisor: 'Karthik Raja',
    remainingMaterial: 'Returned to Company Store',
    remarks: 'Full batch manufacturing complete. Handed over to QA department for functional testing.'
  });

  const handleOpenModal = () => {
    if (workOrders.length > 0 && !formData.workOrder) {
      handleSelectWO(workOrders[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectWO = (woId) => {
    const wo = workOrders.find(w => w._id === woId);
    if (!wo) return;

    setFormData(prev => ({
      ...prev,
      workOrder: wo._id,
      workOrderNumber: wo.workOrderNumber,
      product: wo.product?._id || wo.product,
      productName: wo.productName,
      plannedQuantity: wo.productionQuantity || 10,
      producedQuantity: wo.productionQuantity || 10,
      acceptedDuringProduction: wo.productionQuantity || 10,
      actualStartDate: wo.plannedStartDate ? new Date(wo.plannedStartDate).toISOString().split('T')[0] : prev.actualStartDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workOrder) {
      showToast('Please select a completed Work Order', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Production Completion recorded! Product routed to Quality Assurance (QA).', 'success');
    } catch (err) {
      showToast(err.message || 'Error recording completion', 'error');
    }
  };

  const columns = [
    {
      header: 'Completion No',
      accessor: 'completionNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.completionNumber}</span>
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
      header: 'Produced Qty',
      accessor: 'producedQuantity',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#10B981' }}>
          {row.producedQuantity || 0} / {row.plannedQuantity} Units
        </span>
      )
    },
    {
      header: 'Completed On',
      accessor: 'actualCompletionDate',
      render: (row) => (row.actualCompletionDate ? new Date(row.actualCompletionDate).toLocaleDateString() : '-')
    },
    {
      header: 'Supervisor',
      accessor: 'productionSupervisor',
      render: (row) => row.productionSupervisor
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'QA Pending'} />
    },
    {
      header: 'Next Stage',
      accessor: '_id',
      render: (row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onNavigateToQA && onNavigateToQA(row)}
          title="Send to Quality Testing"
        >
          <ShieldCheck size={13} /> QA Test
        </button>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* QA Prerequisite Rule Alert */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99, 102, 241, 0.05)' }}>
        <AlertCircle size={18} style={{ color: 'var(--cyan)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Quality Gate Rule:</strong> Production Complete marks physical assembly finished, but products <strong>cannot enter Finished Goods warehouse</strong> until Quality Assurance (QA) tests and approves working condition.
        </span>
      </div>

      <DataTable
        title="Production Completion & QA Handover"
        subtitle="Sign off manufactured batches and transfer directly to Quality Assurance testing"
        columns={columns}
        data={completions}
        onAdd={handleOpenModal}
        addLabel="Sign Off Completion"
      />

      {isModalOpen && (
        <Modal
          title="Sign Off Production Completion"
          subtitle="Finalize shop floor manufacturing sign-off and dispatch batch for Quality Assurance"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Batch Identification */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageCheck size={16} /> 1. Work Order Batch & Quantities
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Completed Work Order <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.workOrder}
                      onChange={(e) => handleSelectWO(e.target.value)}
                      required
                    >
                      <option value="">Select Work Order to Complete</option>
                      {workOrders.map(wo => (
                        <option key={wo._id} value={wo._id}>
                          {wo.workOrderNumber} — {wo.productName} ({wo.productionQuantity} Units) — [{wo.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manufactured Product</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      placeholder="Auto-linked from WO"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Order Qty</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.plannedQuantity}
                      readOnly
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Units Manufactured <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.producedQuantity}
                      onChange={(e) => setFormData({ ...formData, producedQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Accepted During Assembly <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.acceptedDuringProduction}
                      onChange={(e) => setFormData({ ...formData, acceptedDuringProduction: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Scrapped / Rejected in Production</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.rejectedQuantity}
                      onChange={(e) => setFormData({ ...formData, rejectedQuantity: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Reconciliation */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} /> 2. Dates, Supervisor Sign-Off & Store Reconciliation
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Actual Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.actualStartDate}
                      onChange={(e) => setFormData({ ...formData, actualStartDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Actual Completion Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.actualCompletionDate}
                      onChange={(e) => setFormData({ ...formData, actualCompletionDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Production Supervisor Sign-Off <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productionSupervisor}
                      onChange={(e) => setFormData({ ...formData, productionSupervisor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Remaining Material Store Reconciliation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.remainingMaterial}
                      onChange={(e) => setFormData({ ...formData, remainingMaterial: e.target.value })}
                      placeholder="e.g. Returned 2kg sheet and 3m wiring back to Store RM Rack"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Production Handover Remarks</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Notes on tolerance, lubrication, cleanliness, ready for functional testing..."
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
                <ShieldCheck size={14} /> Submit Batch for QA Functional Testing
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

