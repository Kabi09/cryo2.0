import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Warehouse, CheckCircle2, AlertTriangle, Printer, Layers, Eye, Factory } from 'lucide-react';

export default function ProductionMaterialIssueModule({
  materialIssues = [],
  materialRequests = [],
  inventory = [],
  preSelectedRequest = null,
  onClearPreSelectedRequest,
  onNavigateToManufacturing,
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  useEffect(() => {
    if (preSelectedRequest) {
      const mrId = preSelectedRequest._id || preSelectedRequest;
      handleSelectRequest(mrId);
      setIsModalOpen(true);
      onClearPreSelectedRequest?.();
    }
  }, [preSelectedRequest]);

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
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => setSelectedIssue(row)}
        >
          {row.issueNumber}
        </span>
      )
    },
    {
      header: 'Request No',
      accessor: 'requestNumber',
      render: (row) => <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{row.requestNumber || 'MR-001'}</span>
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
      render: (row) => (row.issueDate ? new Date(row.issueDate).toLocaleDateString('en-GB') : '-')
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
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="icon-btn"
            title="View Issue Slip Details"
            onClick={() => setSelectedIssue(row)}
          >
            <Eye size={15} />
          </button>
          {onNavigateToManufacturing && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
              title="Proceed to Shopfloor Assembly"
              onClick={() => onNavigateToManufacturing(row.workOrder)}
            >
              <Factory size={12} /> Assembly ➔
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* Strict Stock Conservation Rules */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.05)' }}>
        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Inventory Protection Rule:</strong> Materials cannot exceed approved warehouse stock. Once issued, Company Store inventory decreases immediately and records an audit trail in the Stock Ledger.
        </span>
      </div>

      <DataTable
        title="Material Issue Slips"
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
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Warehouse size={16} /> 1. Requisition & Work Order Particulars
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Material Request Reference <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.materialRequest}
                      onChange={(e) => handleSelectRequest(e.target.value)}
                      required
                    >
                      <option value="">Select Pending Material Request</option>
                      {materialRequests.map(mr => (
                        <option key={mr._id} value={mr._id}>
                          {mr.requestNumber} — {mr.workOrderNumber} ({mr.productName}) • [{mr.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Order Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.workOrderNumber}
                      readOnly
                      style={{ background: 'var(--bg-surface)' }}
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
                    <label className="form-label">Issued By <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.issuedBy}
                      onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Received By (Tech) <span className="req">*</span></label>
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

              {/* Items Table */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                  2. Materials to Issue & Lot / Batch Allocation
                </div>

                {formData.items.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Select a Material Request above to load line items.
                  </div>
                ) : (
                  <div className="subtable-box">
                    <table className="subtable">
                      <thead>
                        <tr>
                          <th>Raw Material</th>
                          <th style={{ textAlign: 'center' }}>Available</th>
                          <th style={{ textAlign: 'center' }}>Issue Qty</th>
                          <th>Batch / Heat No</th>
                          <th style={{ textAlign: 'center' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: 'var(--text-primary)' }}>{row.materialName}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.materialCode}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge badge-info">{row.availableStock} {row.unit}</span>
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
                        ))}
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

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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

      {/* View Issue Slip Details Modal */}
      {selectedIssue && (
        <Modal
          title={`Material Issue Slip: ${selectedIssue.issueNumber}`}
          subtitle={`Dispatched from ${selectedIssue.storeLocation} to ${selectedIssue.workOrderNumber}`}
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Issue Slip No</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedIssue.issueNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedIssue.status || 'Issued'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Work Order Ref</div>
                <div className="detail-value">{selectedIssue.workOrderNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Request Ref</div>
                <div className="detail-value">{selectedIssue.requestNumber || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Issue Date</div>
                <div className="detail-value">{selectedIssue.issueDate ? new Date(selectedIssue.issueDate).toLocaleDateString('en-GB') : '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Store Location</div>
                <div className="detail-value">{selectedIssue.storeLocation}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Issued By</div>
                <div className="detail-value">{selectedIssue.issuedBy}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Received By</div>
                <div className="detail-value">{selectedIssue.receivedBy}</div>
              </div>
            </div>

            {/* Issued Items */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Issued Materials & Batch Allocation:
              </div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Raw Material</th>
                      <th>Material Code</th>
                      <th>Issued Qty</th>
                      <th>Allocated Batch / Heat No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedIssue.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.materialName}</strong></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{it.materialCode}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                          {it.issuedQty} {it.unit}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{it.batchNumber || 'STANDARD-BATCH'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {onNavigateToManufacturing && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ gap: 6 }}
                    onClick={() => {
                      const wo = selectedIssue.workOrder;
                      setSelectedIssue(null);
                      onNavigateToManufacturing(wo);
                    }}
                  >
                    <Factory size={14} /> Proceed to Shopfloor Assembly ➔
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedIssue(null)}
              >
                Close Slip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
