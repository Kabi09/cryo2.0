import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Truck, Calendar, ShoppingCart, User, MapPin, Wrench, PackageCheck } from 'lucide-react';

export default function DeliveryPlanningModule({
  deliveryPlans = [],
  salesOrders = [],
  finishedGoods = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    salesOrder: '',
    soNumber: '',
    customer: '',
    customerName: '',
    contactPerson: '',
    mobileNumber: '',
    deliveryAddress: '',
    product: '',
    productName: '',
    finishedGood: '',
    serialNumber: '',
    orderedQuantity: 1,
    alreadyDeliveredQuantity: 0,
    pendingQuantity: 1,
    plannedDeliveryQuantity: 1,
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryMethod: 'Company Vehicle',
    installationRequired: true,
    specialInstructions: '',
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
    const prodName = firstItem?.product?.productName || firstItem?.productName || 'Cryo Unit';
    const ordQty = firstItem?.quantity || 1;

    // Search for available FG matching this product
    const matchingFG = finishedGoods.find(fg =>
      String(fg.product?._id || fg.product) === String(prodId) && fg.stockStatus === 'Available'
    );

    setFormData(prev => ({
      ...prev,
      salesOrder: so._id,
      soNumber: so.soNumber || 'SO-001',
      customer: so.customer?._id || so.customer || '',
      customerName: so.customer?.companyName || 'ABC Industries',
      contactPerson: so.customer?.contactPerson || 'Site Manager',
      mobileNumber: so.customer?.mobile || '9876543210',
      deliveryAddress: so.customer?.shippingAddress || so.customer?.billingAddress || 'Plot 45, Guindy Industrial Estate, Chennai',
      product: prodId,
      productName: prodName,
      finishedGood: matchingFG ? matchingFG._id : '',
      serialNumber: matchingFG ? matchingFG.serialNumber : 'FG-SN-001',
      orderedQuantity: ordQty,
      alreadyDeliveredQuantity: 0,
      pendingQuantity: ordQty,
      plannedDeliveryQuantity: ordQty
    }));
  };

  const handlePlannedQtyChange = (val) => {
    const planned = Number(val) || 1;
    const ordered = Number(formData.orderedQuantity) || 1;
    const already = Number(formData.alreadyDeliveredQuantity) || 0;
    const pending = Math.max(0, ordered - (already + planned));

    setFormData(prev => ({
      ...prev,
      plannedDeliveryQuantity: planned,
      pendingQuantity: pending
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.deliveryAddress) {
      showToast('Please specify customer name and delivery address', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Delivery plan scheduled successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error creating delivery plan', 'error');
    }
  };

  const columns = [
    {
      header: 'Delivery No',
      accessor: 'deliveryNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.deliveryNumber}</span>
    },
    {
      header: 'SO No',
      accessor: 'soNumber',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.soNumber || 'SO-001'}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <strong>{row.customerName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.contactPerson} • {row.mobileNumber}</div>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span>{row.productName}</span>
          {row.serialNumber && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SN: {row.serialNumber}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Quantity',
      render: (row) => (
        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {row.plannedDeliveryQuantity} / {row.orderedQuantity} Units
        </span>
      )
    },
    {
      header: 'Delivery Date',
      accessor: 'deliveryDate',
      render: (row) => (row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : '-')
    },
    {
      header: 'Method',
      accessor: 'deliveryMethod',
      render: (row) => (
        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          {row.deliveryMethod}
        </span>
      )
    },
    {
      header: 'Installation',
      accessor: 'installationRequired',
      render: (row) => (
        <span className={`badge ${row.installationRequired ? 'badge-success' : 'badge-neutral'}`}>
          {row.installationRequired ? 'Yes (Required)' : 'No (Supply Only)'}
        </span>
      )
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
        title="Delivery Planning"
        subtitle="Schedule customer shipments linked directly to confirmed Sales Orders and QA-approved Finished Goods"
        columns={columns}
        data={deliveryPlans}
        onAdd={handleOpenModal}
        addLabel="Plan Delivery"
      />

      {isModalOpen && (
        <Modal
          title="Create Customer Delivery Plan"
          subtitle="Formulate dispatch routing, consignee details, and transport allocation"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Sales Order & Consignee */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} /> 1. Confirmed Sales Order & Consignee
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Sales Order Reference <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.salesOrder}
                      onChange={(e) => handleSelectSO(e.target.value)}
                      required
                    >
                      <option value="">Select Confirmed Sales Order</option>
                      {salesOrders.map(so => (
                        <option key={so._id} value={so._id}>
                          {so.soNumber} — {so.customer?.companyName || 'Client'} (₹{so.grandTotal?.toLocaleString() || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer / Company Name <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Delivery Destination Address <span className="req">*</span></label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product & Quantities */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageCheck size={16} /> 2. Product & Delivery Quantities
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      placeholder="Auto-derived from Sales Order"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned FG Serial Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g. MA-SERIES-01"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Ordered Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.orderedQuantity}
                      readOnly
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Delivery Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={formData.orderedQuantity}
                      value={formData.plannedDeliveryQuantity}
                      onChange={(e) => handlePlannedQtyChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pending Balance Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.pendingQuantity}
                      readOnly
                      style={{ color: 'var(--warning)', fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Delivery Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method & Installation */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={16} /> 3. Delivery Method & Site Services
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Delivery Transport Method <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.deliveryMethod}
                      onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                    >
                      <option value="Company Vehicle">Company Vehicle (Own Driver & Van/Truck)</option>
                      <option value="Courier / Transport">Courier / Transport (3rd-Party Freight Partner)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Installation Required on Site? <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.installationRequired ? 'Yes' : 'No'}
                      onChange={(e) => setFormData({ ...formData, installationRequired: e.target.value === 'Yes' })}
                    >
                      <option value="Yes">Yes (Technician will visit & submit 7-point QA sign-off)</option>
                      <option value="No">No (Supply & Drop-off Only)</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Special Delivery Instructions & Unloading Gate</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      placeholder="e.g. Unload at Bay 3, require forklift ramp on site, delivery only during working hours..."
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
                Save & Confirm Delivery Plan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

