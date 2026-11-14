import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { CheckCircle2, AlertTriangle, FileCheck, User, Phone, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function DeliveryConfirmationModule({
  confirmations = [],
  deliveryPlans = [],
  dispatches = [],
  onSave,
  showToast,
  defaultTab = 'pending'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
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
    receivedBy: 'Site Receiving Officer',
    customerMobile: '9876543210',
    customerSignature: 'Signed on delivery challan copy',
    productCondition: 'Good',
    damageRemarks: '',
    podDocument: 'POD-CHALLAN-SIGNED.pdf',
    installationRequired: true,
    remarks: 'Goods received in intact condition, verified serial number on nameplate.'
  });

  // Dispatches awaiting customer confirmation
  const pendingDispatches = dispatches.filter(d => {
    return !confirmations.some(c => String(c.dispatch?._id || c.dispatch) === String(d._id) || c.dispatchNumber === d.dispatchNumber);
  });

  const handleOpenModal = (targetDispatch = null) => {
    if (targetDispatch) {
      handleSelectDispatch(targetDispatch);
    } else if (pendingDispatches.length > 0) {
      handleSelectDispatch(pendingDispatches[0]);
    } else if (deliveryPlans.length > 0) {
      handleSelectPlan(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectDispatch = (disp) => {
    const linkedPlan = deliveryPlans.find(p => String(p._id) === String(disp.deliveryPlan?._id || disp.deliveryPlan));
    setFormData(prev => ({
      ...prev,
      deliveryPlan: linkedPlan?._id || disp.deliveryPlan || '',
      deliveryNumber: disp.deliveryNumber || linkedPlan?.deliveryNumber || '',
      dispatch: disp._id,
      dispatchNumber: disp.dispatchNumber,
      customer: disp.customer?._id || disp.customer || linkedPlan?.customer || '',
      customerName: disp.customerName || linkedPlan?.customerName || '',
      product: disp.product?._id || disp.product || linkedPlan?.product || '',
      productName: disp.productName || linkedPlan?.productName || '',
      dispatchedQuantity: disp.actualDispatchQuantity || 1,
      receivedQuantity: disp.actualDispatchQuantity || 1,
      pendingQuantity: 0,
      receivedBy: linkedPlan?.contactPerson || 'Site Receiving Officer',
      customerMobile: linkedPlan?.mobileNumber || '9876543210',
      installationRequired: linkedPlan ? linkedPlan.installationRequired !== false : true
    }));
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
      render: (row) => <span className="code-badge">{row.confirmationNumber}</span>
    },
    {
      header: 'Delivery No',
      accessor: 'deliveryNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{row.deliveryNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.customerName}</strong>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.productName}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Qty: {row.receivedQuantity} / {row.dispatchedQuantity}
          </div>
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
      header: 'Delivered Date',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.deliveryDateTime ? new Date(row.deliveryDateTime).toLocaleDateString('en-GB') : '—'}
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
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Pending POD ({pendingDispatches.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmed')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Confirmed Receipts ({confirmations.length})
          </button>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
          <FileCheck size={14} /> Record Delivery Confirmation
        </button>
      </div>

      {/* Tab 1: Pending POD */}
      {activeTab === 'pending' && (
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
                Consignments Awaiting Proof of Delivery (POD)
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Warehouse dispatches en route or arrived at client site requiring signed receipt & condition check
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dispatch No</th>
                  <th>Delivery Ref</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Dispatched Qty</th>
                  <th>Dispatch Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDispatches.map(disp => (
                  <tr key={disp._id}>
                    <td><span className="code-badge">{disp.dispatchNumber}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{disp.deliveryNumber}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{disp.customerName}</strong></td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{disp.productName}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {disp.actualDispatchQuantity || 1} Units
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {disp.dispatchDateTime ? new Date(disp.dispatchDateTime).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4 }}
                        onClick={() => handleOpenModal(disp)}
                      >
                        <CheckCircle2 size={13} /> Confirm POD ➔
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingDispatches.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      <CheckCircle2 size={24} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 6px' }} />
                      All dispatched deliveries have confirmed proof-of-delivery (POD) records!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Confirmed Receipts */}
      {activeTab === 'confirmed' && (
        <DataTable
          title="Verified Delivery Confirmations"
          subtitle="Signed delivery receipts, partial delivery records, and inspected cargo condition"
          columns={columns}
          data={confirmations}
          searchPlaceholder="Search customer, delivery ref, POD..."
        />
      )}

      {/* Modal: Confirm Delivery */}
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
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={16} /> 1. Consignment Order Verification
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Select Delivery Consignment <span className="req">*</span></label>
                    <select
                      className="form-input"
                      value={formData.deliveryPlan}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Dispatched Delivery Plan --</option>
                      {deliveryPlans.map(plan => (
                        <option key={plan._id} value={plan._id}>
                          {plan.deliveryNumber} — {plan.customerName} ({plan.productName} • Qty: {plan.plannedDeliveryQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-input" value={formData.customerName} readOnly />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input type="text" className="form-input" value={formData.productName} readOnly />
                  </div>
                </div>
              </div>

              {/* Quantity Reconciliation */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                  2. Quantity Received & Acceptance
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Dispatched Quantity</label>
                    <input type="number" className="form-input font-mono" value={formData.dispatchedQuantity} readOnly />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Received Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input font-mono"
                      value={formData.receivedQuantity}
                      min="1"
                      max={formData.dispatchedQuantity}
                      onChange={(e) => handleReceivedQtyChange(e.target.value)}
                      required
                    />
                  </div>

                  {formData.pendingQuantity > 0 && (
                    <div className="form-group col-span-2">
                      <div className="card" style={{ padding: '10px 14px', borderLeft: '3px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 600 }}>
                          Partial Delivery Detected: Remaining {formData.pendingQuantity} units will stay open on the delivery plan.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Cargo Condition <span className="req">*</span></label>
                    <select
                      className="form-input"
                      value={formData.productCondition}
                      onChange={(e) => setFormData({ ...formData, productCondition: e.target.value })}
                    >
                      <option value="Good">Intact / Good Condition</option>
                      <option value="Minor Scratch / Dent">Minor Packaging Scratch / Dent</option>
                      <option value="Damaged">Damaged - Rejection / Claim</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Date & Time <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.deliveryDateTime}
                      onChange={(e) => setFormData({ ...formData, deliveryDateTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Consignee Signature Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                  3. Consignee Verification
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Received By (Person) <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Kumar (Site Supervisor)"
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
                      placeholder="e.g. 9876543210"
                      value={formData.customerMobile}
                      onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Proof of Delivery (POD) Notes / Remarks</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Proof of Delivery (POD)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
