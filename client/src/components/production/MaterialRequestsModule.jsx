import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Package, Plus, Trash2, ArrowRight, Warehouse, Info, Eye, AlertTriangle, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function MaterialRequestsModule({
  materialRequests = [],
  workOrders = [],
  materials = [],
  boms = [],
  inventory = [],
  preSelectedWO = null,
  onSave,
  onNavigateToIssue,
  onNavigateToPurchasing,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMR, setSelectedMR] = useState(null);

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

  // Handle preSelectedWO from Work Orders page
  useEffect(() => {
    if (preSelectedWO) {
      handleSelectWO(preSelectedWO._id);
      setIsModalOpen(true);
    }
  }, [preSelectedWO]);

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
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => setSelectedMR(row)}
        >
          {row.requestNumber}
        </span>
      )
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName || 'Cryo Unit'
    },
    {
      header: 'Materials',
      accessor: 'items',
      render: (row) => `${row.items ? row.items.length : 0} Items`
    },
    {
      header: 'Stock Health',
      render: (row) => {
        const hasShortage = (row.items || []).some(it => (it.availableStock || 0) < (it.requestedQty || it.requiredQty || 0));
        return hasShortage ? (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={11} /> Shortage Detected
          </span>
        ) : (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={11} /> In Stock
          </span>
        );
      }
    },
    {
      header: 'Required By',
      accessor: 'requiredDate',
      render: (row) => (row.requiredDate ? new Date(row.requiredDate).toLocaleDateString('en-GB') : '-')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Pending'} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const hasShortage = (row.items || []).some(it => (it.availableStock || 0) < (it.requestedQty || it.requiredQty || 0));
        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn"
              title="View Material Request Details"
              onClick={() => setSelectedMR(row)}
            >
              <Eye size={15} />
            </button>
            {onNavigateToIssue && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                title="Issue Materials from Store"
                onClick={() => onNavigateToIssue(row)}
              >
                Issue ➔
              </button>
            )}
            {hasShortage && onNavigateToPurchasing && (
              <button
                type="button"
                className="btn btn-warning"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, background: '#D97706', color: '#fff', borderColor: '#B45309' }}
                title="Material Shortage: Order from Supplier"
                onClick={() => onNavigateToPurchasing(row)}
              >
                + Order PO ➔
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="module-container">
      {/* SCM Company Store Connection Banner */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(6, 182, 212, 0.05)' }}>
        <Warehouse size={18} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Unified SCM Company Store:</strong> Material requests connect directly to verified Supply Chain warehouse inventory. When approved, materials are issued via batch-tracked store issue slips.
        </span>
      </div>

      <DataTable
        title="Material Requests to Company Store"
        subtitle="Shop floor material requisitions derived from BOM requirements and Work Order batch quantities"
        columns={columns}
        data={materialRequests}
        onAdd={handleOpenModal}
        addLabel="Create Material Request"
      />

      {/* Create Modal */}
      {isModalOpen && (
        <Modal
          title="Create Material Request to Store"
          subtitle="Generate store requisition for required raw materials from verified Bill of Materials"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header Box */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={16} /> 1. Work Order Reference
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Linked Work Order <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.workOrder}
                      onChange={(e) => handleSelectWO(e.target.value)}
                      required
                    >
                      <option value="">Select Target Work Order</option>
                      {workOrders.map(wo => (
                        <option key={wo._id} value={wo._id}>
                          {wo.workOrderNumber} — {wo.productName} ({wo.productionQuantity} Units) • [{wo.status}]
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
                      style={{ background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Required By Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.requiredDate}
                      onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>2. BOM Material Requirements & Warehouse Stock Check</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {formData.items.length} Materials Required
                  </span>
                </div>

                {formData.items.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Select a Work Order with an active BOM above to auto-populate required raw materials.
                  </div>
                ) : (
                  <div className="subtable-box">
                    <table className="subtable">
                      <thead>
                        <tr>
                          <th>Raw Material</th>
                          <th style={{ textAlign: 'center' }}>BOM Qty</th>
                          <th style={{ textAlign: 'center' }}>Warehouse Stock</th>
                          <th style={{ textAlign: 'center' }}>Request Qty</th>
                          <th style={{ textAlign: 'center' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((row, index) => {
                          const stockOk = (row.availableStock || 0) >= row.requiredQty;
                          return (
                            <tr key={index}>
                              <td>
                                <strong style={{ color: 'var(--text-primary)' }}>{row.materialName}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  {row.materialCode}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                {row.requiredQty}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${stockOk ? 'badge-success' : 'badge-danger'}`}>
                                  {row.availableStock || 0} {row.unit}
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
                    placeholder="Urgent batch dispatch, verify material certificates..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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

      {/* View Material Request Details Modal */}
      {selectedMR && (
        <Modal
          title={`Material Request: ${selectedMR.requestNumber}`}
          subtitle={`Requisition for Work Order ${selectedMR.workOrderNumber}`}
          isOpen={!!selectedMR}
          onClose={() => setSelectedMR(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Request No</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedMR.requestNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedMR.status || 'Pending'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Work Order Ref</div>
                <div className="detail-value">{selectedMR.workOrderNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Product</div>
                <div className="detail-value">{selectedMR.productName || 'Cryo Unit'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Requested Date</div>
                <div className="detail-value">{selectedMR.requestedDate ? new Date(selectedMR.requestedDate).toLocaleDateString('en-GB') : '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Required By</div>
                <div className="detail-value">{selectedMR.requiredDate ? new Date(selectedMR.requiredDate).toLocaleDateString('en-GB') : '-'}</div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Itemized Raw Material Schedule:
              </div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Raw Material</th>
                      <th>Material Code</th>
                      <th>Required Qty</th>
                      <th>Issued Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedMR.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.materialName}</strong></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{it.materialCode}</td>
                        <td style={{ fontWeight: 600 }}>{it.requestedQty || it.requiredQty} {it.unit}</td>
                        <td>{it.alreadyIssuedQty || 0} {it.unit}</td>
                        <td><StatusBadge status={it.status || 'Pending'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedMR(null)}
              >
                Close
              </button>
              {onNavigateToPurchasing && (
                <button
                  type="button"
                  className="btn btn-warning"
                  style={{ background: '#D97706', color: '#fff', borderColor: '#B45309', gap: 6 }}
                  onClick={() => {
                    const mr = selectedMR;
                    setSelectedMR(null);
                    onNavigateToPurchasing(mr);
                  }}
                >
                  <ShoppingCart size={13} /> Order from Supplier (Create PO) ➔
                </button>
              )}
              {onNavigateToIssue && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const mr = selectedMR;
                    setSelectedMR(null);
                    onNavigateToIssue(mr);
                  }}
                >
                  Proceed to Issue Materials ➔
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
