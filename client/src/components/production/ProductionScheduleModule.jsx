import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Clock, Plus, Trash2, User, Layers } from 'lucide-react';

export default function ProductionScheduleModule({
  schedules = [],
  workOrders = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    product: '',
    productName: '',
    plannedQuantity: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    durationDays: 10,
    workingDays: 10,
    supervisor: 'Karthik Raja',
    shift: 'Morning',
    workInstructions: 'Standard SOP-44: Precision machining, torque tightening to 45Nm, wiring color-coded.',
    activities: [
      { activityName: 'Sheet Metal Cutting & Bending', durationDays: 2, status: 'Completed' },
      { activityName: 'Chassis & Sub-Assembly', durationDays: 4, status: 'In Progress' },
      { activityName: 'Motor & Sensor Wiring', durationDays: 2, status: 'Pending' },
      { activityName: 'Pre-Inspection Calibration', durationDays: 2, status: 'Pending' }
    ],
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

    const start = new Date(wo.plannedStartDate || Date.now());
    const end = new Date(wo.expectedCompletionDate || (Date.now() + 10 * 86400000));
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    setFormData(prev => ({
      ...prev,
      workOrder: wo._id,
      product: wo.product?._id || wo.product || '',
      productName: wo.productName || 'Machine',
      plannedQuantity: wo.productionQuantity || 10,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      durationDays: diffDays,
      workingDays: diffDays
    }));
  };

  const handleAddActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { activityName: 'Sub-Assembly Stage', durationDays: 1, status: 'Pending' }
      ]
    }));
  };

  const handleRemoveActivity = (idx) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== idx)
    }));
  };

  const handleActivityChange = (idx, field, val) => {
    const updated = [...formData.activities];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData(prev => ({ ...prev, activities: updated }));
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
      showToast('Production schedule saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving schedule', 'error');
    }
  };

  const columns = [
    {
      header: 'Schedule No',
      accessor: 'scheduleNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.scheduleNumber}</span>
    },
    {
      header: 'WO No',
      accessor: 'workOrder',
      render: (row) => <span className="font-mono">{row.workOrder?.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (row) => (row.startDate ? new Date(row.startDate).toLocaleDateString() : '-')
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (row) => (row.endDate ? new Date(row.endDate).toLocaleDateString() : '-')
    },
    {
      header: 'Duration',
      accessor: 'durationDays',
      render: (row) => `${row.durationDays || 0} Days`
    },
    {
      header: 'Shift',
      accessor: 'shift',
      render: (row) => <span className="font-mono" style={{ color: '#A5B4FC' }}>{row.shift || 'Morning'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Production Schedule & Activity Routing"
        subtitle="Manage shop floor manufacturing duration, shifts, and sub-assembly milestones"
        columns={columns}
        data={schedules}
        onAdd={handleOpenModal}
        addLabel="Create Schedule"
      />

      {isModalOpen && (
        <Modal
          title="Create Production Schedule"
          subtitle="Define timeline, shift allocation, and stage milestones for work order execution"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Scheduling Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} /> 1. Timeline & Shift Allocation
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Work Order Number <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.workOrder}
                      onChange={(e) => handleSelectWO(e.target.value)}
                      required
                    >
                      <option value="">Select Work Order</option>
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
                    <label className="form-label">Production Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected End Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Duration (Days) <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      required
                    />
                  </div>

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
                </div>
              </div>

              {/* Activity Breakdown Table */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} /> 2. Manufacturing Activity Breakdown (Milestones)
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddActivity}
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Activity Name</th>
                        <th style={{ width: '22%', textAlign: 'center' }}>Duration (Days)</th>
                        <th style={{ width: '20%' }}>Stage Status</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.activities.map((act, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={act.activityName}
                              onChange={(e) => handleActivityChange(idx, 'activityName', e.target.value)}
                              placeholder="e.g. Sub-Assembly, Wiring Harness, Chassis Mounting"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              min="1"
                              value={act.durationDays}
                              onChange={(e) => handleActivityChange(idx, 'durationDays', Number(e.target.value))}
                              style={{ textAlign: 'center', fontWeight: 700 }}
                              required
                            />
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={act.status}
                              onChange={(e) => handleActivityChange(idx, 'status', e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="icon-btn"
                              style={{ color: 'var(--danger)', margin: '0 auto' }}
                              onClick={() => handleRemoveActivity(idx)}
                              title="Delete Activity"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SOP & Remarks */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Work Instructions / Standard Operating Procedure (SOP)</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    value={formData.workInstructions}
                    onChange={(e) => setFormData({ ...formData, workInstructions: e.target.value })}
                    placeholder="Specific assembly instructions, torque values, safety protocols, staging bay..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Publish Production Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

