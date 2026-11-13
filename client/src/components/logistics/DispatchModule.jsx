import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Truck, Warehouse, PackageCheck, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DispatchModule({
  dispatches = [],
  deliveryPlans = [],
  vehiclesCouriers = [],
  finishedGoods = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deliveryPlan: '',
    deliveryNumber: '',
    salesOrder: '',
    soNumber: '',
    customer: '',
    customerName: '',
    product: '',
    productName: '',
    finishedGood: '',
    serialNumber: '',
    plannedQuantity: 1,
    actualDispatchQuantity: 1,
    warehouseLocation: 'FG Central Warehouse - Bay 1',
    packingDetails: 'Wooden crate with corner foam pads, shrink wrap, and desiccant pouch',
    dispatchDateTime: new Date().toISOString().slice(0, 16),
    deliveryMethod: 'Company Vehicle',
    vehicleCourier: '',
    vehicleNumber: '',
    driverName: '',
    driverMobile: '',
    courierPartner: '',
    trackingNumber: '',
    dispatchedBy: 'Warehouse Manager Anbu',
    checkedBy: 'Security Lead Joseph',
    deliveryChallan: '',
    remarks: ''
  });

  const handleOpenModal = () => {
    const pendingPlans = deliveryPlans.filter(p => p.status === 'Planned');
    if (pendingPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectPlan(pendingPlans[0]._id);
    } else if (deliveryPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectPlan(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectPlan = (planId) => {
    const plan = deliveryPlans.find(p => p._id === planId);
    if (!plan) return;

    // Find available vehicle or courier based on method
    const matchingTrans = vehiclesCouriers.find(v => v.entityType === plan.deliveryMethod && v.status === 'Available');

    setFormData(prev => ({
      ...prev,
      deliveryPlan: plan._id,
      deliveryNumber: plan.deliveryNumber,
      salesOrder: plan.salesOrder?._id || plan.salesOrder,
      soNumber: plan.soNumber || 'SO-001',
      customer: plan.customer?._id || plan.customer,
      customerName: plan.customerName,
      product: plan.product?._id || plan.product,
      productName: plan.productName,
      finishedGood: plan.finishedGood?._id || plan.finishedGood || '',
      serialNumber: plan.serialNumber || 'FG-SERIES-01',
      plannedQuantity: plan.plannedDeliveryQuantity || 1,
      actualDispatchQuantity: plan.plannedDeliveryQuantity || 1,
      deliveryMethod: plan.deliveryMethod || 'Company Vehicle',
      vehicleCourier: matchingTrans ? matchingTrans._id : '',
      vehicleNumber: matchingTrans?.vehicleNumber || 'TN 52 AB 1234',
      driverName: matchingTrans?.driverName || 'Murugan (Driver)',
      driverMobile: matchingTrans?.driverMobile || '9842109876',
      courierPartner: matchingTrans?.courierPartner || 'ABC Transport',
      trackingNumber: matchingTrans?.trackingNumber || 'TRK-ABC-99210',
      deliveryChallan: `DC-${plan.deliveryNumber || '001'}`
    }));
  };

  const handleSelectTransport = (transId) => {
    const t = vehiclesCouriers.find(v => v._id === transId);
    if (!t) return;

    setFormData(prev => ({
      ...prev,
      vehicleCourier: t._id,
      vehicleNumber: t.vehicleNumber || '',
      driverName: t.driverName || '',
      driverMobile: t.driverMobile || '',
      courierPartner: t.courierPartner || '',
      trackingNumber: t.trackingNumber || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryPlan) {
      showToast('Please select a planned delivery order', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Dispatch record confirmed! Finished Goods warehouse stock updated and tracking initiated.', 'success');
    } catch (err) {
      showToast(err.message || 'Error processing dispatch', 'error');
    }
  };

  const columns = [
    {
      header: 'Dispatch No',
      accessor: 'dispatchNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.dispatchNumber}</span>
    },
    {
      header: 'Delivery No',
      accessor: 'deliveryNumber',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.deliveryNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName
    },
    {
      header: 'Product & Serial No',
      render: (row) => (
        <div>
          <strong>{row.productName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SN: {row.serialNumber || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Dispatched Qty',
      accessor: 'actualDispatchQuantity',
      render: (row) => `${row.actualDispatchQuantity} Units`
    },
    {
      header: 'Transport / Vehicle',
      render: (row) => (
        <div>
          <span>{row.deliveryMethod === 'Company Vehicle' ? row.vehicleNumber : row.courierPartner}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.deliveryMethod === 'Company Vehicle' ? row.driverName : `Ref: ${row.trackingNumber || '-'}`}
          </div>
        </div>
      )
    },
    {
      header: 'Dispatch Date',
      accessor: 'dispatchDateTime',
      render: (row) => (row.dispatchDateTime ? new Date(row.dispatchDateTime).toLocaleString() : '-')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Dispatched'} />
    }
  ];

  return (
    <div className="module-container">
      {/* Inventory Protection Rule Banner */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.05)' }}>
        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Inventory Release Rule:</strong> Dispatching a product immediately decreases warehouse Finished Goods stock. Items cannot be dispatched without confirmed QA-passed serialization.
        </span>
      </div>

      <DataTable
        title="Warehouse Dispatch Management"
        subtitle="Authorize physical goods exit from warehouse loading dock with delivery challan and transport verification"
        columns={columns}
        data={dispatches}
        onAdd={handleOpenModal}
        addLabel="New Dispatch Slip"
      />

      {isModalOpen && (
        <Modal
          title="Warehouse Dispatch Slip"
          subtitle="Generate delivery challan, allocate transport, and release approved Finished Goods"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Delivery Plan Link */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageCheck size={16} /> 1. Delivery Plan & Customer Order
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Select Planned Delivery <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.deliveryPlan}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      required
                    >
                      <option value="">Select Planned Delivery</option>
                      {deliveryPlans.map(dp => (
                        <option key={dp._id} value={dp._id}>
                          {dp.deliveryNumber} — {dp.customerName} ({dp.productName}) — Qty: {dp.plannedDeliveryQuantity} — [{dp.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerName}
                      readOnly
                      placeholder="Auto-linked from Plan"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Linked Sales Order</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.soNumber}
                      readOnly
                      placeholder="Auto-linked from Plan"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Finished Goods Serial / Batch Tag <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.plannedQuantity}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Actual Dispatch Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={formData.plannedQuantity}
                      value={formData.actualDispatchQuantity}
                      onChange={(e) => setFormData({ ...formData, actualDispatchQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Warehouse & Transport Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={16} /> 2. Transport Allocation & Security Clearance
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Warehouse Dock Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.warehouseLocation}
                      onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatch Date & Time <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.dispatchDateTime}
                      onChange={(e) => setFormData({ ...formData, dispatchDateTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Select Registered Vehicle / Courier Partner</label>
                    <select
                      className="form-select"
                      value={formData.vehicleCourier}
                      onChange={(e) => handleSelectTransport(e.target.value)}
                    >
                      <option value="">Select Transport Vehicle / Partner</option>
                      {vehiclesCouriers.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.entityType === 'Company Vehicle' ? `${v.vehicleNumber} (Driver: ${v.driverName})` : `${v.courierPartner} (Tracking: ${v.trackingNumber || 'Standard'})`} — [{v.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatched By (Warehouse Officer) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dispatchedBy}
                      onChange={(e) => setFormData({ ...formData, dispatchedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Checked & Cleared By (Security Gate) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.checkedBy}
                      onChange={(e) => setFormData({ ...formData, checkedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Delivery Challan Reference No</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.deliveryChallan}
                      onChange={(e) => setFormData({ ...formData, deliveryChallan: e.target.value })}
                      placeholder="e.g. DC-DISP-001"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Crating & Packing Details</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.packingDetails}
                      onChange={(e) => setFormData({ ...formData, packingDetails: e.target.value })}
                      placeholder="e.g. Shock-mounted pallet crate with corner foam pads..."
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Dispatch Remarks & Waybill Notes</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Vehicle physical condition verified, driver verified with company badge..."
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
                <Truck size={14} /> Authorize Gate Exit & Confirm Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

