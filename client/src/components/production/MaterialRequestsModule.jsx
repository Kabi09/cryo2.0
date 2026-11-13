import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Package, Plus, Trash2, ArrowRight, Warehouse, Info } from 'lucide-react';

export default function MaterialRequestsModule({
  materialRequests = [],
  workOrders = [],
  materials = [],
  boms = [],
  inventory = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    product: '',
    productName: '',
    requestedDate: new Date().toISOString().split('T')[0],
    requiredDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    requestedBy: 'Karthik Raja',
    department: 'Production Assembly',
    remarks: '',
    items: []
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

    // Look for matching BOM
    const matchingBOM = boms.find(b =>
      String(b.product?._id || b.product) === String(wo.product?._id || wo.product)
    );

    let calculatedItems = [];
    if (matchingBOM && matchingBOM.materials) {
      calculatedItems = matchingBOM.materials.map(bm => {
        const matId = bm.material?._id || bm.material;
        const inv = inventory.find(i => String(i.material?._id || i.material) === String(matId));
        const required = (bm.quantityPerUnit || 1) * (wo.productionQuantity || 1);
        const stock = inv ? inv.currentStock : 0;

        return {
          material: matId,
          materialCode: bm.materialCode,
          materialName: bm.materialName,
          requiredQty: required,
          availableStock: stock,
          alreadyIssuedQty: 0,
          requestedQty: required,
          remainingQty: required,
          unit: bm.unit || 'Nos',
          status: 'Pending'
        };
      });
    }

    setFormData(prev => ({
      ...prev,
      workOrder: wo._id,
      workOrderNumber: wo.workOrderNumber,
      product: wo.product?._id || wo.product,
      productName: wo.productName,
      items: calculatedItems
    }));
  };

  const handleItemFieldChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workOrder) {
      showToast('Please select a Work Order', 'error');
      return;
    }
    if (formData.items.length === 0) {
      showToast('No materials to request. Please verify Work Order and BOM.', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Material Request sent to Company Store! Work Order marked "Waiting for Materials".', 'success');
    } catch (err) {
      showToast(err.message || 'Error creating Material Request', 'error');
    }
  };

  const columns = [
    {
      header: 'Request No',
      accessor: 'requestNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.requestNumber}</span>
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
      header: 'Requested Items',
      accessor: 'items',
      render: (row) => `${row.items ? row.items.length : 0} Materials`
    },
    {
      header: 'Required By',
      accessor: 'requiredDate',
      render: (row) => (row.requiredDate ? new Date(row.requiredDate).toLocaleDateString() : '-')
    },
    {
      header: 'Requested By',
      accessor: 'requestedBy',
      render: (row) => row.requestedBy
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Pending'} />
    }
  ];

  return (
    <div className="module-container">
      {/* SCM Company Store Connection Banner */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(6, 182, 212, 0.05)' }}>
        <Warehouse size={18} style={{ color: 'var(--cyan)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Unified Company Store:</strong> Material requests connect directly to the Supply Chain inventory database. No separate duplicate stock database. Store verifies stock and issues with batch control.
        </span>
      </div>

      <DataTable
        title="Material Requests to Company Store"
        subtitle="Shop floor material requisition based on Bill of Materials and Work Order batch quantities"
        columns={columns}
        data={materialRequests}
        onAdd={handleOpenModal}
        addLabel="Create Material Request"
      />

      {isModalOpen && (
        <Modal
          title="Create Material Request (MR)"
          subtitle="Generate store requisition ticket based on production quantities and locked BOM"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Work Order Specification */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} /> 1. Work Order Association
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
                      placeholder="Auto-derived from WO"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Request Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.requestedDate}
                      onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Required On-Site Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.requiredDate}
                      onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested By (Supervisor) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.requestedBy}
                      onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Shop Floor Department <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Material Breakdown Table */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} /> 2. BOM-Calculated Raw Materials for Issuance
                  </div>
                  {formData.items.length > 0 && (
                    <span className="badge badge-info">{formData.items.length} Materials Required</span>
                  )}
                </div>

                {formData.items.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Please select a Work Order above to automatically load required materials from BOM.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '35%' }}>Material</th>
                          <th style={{ textAlign: 'center' }}>Required Qty</th>
                          <th style={{ textAlign: 'center' }}>Available in Store</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Requested Qty</th>
                          <th style={{ textAlign: 'center' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((row, index) => {
                          const stockOk = row.availableStock >= row.requiredQty;
                          return (
                            <tr key={index}>
                              <td>
                                <strong style={{ color: '#fff' }}>{row.materialName}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  {row.materialCode}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                {row.requiredQty}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${stockOk ? 'badge-success' : 'badge-danger'}`}>
                                  {row.availableStock} {row.unit}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  step="any"
                                  min="0.01"
                                  value={row.requestedQty}
                                  onChange={(e) => handleItemFieldChange(index, 'requestedQty', Number(e.target.value))}
                                  style={{ textAlign: 'center', fontWeight: 700 }}
                                  required
                                />
                              </td>
                              <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                {row.unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Material Request Remarks</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Urgent batch dispatch, verify heat treatment certificates..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={formData.items.length === 0}>
                Submit Material Request to Store
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

