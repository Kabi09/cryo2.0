import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { CheckCircle2, AlertTriangle, FileCheck, User, Phone, ShieldCheck } from 'lucide-react';

export default function DeliveryConfirmationModule({
  confirmations = [],
  deliveryPlans = [],
  dispatches = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deliveryPlan: '',
    deliveryNumber: '',
    dispatch: '',
    dispatchNumber: '',
    customer: '',
    customerName: '',
    product: '',
    productName: '',
    dispatchedQuantity: 1,
    receivedQuantity: 1,
    pendingQuantity: 0,
    deliveryDateTime: new Date().toISOString().slice(0, 16),
    receivedBy: 'Ramesh (Site Manager)',
    customerMobile: '9876543210',
    customerSignature: 'Signed on delivery challan tablet',
    productCondition: 'Good',
    damageRemarks: '',
    podDocument: 'POD-CHALLAN-SIGNED.pdf',
    installationRequired: true,
    remarks: 'Goods received in intact condition, verified serial number on nameplate.'
  });

  const handleOpenModal = () => {
    const inTransitPlans = deliveryPlans.filter(p => p.status === 'In Transit' || p.status === 'Dispatched');
    if (inTransitPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectPlan(inTransitPlans[0]._id);
    } else if (deliveryPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectPlan(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectPlan = (planId) => {
    const plan = deliveryPlans.find(p => p._id === planId);
    if (!plan) return;

    const linkedDisp = dispatches.find(d => String(d.deliveryPlan?._id || d.deliveryPlan) === String(plan._id));
    const dispQty = linkedDisp ? linkedDisp.actualDispatchQuantity : plan.plannedDeliveryQuantity || 1;

    setFormData(prev => ({
      ...prev,
      deliveryPlan: plan._id,
      deliveryNumber: plan.deliveryNumber,
      dispatch: linkedDisp ? linkedDisp._id : '',
      dispatchNumber: linkedDisp ? linkedDisp.dispatchNumber : 'DISP-001',
      customer: plan.customer?._id || plan.customer,
      customerName: plan.customerName,
      product: plan.product?._id || plan.product,
      productName: plan.productName,
      dispatchedQuantity: dispQty,
      receivedQuantity: dispQty,
      pendingQuantity: 0,
      receivedBy: plan.contactPerson || 'Site Receiving Officer',
      customerMobile: plan.mobileNumber || '9876543210',
      installationRequired: plan.installationRequired !== false
    }));
  };

  const handleReceivedQtyChange = (val) => {
    const rec = Number(val) || 0;
    const disp = Number(formData.dispatchedQuantity) || 1;
    const pending = Math.max(0, disp - rec);

    setFormData(prev => ({
      ...prev,
      receivedQuantity: rec,
      pendingQuantity: pending
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryNumber || !formData.receivedBy) {
      showToast('Please specify delivery number and receiver name', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Proof of Delivery (POD) confirmed! Delivery marked complete and technician notified.', 'success');
    } catch (err) {
      showToast(err.message || 'Error confirming delivery', 'error');
    }
  };

  const columns = [
    {
      header: 'POD No',
      accessor: 'confirmationNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.confirmationNumber}</span>
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
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Quantities',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {row.receivedQuantity} / {row.dispatchedQuantity} Received
          </span>
          {row.pendingQuantity > 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 600 }}>
              Balance: {row.pendingQuantity} Pending
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Received By',
      render: (row) => (
        <div>
          <span>{row.receivedBy}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customerMobile}</div>
        </div>
      )
    },
    {
      header: 'Condition',
      accessor: 'productCondition',
      render: (row) => (
        <span className={`badge ${row.productCondition === 'Good' ? 'badge-success' : 'badge-danger'}`}>
          {row.productCondition}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Delivered'} />
    }
  ];

  return (
    <div className="module-container">
      {/* Partial Delivery Rule Banner */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(6, 182, 212, 0.05)' }}>
        <CheckCircle2 size={18} style={{ color: 'var(--cyan)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Proof of Delivery (POD) Rule:</strong> If only part of the shipment is received, record the received quantity and keep the balance pending. The system will automatically spawn an on-site Installation job when installation is required.
        </span>
      </div>

      <DataTable
        title="Delivery Confirmation & Proof of Delivery (POD)"
        subtitle="Confirm customer physical receipt, capture electronic signature / stamp, and inspect cargo condition"
        columns={columns}
        data={confirmations}
        onAdd={handleOpenModal}
        addLabel="Confirm POD"
      />

      {isModalOpen && (
        <Modal
          title="Customer Proof of Delivery (POD) Confirmation"
          subtitle="Record consignee sign-off, verify received quantities against dispatched challan, and log condition"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Delivery Reference */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={16} /> 1. Consignment Order Verification
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Select Delivery Consignment <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.deliveryPlan}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      required
                    >
                      <option value="">Select Delivery Consignment</option>
                      {deliveryPlans.map(dp => (
                        <option key={dp._id} value={dp._id}>
                          {dp.deliveryNumber} — {dp.customerName} ({dp.productName}) — Qty: {dp.plannedDeliveryQuantity} — [{dp.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerName}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivered Product</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatched Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.dispatchedQuantity}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Actual Received Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max={formData.dispatchedQuantity}
                      value={formData.receivedQuantity}
                      onChange={(e) => handleReceivedQtyChange(e.target.value)}
                      required
                    />
                  </div>

                  {formData.pendingQuantity > 0 && (
                    <div className="form-group col-span-2">
                      <div className="card" style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', fontSize: '0.8rem', color: 'var(--warning)' }}>
                        <strong>Partial Receipt Detected:</strong> {formData.pendingQuantity} units remaining pending on this sales order. Delivery will be logged as Partial Delivery.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Acceptance & Sign-Off */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} /> 2. Customer Acceptance & Physical Condition
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Received By (Customer Representative) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.receivedBy}
                      onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Receiver Contact Mobile <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerMobile}
                      onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Arrival & Handover Timestamp <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.deliveryDateTime}
                      onChange={(e) => setFormData({ ...formData, deliveryDateTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivered Cargo Condition <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.productCondition}
                      onChange={(e) => setFormData({ ...formData, productCondition: e.target.value })}
                    >
                      <option value="Good">Good (Sealed, No Damage)</option>
                      <option value="Partially Damaged">Partially Damaged (Crate Scratched)</option>
                      <option value="Damaged">Damaged (Rejected / Heavy Impact)</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Customer Signature / E-Challan Acknowledgment <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerSignature}
                      onChange={(e) => setFormData({ ...formData, customerSignature: e.target.value })}
                      placeholder="e.g. Signed electronically on driver tablet by Site Manager"
                      required
                    />
                  </div>

                  {formData.productCondition !== 'Good' && (
                    <div className="form-group col-span-2">
                      <label className="form-label" style={{ color: 'var(--danger)' }}>
                        Damage Details & Transit Claim Notes <span className="req">*</span>
                      </label>
                      <textarea
                        rows="2"
                        className="form-textarea"
                        value={formData.damageRemarks}
                        onChange={(e) => setFormData({ ...formData, damageRemarks: e.target.value })}
                        placeholder="Detail impact, dent on side panel, broken glass, photos taken..."
                        required
                      />
                    </div>
                  )}

                  <div className="form-group col-span-2">
                    <label className="form-label">Proof of Delivery (POD) Document File Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.podDocument}
                      onChange={(e) => setFormData({ ...formData, podDocument: e.target.value })}
                      placeholder="e.g. POD-CHALLAN-ABC-SIGNED.pdf"
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Receiving Remarks & Handover Notes</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Customer verified packing seal, power connection ready for installation technician..."
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
                <CheckCircle2 size={14} /> Confirm Delivery Receipt & Auto-Schedule Installation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

