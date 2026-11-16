import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Play, Pause, Square, Factory, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function ProductionExecutionModule({
  executions = [],
  workOrders = [],
  onStart,
  onUpdateStatus,
  onNavigateToCompletion,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    product: '',
    productName: '',
    plannedQty: 10,
    materialsIssued: 'Fully Issued',
    startDateTime: new Date().toISOString().slice(0, 16),
    supervisor: 'Karthik Raja',
    machineWorkstation: 'CNC Lathe Line 1',
    shift: 'Morning',
    operatorName: 'Arun Vijay & Team',
    initialRemarks: 'Production started on schedule. Workstation calibrated.'
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
      plannedQty: wo.productionQuantity || 10
    }));
  };

  const handleStartSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workOrder) {
      showToast('Please select an active Work Order', 'error');
      return;
    }
    try {
      await onStart(formData);
      setIsModalOpen(false);
      showToast('Manufacturing execution started! Work Order set to "Running".', 'success');
    } catch (err) {
      showToast(err.message || 'Error starting execution', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await onUpdateStatus(id, newStatus);
      showToast(`Work Order execution marked as ${newStatus}`, 'info');
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const columns = [
    {
      header: 'Execution No',
      accessor: 'executionNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.executionNumber}</span>
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
      header: 'Planned Qty',
      accessor: 'plannedQty',
      render: (row) => `${row.plannedQty || 0} Units`
    },
    {
      header: 'Workstation',
      accessor: 'machineWorkstation',
      render: (row) => row.machineWorkstation
    },
    {
      header: 'Supervisor / Operator',
      accessor: 'operatorName',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.operatorName} <span style={{ color: 'var(--text-muted)' }}>({row.supervisor})</span>
        </span>
      )
    },
    {
      header: 'Shift',
      accessor: 'shift',
      render: (row) => <span className="font-mono">{row.shift}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Running'} />
    },
    {
      header: 'Execution Controls',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.status === 'Running' ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(row._id, 'Paused')}
              title="Pause Production"
            >
              <Pause size={13} /> Pause
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange(row._id, 'Running')}
              title="Resume Production"
            >
              <Play size={13} /> Resume
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleStatusChange(row._id, 'On Hold')}
            title="Hold"
          >
            Hold
          </button>
          {onNavigateToCompletion && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--success)', borderColor: 'var(--success-border)', gap: 4 }}
              onClick={() => onNavigateToCompletion(row)}
              title="Record Batch Completion"
            >
              <CheckCircle2 size={13} /> Complete ➔
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Production Execution (Shop Floor)"
        subtitle="Real-time control of active manufacturing batches, shift operators, and machine lines"
        columns={columns}
        data={executions}
        onAdd={handleOpenModal}
        addLabel="Start Production Batch"
      />

      {isModalOpen && (
        <Modal
          title="Start Production Execution"
          subtitle="Authorize shop-floor manufacturing launch, station routing, and team assignment"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleStartSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Batch & Work Order Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Play size={16} /> 1. Batch Authorization & Target Work Order
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Active Work Order <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.workOrder}
                      onChange={(e) => handleSelectWO(e.target.value)}
                      required
                    >
                      <option value="">Select Work Order (Ready to Start)</option>
                      {workOrders.map(wo => (
                        <option key={wo._id} value={wo._id}>
                          {wo.workOrderNumber} — {wo.productName} ({wo.productionQuantity} Units) — [{wo.status}]
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
                    <label className="form-label">Planned Batch Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.plannedQty}
                      onChange={(e) => setFormData({ ...formData, plannedQty: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Materials Issued Verification</label>
                    <select
                      className="form-select"
                      value={formData.materialsIssued}
                      onChange={(e) => setFormData({ ...formData, materialsIssued: e.target.value })}
                    >
                      <option value="Fully Issued">Fully Issued (Store Approved)</option>
                      <option value="Partially Issued - Exception Allowed">Partially Issued - Authorized Exception</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date & Time <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.startDateTime}
                      onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Station & Personnel */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Factory size={16} /> 2. Machine Workstation & Personnel
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Operating Shift</label>
                    <select
                      className="form-select"
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="Morning">Morning Shift (08:00 - 16:30)</option>
                      <option value="Evening">Evening Shift (16:30 - 01:00)</option>
                      <option value="Night">Night Shift (01:00 - 08:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Supervisor <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.supervisor}
                      onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lead Operator / Technician <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.operatorName}
                      onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Machine / Workstation Line <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.machineWorkstation}
                      onChange={(e) => setFormData({ ...formData, machineWorkstation: e.target.value })}
                      placeholder="e.g. CNC Workstation 1 (Bay A)"
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Pre-Flight Checklist & Initial Remarks</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.initialRemarks}
                      onChange={(e) => setFormData({ ...formData, initialRemarks: e.target.value })}
                      placeholder="Tool calibration, safety guards verified, emergency stops tested, raw materials verified at station..."
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
                <Play size={14} /> Start Manufacturing Batch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

