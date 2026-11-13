import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Navigation, Clock, MapPin, AlertCircle, CheckCircle2, Truck } from 'lucide-react';

export default function DeliveryTrackingModule({
  trackingRecords = [],
  deliveryPlans = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deliveryPlan: '',
    deliveryNumber: '',
    customerName: '',
    deliveryMethod: 'Company Vehicle',
    currentStatus: 'In Transit',
    currentLocation: '',
    updateDateTime: new Date().toISOString().slice(0, 16),
    expectedArrival: new Date(Date.now() + 48 * 3600000).toISOString().slice(0, 16),
    delayReason: '',
    remarks: '',
    trackingProof: '',
    updatedBy: 'Field Tracking Officer'
  });

  const handleOpenModal = () => {
    if (deliveryPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectPlan(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectPlan = (planId) => {
    const plan = deliveryPlans.find(p => p._id === planId);
    if (!plan) return;

    setFormData(prev => ({
      ...prev,
      deliveryPlan: plan._id,
      deliveryNumber: plan.deliveryNumber,
      customerName: plan.customerName,
      deliveryMethod: plan.deliveryMethod || 'Company Vehicle',
      currentLocation: 'NH Bypass Toll Gateway',
      remarks: `Consignment en route to ${plan.deliveryAddress?.slice(0, 30)}...`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryNumber || !formData.currentLocation) {
      showToast('Please provide Delivery Number and Current Location', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Tracking milestone logged successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating tracking', 'error');
    }
  };

  const columns = [
    {
      header: 'Tracking No',
      accessor: 'trackingNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.trackingNumber}</span>
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
      header: 'Method',
      accessor: 'deliveryMethod',
      render: (row) => (
        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          {row.deliveryMethod}
        </span>
      )
    },
    {
      header: 'Current Location',
      accessor: 'currentLocation',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={13} style={{ color: 'var(--cyan)' }} />
          <span>{row.currentLocation}</span>
        </div>
      )
    },
    {
      header: 'Expected Arrival',
      accessor: 'expectedArrival',
      render: (row) => (row.expectedArrival ? new Date(row.expectedArrival).toLocaleString() : '-')
    },
    {
      header: 'Transit Status',
      accessor: 'currentStatus',
      render: (row) => <StatusBadge status={row.currentStatus || 'In Transit'} />
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Delivery Tracking & Milestone Monitoring"
        subtitle="Real-time transit location updates, toll checkpoints, delay alerts, and ETA notifications"
        columns={columns}
        data={trackingRecords}
        onAdd={handleOpenModal}
        addLabel="Post Location Update"
      />

      {isModalOpen && (
        <Modal
          title="Post Live Transit Milestone"
          subtitle="Log GPS coordinate checkpoints, transit checkpoints, or delay notices"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Delivery Reference */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={16} /> 1. Shipment Reference & Consignee
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Active Delivery Plan <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.deliveryPlan}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      required
                    >
                      <option value="">Select Delivery Order</option>
                      {deliveryPlans.map(dp => (
                        <option key={dp._id} value={dp._id}>
                          {dp.deliveryNumber} — {dp.customerName} ({dp.productName}) — [{dp.status}]
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
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Transport Method</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.deliveryMethod}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Status & Location */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} /> 2. Location Checkpoint & Estimated Arrival
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Current Transit Status <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.currentStatus}
                      onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                    >
                      <option value="In Transit">In Transit (On Highway)</option>
                      <option value="Out for Delivery">Out for Delivery (Local Distribution)</option>
                      <option value="Delayed">Delayed (Traffic / Weather / Maintenance)</option>
                      <option value="Delivery Failed">Delivery Failed (Gate Closed / Access Denied)</option>
                      <option value="Returned">Returned (Customer Refusal / Incorrect Address)</option>
                      <option value="Delivered">Delivered (At Customer Gate)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Location / Checkpost <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Salem Bypass Toll Plaza - NH48"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Checkpoint Timestamp <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.updateDateTime}
                      onChange={(e) => setFormData({ ...formData, updateDateTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Arrival at Destination (ETA) <span className="req">*</span></label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.expectedArrival}
                      onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
                      required
                    />
                  </div>

                  {(formData.currentStatus === 'Delayed' || formData.currentStatus === 'Delivery Failed' || formData.currentStatus === 'Returned') && (
                    <div className="form-group col-span-2">
                      <label className="form-label" style={{ color: 'var(--danger)' }}>
                        Delay / Failure Reason & Corrective Follow-Up Action <span className="req">*</span>
                      </label>
                      <textarea
                        rows="2"
                        className="form-textarea"
                        placeholder="Specify highway accident, heavy rain, customer dock unready, driver replacement..."
                        value={formData.delayReason}
                        onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group col-span-2">
                    <label className="form-label">Milestone Remarks & Driver Feedback</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder="Driver reported smooth passage, temperature in container verified..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                Update Tracking Milestone
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

