import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Factory, User, MapPin, AlertCircle, ShoppingCart } from 'lucide-react';

export default function ProductionPlanningModule({
  workOrders = [],
  salesOrders = [],
  products = [],
  boms = [],
  onSave,
  onUpdateStatus,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (salesOrders.length > 0 && !formData.salesOrder) {
      handleSelectSO(salesOrders[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectSO = (soId) => {
    const so = salesOrders.find(s => s._id === soId);
    if (!so) return;

    const firstItem = so.items && so.items[0];
    const prodId = firstItem?.product?._id || firstItem?.product || '';
    const prodName = firstItem?.product?.productName || '';

    // Find associated BOM if any
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

  const columns = [
    {
      header: 'Work Order No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.workOrderNumber}</span>
    },
    {
      header: 'SO Number',
      accessor: 'salesOrderNumber',
      render: (row) => <span className="font-mono" style={{ color: '#A5B4FC' }}>{row.salesOrderNumber || 'Direct WO'}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Order Qty',
      accessor: 'orderQuantity',
      render: (row) => `${row.orderQuantity || 0} Units`
    },
    {
      header: 'Prod Qty',
      accessor: 'productionQuantity',
      render: (row) => `${row.productionQuantity || 0} Units`
    },
    {
      header: 'Planned Dates',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.plannedStartDate ? new Date(row.plannedStartDate).toLocaleDateString() : '-'} to{' '}
          {row.expectedCompletionDate ? new Date(row.expectedCompletionDate).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => <StatusBadge status={row.priority || 'Medium'} />
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
        title="Production Planning & Work Orders"
        subtitle="Create manufacturing work orders directly from confirmed Sales Orders"
        columns={columns}
        data={workOrders}
        onAdd={handleOpenModal}
        addLabel="Create Work Order"
      />

      {isModalOpen && (
        <Modal
          title="Create Production Plan / Work Order"
          subtitle="Generate a tracked manufacturing order directly from customer sales demand"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Order Information Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                          {so.soNumber} — {so.customer?.companyName || 'Customer'} (₹{so.grandTotal?.toLocaleString() || 0})
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
                      onChange={(e) => {
                        const p = products.find(prod => prod._id === e.target.value);
                        setFormData({
                          ...formData,
                          product: e.target.value,
                          productName: p ? p.productName : ''
                        });
                      }}
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
              </div>

              {/* Planning & Schedule Card */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Factory size={16} /> 2. Planning, Schedule & Bay Assignment
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
                    <label className="form-label">Production Manager <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productionManager}
                      onChange={(e) => setFormData({ ...formData, productionManager: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Location / Line</label>
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
                    <label className="form-label">Work Order Remarks</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Special customer specifications, tolerances, or QA instructions..."
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
                Create Production Work Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

