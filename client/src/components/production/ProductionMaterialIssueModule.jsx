import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Warehouse, CheckCircle2, AlertTriangle, Printer, Layers } from 'lucide-react';

export default function ProductionMaterialIssueModule({
  materialIssues = [],
  materialRequests = [],
  inventory = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialRequest: '',
    requestNumber: '',
    workOrder: '',
    workOrderNumber: '',
    storeLocation: 'Central RM Warehouse - Rack A',
    issueDate: new Date().toISOString().split('T')[0],
    issuedBy: 'Store Keeper Kumar',
    receivedBy: 'Shop Floor Tech Suresh',
    remarks: '',
    items: []
  });

  const handleOpenModal = () => {
    if (materialRequests.length > 0 && !formData.materialRequest) {
      handleSelectRequest(materialRequests[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectRequest = (mrId) => {
    const mr = materialRequests.find(r => r._id === mrId);
    if (!mr) {
      setFormData(prev => ({
        ...prev,
        materialRequest: '',
        requestNumber: '',
        workOrder: '',
        workOrderNumber: '',
        items: []
      }));
      return;
    }

    const issueItems = (mr.items || []).map(item => {
      const matId = item.material?._id || item.material;
      const inv = inventory.find(i => String(i.material?._id || i.material) === String(matId));
      const currentStock = inv ? inv.currentStock : 0;
      const pendingToIssue = Math.max(0, (item.requestedQty || 0) - (item.alreadyIssuedQty || 0));
      const defaultIssueQty = Math.min(pendingToIssue, currentStock);

      return {
        material: matId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        requestedQty: item.requestedQty,
        approvedQty: item.requestedQty,
        availableStock: currentStock,
        issuedQty: defaultIssueQty,
        batchNumber: `BATCH-${item.materialCode || 'RM'}-01`,
        unit: item.unit || 'Nos',
        remarks: ''
      };
    });

    setFormData(prev => ({
      ...prev,
      materialRequest: mr._id,
      requestNumber: mr.requestNumber,
      workOrder: mr.workOrder?._id || mr.workOrder,
      workOrderNumber: mr.workOrderNumber || mr.workOrder?.workOrderNumber || 'WO-001',
      items: issueItems
    }));
  };

  const handleItemQtyChange = (idx, qty) => {
    const updated = [...formData.items];
    const item = updated[idx];
    if (qty > item.availableStock) {
      showToast(`Cannot issue more than available stock (${item.availableStock} ${item.unit})`, 'warning');
      qty = item.availableStock;
    }
    updated[idx] = { ...item, issuedQty: Number(qty) };
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleBatchChange = (idx, batch) => {
    const updated = [...formData.items];
    updated[idx] = { ...updated[idx], batchNumber: batch };
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialRequest) {
      showToast('Please select a Material Request', 'error');
      return;
    }
    if (formData.items.length === 0 || formData.items.some(i => i.issuedQty <= 0)) {
      showToast('Please specify valid issue quantities greater than zero', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Materials issued successfully! Store inventory and stock ledger updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Error issuing materials', 'error');
    }
  };

  const columns = [
    {
      header: 'Issue No',
      accessor: 'issueNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.issueNumber}</span>
    },
    {
      header: 'Request No',
      accessor: 'requestNumber',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.requestNumber || 'MR-001'}</span>
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Store Location',
      accessor: 'storeLocation',
      render: (row) => row.storeLocation
    },
    {
      header: 'Issued Items',
      accessor: 'items',
      render: (row) => `${row.items ? row.items.length : 0} Materials`
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      render: (row) => (row.issueDate ? new Date(row.issueDate).toLocaleDateString() : '-')
    },
    {
      header: 'Issued By',
      accessor: 'issuedBy',
      render: (row) => row.issuedBy
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Issued'} />
    }
  ];

  return (
    <div className="module-container">
      {/* Strict Stock Conservation Rules */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.05)' }}>
        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Inventory Protection Rule:</strong> Materials cannot exceed approved store stock. Once issued, Company Store inventory decreases immediately and records an audit trail in the Stock Ledger.
        </span>
      </div>

      <DataTable
        title="Material Issue from Company Store"
        subtitle="Authorize physical issuance of raw materials from warehouse to production work orders"
        columns={columns}
        data={materialIssues}
        onAdd={handleOpenModal}
        addLabel="Issue Materials"
      />

      {isModalOpen && (
        <Modal
          title="Material Issue Slip (Store to Production)"
          subtitle="Authorize issuance of raw materials against verified store stock and assign batch numbers"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Request & Destination Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Warehouse size={16} /> 1. Request Details & Warehouse Location
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">
                      Select Material Request (MR) <span className="req">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.materialRequest}
                      onChange={(e) => handleSelectRequest(e.target.value)}
                      required
                    >
                      <option value="">Select Pending Material Request</option>
                      {materialRequests.map(mr => (
                        <option key={mr._id} value={mr._id}>
                          {mr.requestNumber} — {mr.productName} ({mr.items?.length || 0} Materials) — [{mr.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Linked Work Order</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.workOrderNumber}
                      readOnly
                      placeholder="Auto-linked from MR"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Store Location <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.storeLocation}
                      onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issue Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issued By (Store Keeper) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.issuedBy}
                      onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Received By (Shop Floor Tech) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.receivedBy}
                      onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Issued Material Rows */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} /> 2. Materials to Issue (Physical Stock Verification)
                  </div>
                  {formData.items.length > 0 && (
                    <span className="badge badge-info">{formData.items.length} Items Loaded</span>
                  )}
                </div>

                {formData.items.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Please select a Material Request above to load itemized raw materials.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '28%' }}>Raw Material</th>
                          <th style={{ textAlign: 'center' }}>Requested</th>
                          <th style={{ textAlign: 'center' }}>Live Store Stock</th>
                          <th style={{ width: '120px', textAlign: 'center' }}>Issue Qty</th>
                          <th style={{ width: '160px' }}>Batch / Heat No</th>
                          <th style={{ textAlign: 'center' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((row, idx) => {
                          const hasStock = row.availableStock >= row.issuedQty;
                          return (
                            <tr key={idx}>
                              <td>
                                <strong style={{ color: '#fff' }}>{row.materialName}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  {row.materialCode}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                {row.requestedQty}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${hasStock ? 'badge-success' : 'badge-danger'}`}>
                                  {row.availableStock} {row.unit}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  min="0.01"
                                  max={row.availableStock}
                                  step="any"
                                  value={row.issuedQty}
                                  onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                  style={{ textAlign: 'center', fontWeight: 700 }}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={row.batchNumber}
                                  onChange={(e) => handleBatchChange(idx, e.target.value)}
                                  placeholder="Batch / Heat No"
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

              {/* Remarks Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Store Dispatch Remarks & Audit Notes</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Dispatched via forklift trolley, signed delivery receipt attached..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={formData.items.length === 0}>
                Confirm Issue (Update Store Inventory)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

