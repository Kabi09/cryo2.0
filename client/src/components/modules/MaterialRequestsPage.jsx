import React, { useState, useEffect } from 'react';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import {
  ClipboardList,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Boxes,
  Plus,
  ArrowRight,
  PackageCheck,
  Clock,
  Send,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function MaterialRequestsPage({
  materialIssues = [],
  materials = [],
  inventory = [],
  materialRequests = [],
  workOrders = [],
  suppliers = [],
  purchaseOrders = [],
  grns = [],
  onSaveMaterialIssue,
  onSavePurchaseOrder,
  onSaveGRN,
  showToast,
  defaultTab = 'requests'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'issues' ? 'issue' : defaultTab === 'purchase' ? 'purchase' : defaultTab === 'history' ? 'history' : 'requests');
  const [selectedMR, setSelectedMR] = useState(null);
  const [viewRequestModal, setViewRequestModal] = useState(null);

  // Purchase Order modal state
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poFormData, setPoFormData] = useState({
    supplier: '',
    material: '',
    quantity: 10,
    unitPrice: 80,
    expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  // GRN Modal state
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [grnFormData, setGrnFormData] = useState({
    purchaseOrder: '',
    invoiceNumber: '',
    receivedQuantity: 10,
    remarks: ''
  });

  // Simple Material Issue Form State
  const [issueForm, setIssueForm] = useState({
    materialRequestId: '',
    requestNumber: '',
    workOrder: '',
    material: '',
    materialName: '',
    unit: 'Kg',
    requiredQuantity: 0,
    availableStock: 0,
    alreadyIssued: 0,
    issueQuantity: 0,
    balanceQuantity: 0,
    batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    issuedBy: 'Selvam (Store Officer)',
    requestedBy: 'Production Supervisor',
    department: 'Assembly',
    remarks: ''
  });

  useEffect(() => {
    if (defaultTab) {
      if (defaultTab === 'issues' || defaultTab === 'issue') setActiveTab('issue');
      else if (defaultTab === 'purchase') setActiveTab('purchase');
      else if (defaultTab === 'history') setActiveTab('history');
      else setActiveTab('requests');
    }
  }, [defaultTab]);

  // Helper to get available stock from store inventory
  const getAvailableStock = (matId) => {
    const inv = (inventory || []).find(i => String(i.material?._id || i.material) === String(matId));
    return inv ? (inv.availableStock !== undefined ? inv.availableStock : inv.currentStock || 0) : 0;
  };

  // Populate Simple Issue Form when a Material Request is selected
  const handleSelectRequestForIssue = (req, targetMatId = null) => {
    if (!req) return;
    setSelectedMR(req);

    const items = req.items || [];
    const item = targetMatId
      ? items.find(it => String(it.material?._id || it.material) === String(targetMatId)) || items[0]
      : items[0];

    if (!item) {
      showToast('This requisition has no items', 'warning');
      return;
    }

    const matId = item.material?._id || item.material;
    const avail = getAvailableStock(matId);
    const required = Number(item.requiredQty || item.requestedQty || 0);
    const already = Number(item.alreadyIssuedQty || 0);
    const needed = Math.max(0, required - already);
    const defaultIssue = Math.min(avail, needed);

    setIssueForm({
      materialRequestId: req._id,
      requestNumber: req.requestNumber,
      workOrder: req.workOrderNumber || 'WO-001',
      material: matId,
      materialName: item.materialName || 'Raw Material',
      unit: item.unit || 'Kg',
      requiredQuantity: required,
      availableStock: avail,
      alreadyIssued: already,
      issueQuantity: defaultIssue,
      balanceQuantity: Math.max(0, needed - defaultIssue),
      batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      issuedBy: 'Selvam (Store Officer)',
      requestedBy: req.requestedBy || 'Production Supervisor',
      department: req.department || 'Assembly',
      remarks: `Issued against Requisition ${req.requestNumber}`
    });

    setActiveTab('issue');
  };

  // When operator switches material in the Issue Form
  const handleMaterialChangeInIssue = (matId) => {
    if (!selectedMR) return;
    const item = (selectedMR.items || []).find(it => String(it.material?._id || it.material) === String(matId));
    if (!item) return;

    const avail = getAvailableStock(matId);
    const required = Number(item.requiredQty || item.requestedQty || 0);
    const already = Number(item.alreadyIssuedQty || 0);
    const needed = Math.max(0, required - already);
    const defaultIssue = Math.min(avail, needed);

    setIssueForm(prev => ({
      ...prev,
      material: matId,
      materialName: item.materialName || 'Raw Material',
      unit: item.unit || 'Kg',
      requiredQuantity: required,
      availableStock: avail,
      alreadyIssued: already,
      issueQuantity: defaultIssue,
      balanceQuantity: Math.max(0, needed - defaultIssue)
    }));
  };

  // Recalculate balance quantity as issueQuantity changes
  const handleIssueQtyChange = (val) => {
    const qty = Number(val || 0);
    const needed = Math.max(0, issueForm.requiredQuantity - issueForm.alreadyIssued);
    setIssueForm(prev => ({
      ...prev,
      issueQuantity: qty,
      balanceQuantity: Math.max(0, needed - qty)
    }));
  };

  // Submit Issue Materials Form
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.materialRequestId) {
      showToast('Please select a valid Material Request', 'error');
      return;
    }
    if (Number(issueForm.issueQuantity) <= 0) {
      showToast('Issue Quantity must be greater than zero', 'error');
      return;
    }
    if (Number(issueForm.issueQuantity) > Number(issueForm.availableStock)) {
      showToast('Cannot issue more than current Store stock balance!', 'error');
      return;
    }

    try {
      const payload = {
        workOrder: issueForm.workOrder,
        materialRequestId: issueForm.materialRequestId,
        department: issueForm.department || 'Assembly',
        issuedBy: issueForm.issuedBy || 'Store Officer',
        requestedBy: issueForm.requestedBy || 'Production Supervisor',
        remarks: issueForm.remarks,
        items: [
          {
            material: issueForm.material,
            materialName: issueForm.materialName,
            availableStockAtTime: issueForm.availableStock,
            requiredQuantity: issueForm.requiredQuantity,
            issueQuantity: Number(issueForm.issueQuantity),
            unit: issueForm.unit,
            batchNumber: issueForm.batchNumber
          }
        ]
      };

      await onSaveMaterialIssue(payload);
      showToast(`Materials issued successfully for ${issueForm.workOrder}! Stock deducted.`, 'success');
      setActiveTab('history');
    } catch (err) {
      showToast(err.message || 'Error processing material issue', 'error');
    }
  };

  // Handle Quick Purchase Order from Shortage
  const handleOpenPOForShortage = (matId, shortageQty) => {
    const mat = (materials || []).find(m => m._id === matId);
    setPoFormData({
      supplier: suppliers[0]?._id || '',
      material: matId,
      quantity: Math.max(10, Number(shortageQty || 10)),
      unitPrice: 85,
      expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      notes: `Urgent purchase for production shortage: ${mat?.materialName || 'Material'}`
    });
    setIsPOModalOpen(true);
  };

  const handleSavePO = async (e) => {
    e.preventDefault();
    try {
      if (onSavePurchaseOrder) {
        await onSavePurchaseOrder({
          supplier: poFormData.supplier,
          orderDate: new Date(),
          expectedDeliveryDate: poFormData.expectedDeliveryDate,
          notes: poFormData.notes,
          status: 'Confirmed',
          items: [
            {
              material: poFormData.material,
              orderedQuantity: Number(poFormData.quantity),
              unitPrice: Number(poFormData.unitPrice),
              lineTotal: Number(poFormData.quantity) * Number(poFormData.unitPrice)
            }
          ]
        });
        showToast('Purchase Order created for shortage materials!', 'success');
        setIsPOModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Error creating Purchase Order', 'error');
    }
  };

  // Handle Quick GRN Acceptance
  const handleOpenGRN = (po) => {
    const item = po.items && po.items[0];
    setGrnFormData({
      purchaseOrder: po._id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      receivedQuantity: item?.orderedQuantity || 10,
      remarks: 'Goods received at Store Bay 1. QC inspection passed.'
    });
    setIsGRNModalOpen(true);
  };

  const handleSaveGRNSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onSaveGRN) {
        const po = purchaseOrders.find(p => p._id === grnFormData.purchaseOrder);
        const item = po?.items && po.items[0];
        await onSaveGRN({
          purchaseOrder: grnFormData.purchaseOrder,
          supplier: po?.supplier?._id || po?.supplier,
          invoiceNumber: grnFormData.invoiceNumber,
          receiptDate: new Date(),
          status: 'Accepted',
          remarks: grnFormData.remarks,
          items: [
            {
              material: item?.material?._id || item?.material,
              orderedQuantity: item?.orderedQuantity || 10,
              receivedQuantity: Number(grnFormData.receivedQuantity),
              acceptedQuantity: Number(grnFormData.receivedQuantity),
              rejectedQuantity: 0,
              unitPrice: item?.unitPrice || 80
            }
          ]
        });
        showToast('Goods Receipt (GRN) accepted! Store stock increased.', 'success');
        setIsGRNModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Error creating GRN', 'error');
    }
  };

  // Collect all shortages across active Material Requests
  const shortages = [];
  (materialRequests || []).forEach(req => {
    (req.items || []).forEach(it => {
      const matId = it.material?._id || it.material;
      const avail = getAvailableStock(matId);
      const needed = (it.requiredQty || it.requestedQty || 0) - (it.alreadyIssuedQty || 0);
      if (avail < needed && needed > 0) {
        shortages.push({
          requestNumber: req.requestNumber,
          workOrderNumber: req.workOrderNumber,
          material: matId,
          materialCode: it.materialCode,
          materialName: it.materialName,
          unit: it.unit,
          requiredQty: needed,
          availableStock: avail,
          shortageQty: needed - avail
        });
      }
    });
  });

  return (
    <div className="module-container">
      {/* 4 Essential Store Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <ClipboardList size={14} style={{ marginRight: 6 }} />
            1. Material Requests ({materialRequests.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'issue' ? 'active' : ''}`}
            onClick={() => setActiveTab('issue')}
          >
            <Boxes size={14} style={{ marginRight: 6 }} />
            2. Stock & Material Issue
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'purchase' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchase')}
          >
            <ShoppingCart size={14} style={{ marginRight: 6 }} />
            3. Purchase & GRN ({shortages.length} Shortages)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <ArrowUpRight size={14} style={{ marginRight: 6 }} />
            4. Issue History ({materialIssues.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MATERIAL REQUESTS (FROM PRODUCTION)               */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Production Store Requisitions
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Requisitions received from Production Management. Check available stock and issue full or partial materials.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Production Order</th>
                  <th>Target Product</th>
                  <th>Requested Components</th>
                  <th>Store Stock Availability</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.map(req => {
                  const items = req.items || [];
                  const allInStock = items.every(it => {
                    const avail = getAvailableStock(it.material?._id || it.material);
                    const needed = (it.requiredQty || it.requestedQty || 0) - (it.alreadyIssuedQty || 0);
                    return avail >= needed;
                  });
                  const anyInStock = items.some(it => {
                    const avail = getAvailableStock(it.material?._id || it.material);
                    return avail > 0;
                  });

                  return (
                    <tr key={req._id}>
                      <td><span className="code-badge font-mono">{req.requestNumber}</span></td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{req.workOrderNumber || 'WO-001'}</strong>
                      </td>
                      <td>
                        <strong>{req.productName || 'Cryo Machine'}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Required by: {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString('en-GB') : 'Immediate'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {items.slice(0, 2).map((it, idx) => (
                            <span key={idx} style={{ fontSize: '0.76rem' }}>
                              • {it.materialName}: <strong>{it.requestedQty || it.requiredQty} {it.unit}</strong> (Issued: {it.alreadyIssuedQty || 0})
                            </span>
                          ))}
                          {items.length > 2 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{items.length - 2} more components</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {allInStock ? (
                          <span className="badge badge-success" style={{ fontSize: '0.72rem', gap: 4 }}>
                            <CheckCircle2 size={11} /> Case A: Fully In Stock
                          </span>
                        ) : anyInStock ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.72rem', gap: 4 }}>
                            <Clock size={11} /> Case B: Partially In Stock
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem', gap: 4 }}>
                            <AlertTriangle size={11} /> Case C: Out of Stock
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={req.status || 'Pending'} /></td>
                      <td>
                        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="icon-btn"
                            title="View Requisition Breakdown"
                            onClick={() => setViewRequestModal(req)}
                          >
                            <Eye size={14} />
                          </button>
                          {req.status !== 'Fully Issued' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4 }}
                              onClick={() => handleSelectRequestForIssue(req)}
                            >
                              <Boxes size={12} /> Check Stock & Issue ➔
                            </button>
                          )}
                          {!allInStock && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4, color: '#D97706', borderColor: '#FDE68A' }}
                              onClick={() => setActiveTab('purchase')}
                            >
                              <ShoppingCart size={12} /> Purchase Shortages ➔
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {materialRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No open production requisitions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STOCK & MATERIAL ISSUE (SIMPLE FORM)              */}
      {/* ======================================================== */}
      {activeTab === 'issue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Issue Form Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Boxes size={18} /> Simple Material Issue Form
              </div>
              {selectedMR && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 4 }}
                  onClick={() => setViewRequestModal(selectedMR)}
                >
                  <Eye size={13} /> View Request ({selectedMR.requestNumber})
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitIssue}>
              <div className="form-grid">
                {/* 1. Request ID */}
                <div className="form-group">
                  <label className="form-label">Request ID (Auto-filled / Select) <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={issueForm.materialRequestId}
                    onChange={(e) => {
                      const found = materialRequests.find(r => r._id === e.target.value);
                      if (found) handleSelectRequestForIssue(found);
                    }}
                    required
                  >
                    <option value="">Select Material Request</option>
                    {materialRequests.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.requestNumber} — {r.workOrderNumber} ({r.productName}) [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Production Order */}
                <div className="form-group">
                  <label className="form-label">Production Order (Auto-filled)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={issueForm.workOrder}
                    disabled
                    style={{ background: 'var(--bg-surface-elevated)', fontWeight: 700 }}
                  />
                </div>

                {/* 3. Material (from BOM) */}
                <div className="form-group col-span-2">
                  <label className="form-label">Material (Auto-filled from BOM / Requisition) <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={issueForm.material}
                    onChange={(e) => handleMaterialChangeInIssue(e.target.value)}
                    required
                  >
                    <option value="">Select Raw Material</option>
                    {selectedMR ? (
                      (selectedMR.items || []).map(it => (
                        <option key={it.material?._id || it.material} value={it.material?._id || it.material}>
                          {it.materialName} ({it.materialCode || 'RM'}) — Required: {it.requiredQty || it.requestedQty} {it.unit}
                        </option>
                      ))
                    ) : (
                      materials.map(m => (
                        <option key={m._id} value={m._id}>
                          {m.materialName} ({m.materialCode})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 4. Required Quantity */}
                <div className="form-group">
                  <label className="form-label">Required Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={issueForm.requiredQuantity}
                    disabled
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  />
                </div>

                {/* 5. Available Stock in Store */}
                <div className="form-group">
                  <label className="form-label">Store Available Stock</label>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    color: issueForm.availableStock > 0 ? '#16A36A' : '#EF4444'
                  }}>
                    {issueForm.availableStock} {issueForm.unit}
                  </div>
                </div>

                {/* 6. Already Issued */}
                <div className="form-group">
                  <label className="form-label">Already Issued</label>
                  <input
                    type="number"
                    className="form-input"
                    value={issueForm.alreadyIssued}
                    disabled
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  />
                </div>

                {/* 7. Issue Quantity (Editable) */}
                <div className="form-group">
                  <label className="form-label">Issue Quantity <span className="req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max={issueForm.availableStock}
                    value={issueForm.issueQuantity}
                    onChange={(e) => handleIssueQtyChange(e.target.value)}
                    required
                  />
                </div>

                {/* 8. Balance Quantity */}
                <div className="form-group">
                  <label className="form-label">Balance Quantity (Remaining)</label>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    color: issueForm.balanceQuantity === 0 ? '#16A36A' : '#D97706'
                  }}>
                    {issueForm.balanceQuantity} {issueForm.unit}
                  </div>
                </div>

                {/* Batch Number */}
                <div className="form-group">
                  <label className="form-label">Store Batch Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={issueForm.batchNumber}
                    onChange={(e) => setIssueForm({ ...issueForm, batchNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Warning Indicators */}
              {Number(issueForm.issueQuantity) > Number(issueForm.availableStock) && (
                <div style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  color: '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <strong>Warning:</strong> Issue Quantity ({issueForm.issueQuantity}) exceeds available store stock ({issueForm.availableStock}). Please reduce quantity or order shortage.
                </div>
              )}

              {/* Case Determination Banner */}
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                background: issueForm.balanceQuantity === 0 ? 'rgba(22, 163, 106, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${issueForm.balanceQuantity === 0 ? 'rgba(22, 163, 106, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: 8,
                fontSize: '0.78rem'
              }}>
                {issueForm.balanceQuantity === 0 ? (
                  <span style={{ color: '#16A36A', fontWeight: 600 }}>
                    ✓ <strong>Case A (Fully Available):</strong> This issue satisfies the full requirement. Production Order will be marked <strong>Ready to Start</strong>.
                  </span>
                ) : (
                  <span style={{ color: '#D97706', fontWeight: 600 }}>
                    ⚠️ <strong>Case B (Partially Available):</strong> Issuing {issueForm.issueQuantity} units leaves {issueForm.balanceQuantity} units remaining. You can purchase the shortage in Tab 3.
                  </span>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {selectedMR && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setViewRequestModal(selectedMR)}
                  >
                    View Request
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: 6 }}
                  disabled={Number(issueForm.issueQuantity) > Number(issueForm.availableStock) || Number(issueForm.issueQuantity) <= 0}
                >
                  <Boxes size={15} /> Issue Materials ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PURCHASE & GRN (SHORTAGES RESOLUTION)             */}
      {/* ======================================================== */}
      {activeTab === 'purchase' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section A: Detected Production Shortages */}
          <div className="table-card">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Material Shortages for Active Production Requisitions
                </strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Purchase requests can be generated directly for shortage quantities only.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requisition No</th>
                    <th>Production Order</th>
                    <th>Material Code</th>
                    <th>Material Name</th>
                    <th>Required Qty</th>
                    <th>Store Stock</th>
                    <th>Shortage Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shortages.map((s, idx) => (
                    <tr key={idx}>
                      <td><span className="code-badge">{s.requestNumber}</span></td>
                      <td><strong>{s.workOrderNumber}</strong></td>
                      <td>{s.materialCode || 'RM'}</td>
                      <td><strong>{s.materialName}</strong></td>
                      <td>{s.requiredQty} {s.unit}</td>
                      <td>{s.availableStock} {s.unit}</td>
                      <td><strong style={{ color: '#DC2626' }}>{s.shortageQty} {s.unit}</strong></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem', gap: 4 }}
                          onClick={() => handleOpenPOForShortage(s.material, s.shortageQty)}
                        >
                          <ShoppingCart size={11} /> + Create PO ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shortages.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: '#16A36A', padding: 24, fontWeight: 600 }}>
                        ✓ Zero shortages detected! Store has sufficient inventory for all active requisitions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Active Purchase Orders & GRN Receiving */}
          <div className="table-card">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Purchase Orders & Inward Goods Receipt (GRN)</strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Receive materials from suppliers and update store inventory automatically.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Material & Qty</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(purchaseOrders || []).slice(0, 6).map(po => {
                    const item = po.items && po.items[0];
                    return (
                      <tr key={po._id}>
                        <td><span className="code-badge font-mono">{po.poNumber}</span></td>
                        <td><strong>{po.supplier?.supplierName || 'Supplier'}</strong></td>
                        <td>{item?.material?.materialName || 'Material'} ({item?.orderedQuantity || 0} Units)</td>
                        <td>{po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-GB') : '-'}</td>
                        <td><StatusBadge status={po.status || 'Confirmed'} /></td>
                        <td>
                          {po.status !== 'Completed' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.72rem', gap: 4 }}
                              onClick={() => handleOpenGRN(po)}
                            >
                              <PackageCheck size={11} /> Receive GRN ➔
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!purchaseOrders || purchaseOrders.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                        No purchase orders on file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ISSUE HISTORY                                     */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Store Material Issue History
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Verified ledger of all raw material components released from Store to Production Assembly bays.
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue Slip No</th>
                  <th>Date</th>
                  <th>Production Order</th>
                  <th>Department / Bay</th>
                  <th>Issued Components</th>
                  <th>Issued By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(materialIssues || []).map(mi => (
                  <tr key={mi._id}>
                    <td><span className="code-badge font-mono">{mi.issueNumber}</span></td>
                    <td>{mi.issueDate ? new Date(mi.issueDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{mi.workOrder || 'WO'}</strong></td>
                    <td>{mi.department || 'Assembly'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(mi.items || []).map((it, idx) => (
                          <span key={idx} style={{ fontSize: '0.76rem' }}>
                            • {it.material?.materialName || it.materialName || 'Material'}: <strong>{it.issueQuantity || it.issuedQty} {it.unit || 'Kg'}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{mi.issuedBy || 'Store Officer'}</td>
                    <td>
                      <span className="badge badge-success" style={{ gap: 4 }}>
                        <CheckCircle2 size={11} /> {mi.status || 'Issued'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!materialIssues || materialIssues.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No material issues recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW REQUISITION DETAILS                          */}
      {/* ======================================================== */}
      {viewRequestModal && (
        <Modal
          title={`Requisition Details: ${viewRequestModal.requestNumber}`}
          subtitle={`Dispatched for Production Order ${viewRequestModal.workOrderNumber}`}
          isOpen={!!viewRequestModal}
          onClose={() => setViewRequestModal(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Requisition Number</div>
                <div className="detail-value font-mono text-cyan" style={{ fontWeight: 700 }}>
                  {viewRequestModal.requestNumber}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Production Order</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {viewRequestModal.workOrderNumber}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Product</div>
                <div className="detail-value">{viewRequestModal.productName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={viewRequestModal.status} /></div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <strong style={{ fontSize: '0.84rem' }}>Component Breakdown:</strong>
              <div className="table-responsive" style={{ marginTop: 8 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Required Qty</th>
                      <th>Available Stock</th>
                      <th>Already Issued</th>
                      <th>Remaining</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewRequestModal.items || []).map((it, idx) => {
                      const matId = it.material?._id || it.material;
                      const avail = getAvailableStock(matId);
                      const reqQty = Number(it.requiredQty || it.requestedQty || 0);
                      const issued = Number(it.alreadyIssuedQty || 0);
                      const rem = Math.max(0, reqQty - issued);

                      return (
                        <tr key={idx}>
                          <td><strong>{it.materialName}</strong> ({it.materialCode || 'RM'})</td>
                          <td>{reqQty} {it.unit}</td>
                          <td>
                            <strong style={{ color: avail >= rem ? '#16A36A' : '#EF4444' }}>
                              {avail} {it.unit}
                            </strong>
                          </td>
                          <td>{issued} {it.unit}</td>
                          <td><strong style={{ color: rem === 0 ? '#16A36A' : '#D97706' }}>{rem} {it.unit}</strong></td>
                          <td>
                            {rem > 0 && avail > 0 && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                                onClick={() => {
                                  const req = viewRequestModal;
                                  setViewRequestModal(null);
                                  handleSelectRequestForIssue(req, matId);
                                }}
                              >
                                Issue This Component ➔
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewRequestModal(null)}>
                Close
              </button>
              {viewRequestModal.status !== 'Fully Issued' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const req = viewRequestModal;
                    setViewRequestModal(null);
                    handleSelectRequestForIssue(req);
                  }}
                >
                  Issue Materials ➔
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE SHORTAGE PURCHASE ORDER                    */}
      {/* ======================================================== */}
      {isPOModalOpen && (
        <Modal
          title="Create Purchase Order (PO) for Shortage"
          subtitle="Generate purchase order to replenish store stock for production"
          isOpen={isPOModalOpen}
          onClose={() => setIsPOModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleSavePO}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Select Supplier <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={poFormData.supplier}
                  onChange={(e) => setPoFormData({ ...poFormData, supplier: e.target.value })}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.supplierName} ({s.supplierCode})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Quantity <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={poFormData.quantity}
                  onChange={(e) => setPoFormData({ ...poFormData, quantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={poFormData.unitPrice}
                  onChange={(e) => setPoFormData({ ...poFormData, unitPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Expected Delivery Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={poFormData.expectedDeliveryDate}
                  onChange={(e) => setPoFormData({ ...poFormData, expectedDeliveryDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Notes</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={poFormData.notes}
                  onChange={(e) => setPoFormData({ ...poFormData, notes: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPOModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm & Dispatch PO ➔
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: INWARD GOODS RECEIPT (GRN)                        */}
      {/* ======================================================== */}
      {isGRNModalOpen && (
        <Modal
          title="Inward Goods Receipt Note (GRN)"
          subtitle="Acknowledge incoming supplier delivery and credit Store inventory"
          isOpen={isGRNModalOpen}
          onClose={() => setIsGRNModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleSaveGRNSubmit}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Supplier Invoice / DC No <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={grnFormData.invoiceNumber}
                  onChange={(e) => setGrnFormData({ ...grnFormData, invoiceNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Received Quantity <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={grnFormData.receivedQuantity}
                  onChange={(e) => setGrnFormData({ ...grnFormData, receivedQuantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Remarks & Quality Inspection Notes</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={grnFormData.remarks}
                  onChange={(e) => setGrnFormData({ ...grnFormData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsGRNModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Accept GRN & Increase Stock ➔
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
