import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Calendar,
  Factory,
  User,
  MapPin,
  AlertCircle,
  ShoppingCart,
  Eye,
  Layers,
  ArrowRight,
  Clock,
  ArrowDownLeft,
  CheckCircle2,
  Package
} from 'lucide-react';

export default function ProductionPlanningModule({
  workOrders = [],
  salesOrders = [],
  products = [],
  boms = [],
  inventory = [],
  onSave,
  onUpdateStatus,
  onNavigateToBOM,
  onNavigateToSchedule,
  onNavigateToMaterials,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [noBomWarning, setNoBomWarning] = useState(false);

  const [formData, setFormData] = useState({
    salesOrder: '',
    salesOrderNumber: '',
    customer: '',
    customerName: '',
    product: '',
    productName: '',
    orderQuantity: 10,
    productionQuantity: 10,
    priority: 'High',
    productionManager: 'Rajesh Sharma',
    productionLocation: 'Main Assembly Bay 1',
    plannedStartDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    bom: '',
    remarks: ''
  });

  const handleOpenModal = () => {
    setDuplicateWarning(null);
    setNoBomWarning(false);
    if (salesOrders.length > 0 && !formData.salesOrder) {
      handleSelectSO(salesOrders[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectSO = (soId) => {
    const so = salesOrders.find(s => s._id === soId);
    if (!so) {
      setDuplicateWarning(null);
      return;
    }

    // Check for existing Work Order linked to this SO
    const existingWO = workOrders.find(wo => String(wo.salesOrder?._id || wo.salesOrder) === String(so._id));
    if (existingWO) {
      setDuplicateWarning(`Work Order ${existingWO.workOrderNumber} is already linked to Sales Order ${so.soNumber} (Status: ${existingWO.status}).`);
    } else {
      setDuplicateWarning(null);
    }

    const firstItem = so.items && so.items[0];
    const prodId = firstItem?.product?._id || firstItem?.product || '';
    const prodName = firstItem?.productName || firstItem?.product?.productName || '';

    // Check BOM for this product
    const matchingBOM = boms.find(b => String(b.product?._id || b.product) === String(prodId));
    setNoBomWarning(!matchingBOM);

    setFormData(prev => ({
      ...prev,
      salesOrder: so._id,
      salesOrderNumber: so.soNumber,
      customer: so.customer?._id || so.customer || '',
      customerName: so.customer?.companyName || 'Confirmed Client',
      product: prodId,
      productName: prodName,
      orderQuantity: firstItem?.quantity || 10,
      productionQuantity: firstItem?.quantity || 10,
      bom: matchingBOM ? matchingBOM._id : ''
    }));
  };

  const handleSelectProduct = (prodId) => {
    const p = products.find(prod => prod._id === prodId);
    const matchingBOM = boms.find(b => String(b.product?._id || b.product) === String(prodId));
    setNoBomWarning(!matchingBOM);

    setFormData(prev => ({
      ...prev,
      product: prodId,
      productName: p ? p.productName : '',
      bom: matchingBOM ? matchingBOM._id : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName) {
      showToast('Please select a Product or Sales Order', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Work Order created successfully! Connected to BOM & Production Schedule.', 'success');
    } catch (err) {
      showToast(err.message || 'Error creating Work Order', 'error');
    }
  };

  const handleStatusChange = async (woId, newStatus) => {
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(woId, newStatus);
        showToast(`Work Order status updated to ${newStatus}`, 'success');
        if (selectedWO && selectedWO._id === woId) {
          setSelectedWO(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const columns = [
    {
      header: 'Work Order No',
      accessor: 'workOrderNumber',
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => setSelectedWO(row)}
        >
          {row.workOrderNumber}
        </span>
      )
    },
    {
      header: 'Sales Order',
      accessor: 'salesOrderNumber',
      render: (row) => (
        <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          {row.salesOrderNumber || row.salesOrder?.soNumber || 'Direct Order'}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.customerName || row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customer?.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.productName || row.product?.productName || 'Cryo Unit'}</strong>
          {row.bom && (
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
              BOM: {row.bom?.bomNumber || 'Standard V1'}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Qty',
      accessor: 'productionQuantity',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.productionQuantity || row.orderQuantity || 0} Units
        </span>
      )
    },
    {
      header: 'Assigned Team',
      accessor: 'productionManager',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{row.productionManager || 'Supervisor'}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.productionLocation || 'Assembly Bay'}</div>
        </div>
      )
    },
    {
      header: 'Target Date',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.expectedCompletionDate ? new Date(row.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="icon-btn"
            title="View Work Order Particulars"
            onClick={() => setSelectedWO(row)}
          >
            <Eye size={15} />
          </button>
          {row.status === 'Planned' && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
              title="Release Work Order to Ready to Start"
              onClick={() => handleStatusChange(row._id, 'Ready to Start')}
            >
              <CheckCircle2 size={12} /> Release ➔
            </button>
          )}
          {onNavigateToMaterials && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, color: 'var(--primary)', borderColor: 'var(--primary-subtle)' }}
              title="Requisition Materials for this Work Order"
              onClick={() => onNavigateToMaterials(row)}
            >
              <ArrowDownLeft size={12} /> Materials
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Production Work Orders"
        subtitle="Manage end-to-end manufacturing orders created from confirmed customer sales demand"
        columns={columns}
        data={workOrders}
        onAdd={handleOpenModal}
        addLabel="Create Work Order"
      />

      {/* Create Work Order Modal */}
      {isModalOpen && (
        <Modal
          title="Create Production Work Order"
          subtitle="Generate a tracked manufacturing order directly from confirmed customer sales order"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Duplicate Sales Order Warning */}
              {duplicateWarning && (
                <div style={{
                  padding: '12px 16px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: 8,
                  fontSize: '0.84rem',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span><strong>Warning:</strong> {duplicateWarning}</span>
                </div>
              )}

              {/* Order Information Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} /> 1. Sales Order & Product Specifications
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Linked Sales Order (SO)</label>
                    <select
                      className="form-select"
                      value={formData.salesOrder}
                      onChange={(e) => handleSelectSO(e.target.value)}
                    >
                      <option value="">Select Confirmed Sales Order (or Direct Production Order)</option>
                      {salesOrders.map(so => (
                        <option key={so._id} value={so._id}>
                          {so.soNumber} — {so.customer?.companyName || 'Customer'} (₹{(so.orderAmount || so.grandTotal || 0).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Name <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g. ABC Industries Pvt Ltd"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.product}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      required
                    >
                      <option value="">Select Manufactured Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.productCode} - {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Associated BOM</label>
                    <select
                      className="form-select"
                      value={formData.bom}
                      onChange={(e) => setFormData({ ...formData, bom: e.target.value })}
                    >
                      <option value="">Select BOM Version</option>
                      {boms.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.bomNumber} - {b.product?.productName || 'Product'} ({b.version})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.orderQuantity}
                      onChange={(e) => setFormData({ ...formData, orderQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.productionQuantity}
                      onChange={(e) => setFormData({ ...formData, productionQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* No BOM Warning */}
                {noBomWarning && (
                  <div style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8
                  }}>
                    <span>⚠️ No active Bill of Materials (BOM) found for this product. Please configure a BOM before manufacturing.</span>
                    {onNavigateToBOM && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem', height: 24, color: '#DC2626', borderColor: '#FECACA' }}
                        onClick={() => {
                          setIsModalOpen(false);
                          onNavigateToBOM();
                        }}
                      >
                        Create BOM ➔
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Planning & Schedule Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Factory size={16} /> 2. Planning, Schedule & Team Assignment
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Manager / Supervisor <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productionManager}
                      onChange={(e) => setFormData({ ...formData, productionManager: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Location / Bay</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productionLocation}
                      onChange={(e) => setFormData({ ...formData, productionLocation: e.target.value })}
                      placeholder="e.g. Main Assembly Bay 1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.plannedStartDate}
                      onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Completion Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expectedCompletionDate}
                      onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Work Order Remarks & Engineering Notes</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Special customer specifications, tolerances, or shop floor instructions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Production Work Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Work Order Details Modal */}
      {selectedWO && (
        <Modal
          title={`Work Order: ${selectedWO.workOrderNumber}`}
          subtitle={`Manufacturing details for ${selectedWO.customerName || selectedWO.customer?.companyName || 'Customer'}`}
          isOpen={!!selectedWO}
          onClose={() => setSelectedWO(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Work Order No</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedWO.workOrderNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedWO.status || 'Planned'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Sales Order Reference</div>
                <div className="detail-value">{selectedWO.salesOrderNumber || selectedWO.salesOrder?.soNumber || 'Direct Order'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer</div>
                <div className="detail-value">{selectedWO.customerName || selectedWO.customer?.companyName || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Manufactured Product</div>
                <div className="detail-value">{selectedWO.productName || selectedWO.product?.productName || 'Cryo Unit'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Production Quantity</div>
                <div className="detail-value" style={{ fontWeight: 700 }}>{selectedWO.productionQuantity || selectedWO.orderQuantity || 0} Units</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Priority</div>
                <div className="detail-value"><StatusBadge status={selectedWO.priority || 'Medium'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Assigned Supervisor</div>
                <div className="detail-value">{selectedWO.productionManager || 'Supervisor'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Shop Floor Location</div>
                <div className="detail-value">{selectedWO.productionLocation || 'Assembly Bay 1'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Planned Timeline</div>
                <div className="detail-value" style={{ fontSize: '0.82rem' }}>
                  {selectedWO.plannedStartDate ? new Date(selectedWO.plannedStartDate).toLocaleDateString('en-GB') : '-'} to{' '}
                  {selectedWO.expectedCompletionDate ? new Date(selectedWO.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
              {selectedWO.remarks && (
                <div className="detail-item col-span-2">
                  <div className="detail-label">Engineering Remarks</div>
                  <div className="detail-value" style={{ fontSize: '0.82rem' }}>{selectedWO.remarks}</div>
                </div>
              )}
            </div>

            {/* Quick Handover Actions */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedWO.status === 'Planned' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusChange(selectedWO._id, 'Ready to Start')}
                  >
                    <CheckCircle2 size={13} /> Release for Production
                  </button>
                )}
                {selectedWO.status === 'Ready to Start' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusChange(selectedWO._id, 'Running')}
                  >
                    <Factory size={13} /> Mark Running / In Assembly
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {onNavigateToMaterials && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--primary)', borderColor: 'var(--primary-subtle)' }}
                    onClick={() => {
                      const wo = selectedWO;
                      setSelectedWO(null);
                      onNavigateToMaterials(wo);
                    }}
                  >
                    <ArrowDownLeft size={13} /> Check & Issue Materials ➔
                  </button>
                )}
                {onNavigateToBOM && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedWO(null);
                      onNavigateToBOM();
                    }}
                  >
                    <Layers size={13} /> View BOM Recipe ➔
                  </button>
                )}
                {onNavigateToSchedule && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedWO(null);
                      onNavigateToSchedule();
                    }}
                  >
                    <Clock size={13} /> View Schedule ➔
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
