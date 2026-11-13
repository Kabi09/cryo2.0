import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Calendar, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export default function ProductionUpdatesModule({
  productionUpdates = [],
  workOrders = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    product: '',
    productName: '',
    updateType: 'Daily',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    supervisorName: 'Karthik Raja',
    plannedQuantity: 10,
    previouslyCompletedQuantity: 0,
    completedQuantity: 5,
    totalCompletedQuantity: 5,
    pendingQuantity: 5,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    workCompletedDescription: 'Assembly and wiring completed for current shift.',
    machineStatus: 'Operational',
    problemsDelays: 'None',
    reasonForDelay: '',
    nextWorkPlan: 'Proceed to next assembly phase.',
    remarks: ''
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

    // Find previous updates for this work order to calculate previously completed
    const prevUpdates = productionUpdates.filter(u =>
      String(u.workOrder?._id || u.workOrder) === String(wo._id)
    );
    const prevCompleted = prevUpdates.reduce((sum, u) => sum + (u.completedQuantity || 0), 0);
    const planned = wo.productionQuantity || 10;
    const todayCompleted = Math.min(5, Math.max(0, planned - prevCompleted));
    const total = prevCompleted + todayCompleted;
    const pending = Math.max(0, planned - total);

    setFormData(prev => ({
      ...prev,
      workOrder: wo._id,
      workOrderNumber: wo.workOrderNumber,
      product: wo.product?._id || wo.product,
      productName: wo.productName,
      plannedQuantity: planned,
      previouslyCompletedQuantity: prevCompleted,
      completedQuantity: todayCompleted,
      totalCompletedQuantity: total,
      pendingQuantity: pending
    }));
  };

  const handleCompletedChange = (val) => {
    const today = Number(val);
    const prev = Number(formData.previouslyCompletedQuantity || 0);
    const planned = Number(formData.plannedQuantity || 0);
    const total = prev + today;
    const pending = Math.max(0, planned - total);

    setFormData(prevData => ({
      ...prevData,
      completedQuantity: today,
      totalCompletedQuantity: total,
      pendingQuantity: pending
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workOrder) {
      showToast('Please select a Work Order', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Daily/Weekly production progress update recorded!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving update', 'error');
    }
  };

  const columns = [
    {
      header: 'Update No',
      accessor: 'updateNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.updateNumber}</span>
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
      header: 'Date',
      accessor: 'fromDate',
      render: (row) => (row.fromDate ? new Date(row.fromDate).toLocaleDateString() : '-')
    },
    {
      header: 'Progress Completed',
      accessor: 'completedQuantity',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#38BDF8' }}>
          +{row.completedQuantity || 0} Units{' '}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            ({row.totalCompletedQuantity}/{row.plannedQuantity} Total)
          </span>
        </span>
      )
    },
    {
      header: 'Pending Qty',
      accessor: 'pendingQuantity',
      render: (row) => `${row.pendingQuantity || 0} Remaining`
    },
    {
      header: 'Issues / Delays',
      accessor: 'problemsDelays',
      render: (row) => (
        <span style={{ color: row.problemsDelays === 'None' ? 'var(--text-secondary)' : 'var(--warning)', fontSize: '0.78rem' }}>
          {row.problemsDelays || 'None'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Updated'} />
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Daily / Weekly Production Updates"
        subtitle="Log shift-wise completed quantities, machine bottlenecks, wastage, and delay reasons"
        columns={columns}
        data={productionUpdates}
        onAdd={handleOpenModal}
        addLabel="Post Production Update"
      />

      {isModalOpen && (
        <Modal
          title="Post Production Progress Update"
          subtitle="Record shift output, stage completions, machine health, and milestone status"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} /> 1. Work Order & Reporting Parameters
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
                      <option value="">Select Running Work Order</option>
                      {workOrders.map(wo => (
                        <option key={wo._id} value={wo._id}>
                          {wo.workOrderNumber} — {wo.productName} ({wo.productionQuantity} Units) — [{wo.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Update Cadence</label>
                    <select
                      className="form-select"
                      value={formData.updateType}
                      onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                    >
                      <option value="Daily">Daily Shift Log</option>
                      <option value="Weekly">Weekly Summary Rollup</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reporting Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Supervisor In-Charge <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.supervisorName}
                      onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Calculation Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                padding: 16,
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Planned Order</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formData.plannedQuantity} Units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Previously Done</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {formData.previouslyCompletedQuantity} Units
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cumulative Completed</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                    {formData.totalCompletedQuantity} Units
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Remaining Pending</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: formData.pendingQuantity === 0 ? 'var(--cyan)' : 'var(--warning)' }}>
                    {formData.pendingQuantity} Units
                  </div>
                </div>
              </div>

              {/* Output & Bottlenecks */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} /> 2. Shift Quantities & Machine Health
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Units Completed in This Shift <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max={formData.plannedQuantity}
                      value={formData.completedQuantity}
                      onChange={(e) => handleCompletedChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scrapped / Rejected Units</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.rejectedQuantity}
                      onChange={(e) => setFormData({ ...formData, rejectedQuantity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Machine / Line Status</label>
                    <select
                      className="form-select"
                      value={formData.machineStatus}
                      onChange={(e) => setFormData({ ...formData, machineStatus: e.target.value })}
                    >
                      <option value="Operational">Operational (Normal Throughput)</option>
                      <option value="Minor Bottleneck">Minor Bottleneck (Reduced Rate)</option>
                      <option value="Maintenance Required">Maintenance Scheduled</option>
                      <option value="Halted">Halted / Machine Breakdown</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bottlenecks / Root Causes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.problemsDelays}
                      onChange={(e) => setFormData({ ...formData, problemsDelays: e.target.value })}
                      placeholder="e.g. None, or Sensor calibration drift"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Shift Accomplishments & Work Completed <span className="req">*</span></label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.workCompletedDescription}
                      onChange={(e) => setFormData({ ...formData, workCompletedDescription: e.target.value })}
                      placeholder="Detailed breakdown of components assembled, torqued, and tested..."
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Next Shift Handover Plan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nextWorkPlan}
                      onChange={(e) => setFormData({ ...formData, nextWorkPlan: e.target.value })}
                      placeholder="e.g. Send 10 completed assemblies for QA testing"
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
                Save Progress Update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

