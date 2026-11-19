import React, { useState, useEffect } from 'react';
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
  Package,
  Plus,
  FileText
} from 'lucide-react';

export default function ProductionPlanningModule({
  workOrders = [],
  salesOrders = [],
  products = [],
  boms = [],
  inventory = [],
  materialRequests = [],
  productionMaterialIssues = [],
  preSelectedSO = null,
  onClearPreSelectedSO,
  onSave,
  onUpdateStatus,
  onNavigateToBOM,
  onNavigateToSchedule,
  onNavigateToMaterials,
  onNavigateToManufacturing,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

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

  // Handle incoming preSelectedSO from Production Dashboard or Sales
  useEffect(() => {
    if (preSelectedSO) {
      handleSelectSO(preSelectedSO._id);
      setIsModalOpen(true);
      onClearPreSelectedSO?.();
    }
  }, [preSelectedSO]);

  const handleOpenModal = () => {
    setDuplicateWarning(null);
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

    // Check if an existing BOM is available
    const matchingBOM = boms.find(b => String(b.product?._id || b.product) === String(prodId));

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

    setFormData(prev => ({
      ...prev,
      product: prodId,
      productName: p ? p.productName : '',
      bom: matchingBOM ? matchingBOM._id : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName && !formData.product) {
      showToast('Please select a Product or Sales Order', 'error');
      return;
    }
    try {
      const payload = {
        ...formData,
        bom: formData.bom || undefined,
        salesOrder: formData.salesOrder || undefined,
        customer: formData.customer || undefined,
        product: formData.product || undefined
      };
      await onSave(payload);
      setIsModalOpen(false);
      showToast('Work Order created successfully! Next: Define BOM recipe or request materials.', 'success');
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
      render: (row) => {
        const prodId = row.product?._id || row.product;
        const matchingBOM = row.bom || boms.find(b => String(b.product?._id || b.product) === String(prodId));
        return (
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>{row.productName || row.product?.productName || 'Cryo Unit'}</strong>
            {matchingBOM ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                BOM: {matchingBOM.bomNumber || 'Standard V1'}
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600 }}>
                • Needs BOM Recipe
              </div>
            )}
          </div>
        );
      }
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
      header: 'Stock Status',
      render: (row) => {
        const isIssued = productionMaterialIssues.some(mi =>
          (mi.workOrderNumber === row.workOrderNumber || String(mi.workOrder?._id || mi.workOrder) === String(row._id)) &&
          (mi.status === 'Issued' || mi.status === 'Fully Issued')
        );
        const hasRequest = materialRequests.some(mr =>
          mr.workOrderNumber === row.workOrderNumber || String(mr.workOrder?._id || mr.workOrder) === String(row._id)
        );

        if (isIssued || row.status === 'Ready to Start' || row.status === 'Running' || row.status === 'Completed') {
          return (
            <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} /> Stock Issued
            </span>
          );
        }
        if (hasRequest) {
          return (
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Store Issue Pending
            </span>
          );
        }
        return (
          <span className="badge badge-secondary" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={11} /> Request BOM Required
          </span>
        );
      }
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
      render: (row) => {
        const isIssued = productionMaterialIssues.some(mi =>
          (mi.workOrderNumber === row.workOrderNumber || String(mi.workOrder?._id || mi.workOrder) === String(row._id)) &&
          (mi.status === 'Issued' || mi.status === 'Fully Issued')
        );
        const prodId = row.product?._id || row.product;
        const matchingBOM = row.bom || boms.find(b => String(b.product?._id || b.product) === String(prodId));

        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn"
              title="View Work Order & Sales Order Particulars"
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
            {!matchingBOM && onNavigateToBOM && (
              <button
                type="button"
                className="btn btn-warning"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, background: '#D97706', color: '#fff', borderColor: '#B45309' }}
                title="Create BOM recipe for this order"
                onClick={() => onNavigateToBOM(row)}
              >
                <Plus size={12} /> Make BOM ➔
              </button>
            )}
            {matchingBOM && onNavigateToMaterials && !isIssued && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, color: 'var(--primary)', borderColor: 'var(--primary-subtle)' }}
                title="Requisition BOM Materials from Store"
                onClick={() => onNavigateToMaterials(row)}
              >
                <ArrowDownLeft size={12} /> Request BOM ➔
              </button>
            )}
            {(isIssued || row.status === 'Ready to Start' || row.status === 'Running') && onNavigateToManufacturing && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                title="Open Shopfloor Assembly Execution"
                onClick={() => onNavigateToManufacturing(row)}
              >
                <Factory size={12} /> Assembly ➔
              </button>
            )}
          </div>
        );
      }
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

                  <div style={{ gridColumn: 'span 2', fontSize: '0.76rem', color: 'var(--text-secondary)', background: 'rgba(99, 102, 241, 0.05)', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    💡 <em>Tip: Create this Work Order first. You will define or review its BOM recipe in the next step.</em>
                  </div>
                </div>
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
      {selectedWO && (() => {
        const prodId = selectedWO.product?._id || selectedWO.product;
        const matchingBOM = selectedWO.bom || boms.find(b => String(b.product?._id || b.product) === String(prodId));
        const linkedSO = salesOrders.find(s =>
          String(s._id) === String(selectedWO.salesOrder?._id || selectedWO.salesOrder) ||
          s.soNumber === selectedWO.salesOrderNumber
        );
        const linkedMR = materialRequests.find(mr =>
          mr.workOrderNumber === selectedWO.workOrderNumber ||
          String(mr.workOrder?._id || mr.workOrder) === String(selectedWO._id)
        );
        const isStockIssued = productionMaterialIssues.some(mi =>
          (mi.workOrderNumber === selectedWO.workOrderNumber || String(mi.workOrder?._id || mi.workOrder) === String(selectedWO._id)) &&
          (mi.status === 'Issued' || mi.status === 'Fully Issued')
        );

        return (
          <Modal
            title={`Work Order: ${selectedWO.workOrderNumber}`}
            subtitle={`Manufacturing details for ${selectedWO.customerName || selectedWO.customer?.companyName || 'Customer'}`}
            isOpen={!!selectedWO}
            onClose={() => setSelectedWO(null)}
            size="lg"
          >
            <div>
              {/* Card 1: Linked Sales Order Details */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 16
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <ShoppingCart size={15} /> Linked Sales Order & Customer Particulars:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Sales Order:</span>{' '}
                    <strong style={{ color: 'var(--primary)' }}>{selectedWO.salesOrderNumber || selectedWO.salesOrder?.soNumber || 'SO-Direct'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Customer:</span>{' '}
                    <strong>{selectedWO.customerName || selectedWO.customer?.companyName || linkedSO?.customer?.companyName || 'Confirmed Client'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Target:</span>{' '}
                    <strong>{selectedWO.expectedCompletionDate ? new Date(selectedWO.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}</strong>
                  </div>
                  {linkedSO?.shippingAddress && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Shipping / Plant Address:</span>{' '}
                      <span>{linkedSO.shippingAddress}</span>
                    </div>
                  )}
                  {linkedSO?.productionRemarks && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sales Instructions:</span>{' '}
                      <em>{linkedSO.productionRemarks}</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Stock & BOM Requisition Status */}
              {!matchingBOM ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={15} /> Step 2: Define Bill of Materials (BOM Recipe)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Work Order is created. Formulate the BOM recipe specifying raw materials before requisitioning stock from Company Store.
                    </div>
                  </div>
                  {onNavigateToBOM && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      style={{ background: '#D97706', color: '#fff', borderColor: '#B45309', gap: 4 }}
                      onClick={() => {
                        const wo = selectedWO;
                        setSelectedWO(null);
                        onNavigateToBOM(wo);
                      }}
                    >
                      <Plus size={13} /> Make BOM Recipe ➔
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  background: isStockIssued ? 'rgba(22, 163, 106, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                  border: `1px solid ${isStockIssued ? 'rgba(22, 163, 106, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isStockIssued ? '#16A36A' : '#D97706' }}>
                      {isStockIssued ? '✓ Stock Issued from Company Store' : linkedMR ? `Store Requisition: ${linkedMR.requestNumber} (Pending Issue)` : 'Material Requisition Required'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {isStockIssued
                        ? 'All BOM components have been verified and issued by the warehouse. Ready for shop floor assembly.'
                        : linkedMR
                          ? 'Material Request has been dispatched to Company Store. Awaiting physical issue.'
                          : 'BOM recipe is ready. Send requisition to SCM Company Store to allocate raw material stock.'}
                    </div>
                  </div>
                  {!isStockIssued && onNavigateToMaterials && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const wo = selectedWO;
                        setSelectedWO(null);
                        onNavigateToMaterials(wo);
                      }}
                    >
                      <ArrowDownLeft size={13} /> Request BOM Materials ➔
                    </button>
                  )}
                </div>
              )}

              {/* Card 3: Standard Details */}
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
                  {onNavigateToManufacturing && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ gap: 4 }}
                      onClick={() => {
                        const wo = selectedWO;
                        setSelectedWO(null);
                        onNavigateToManufacturing(wo);
                      }}
                    >
                      <Factory size={13} /> Open Shopfloor Assembly ➔
                    </button>
                  )}
                  {onNavigateToBOM && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const wo = selectedWO;
                        setSelectedWO(null);
                        onNavigateToBOM(wo);
                      }}
                    >
                      <Layers size={13} /> {matchingBOM ? 'View BOM Recipe ➔' : '+ Make BOM Recipe ➔'}
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
        );
      })()}
    </div>
  );
}
