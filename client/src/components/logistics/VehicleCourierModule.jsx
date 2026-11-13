import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Truck, ShieldCheck, User, Phone, Layers, Plus } from 'lucide-react';

export default function VehicleCourierModule({
  vehiclesCouriers = [],
  deliveryPlans = [],
  onSave,
  onUpdate,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    entityType: 'Company Vehicle',
    vehicleNumber: '',
    vehicleType: 'Van',
    driverName: '',
    driverMobile: '',
    licenseNumber: '',
    vehicleCapacity: '3.0 Tons',
    insuranceExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    courierPartner: 'ABC Transport',
    trackingNumber: '',
    serviceType: 'Express Cargo',
    contactPerson: '',
    contactMobile: '',
    remarks: ''
  });

  const handleOpenAdd = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.entityType === 'Company Vehicle' && (!formData.vehicleNumber || !formData.driverName)) {
      showToast('Please provide Vehicle Number and Driver Name', 'error');
      return;
    }
    if (formData.entityType === 'Courier / Transport' && !formData.courierPartner) {
      showToast('Please provide Courier Partner Name', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast(`${formData.entityType} registered successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error saving transport entity', 'error');
    }
  };

  const filteredData = vehiclesCouriers.filter(item => {
    if (activeTab === 'All') return true;
    return item.entityType === activeTab;
  });

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (row) => <span className="code-badge">{row.code}</span>
    },
    {
      header: 'Vehicle / Courier Partner',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>
            {row.entityType === 'Company Vehicle' ? row.vehicleNumber : row.courierPartner}
          </strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.entityType === 'Company Vehicle' ? `${row.vehicleType} • ${row.vehicleCapacity || ''}` : row.serviceType}
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'entityType',
      render: (row) => (
        <span className={`badge ${row.entityType === 'Company Vehicle' ? 'badge-info' : 'badge-neutral'}`}>
          {row.entityType}
        </span>
      )
    },
    {
      header: 'Contact / Tracking Info',
      render: (row) => (
        <div>
          {row.entityType === 'Company Vehicle' ? (
            <div>
              <span>{row.driverName}</span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.driverMobile}</div>
            </div>
          ) : (
            <div>
              <span className="font-mono" style={{ color: '#818CF8' }}>{row.trackingNumber || 'Tracking ID'}</span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.contactPerson} ({row.contactMobile})</div>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Assigned Delivery',
      accessor: 'assignedDeliveryNumber',
      render: (row) => (
        row.assignedDeliveryNumber ? (
          <span className="font-mono text-cyan" style={{ fontWeight: 600 }}>{row.assignedDeliveryNumber}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None (Idle)</span>
        )
      )
    },
    {
      header: 'Fleet Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Available'} />
    }
  ];

  return (
    <div className="module-container">
      {/* Method Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['All', 'Company Vehicle', 'Courier / Transport'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Company Vehicle' ? <Truck size={14} /> : tab === 'Courier / Transport' ? <Layers size={14} /> : null}
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        title="Vehicle & Courier Management"
        subtitle="Maintain internal fleet, drivers, and external freight & courier transport partners"
        columns={columns}
        data={filteredData}
        onAdd={handleOpenAdd}
        addLabel="Add Vehicle / Courier"
      />

      {isModalOpen && (
        <Modal
          title="Register Transport Entity"
          subtitle="Add company delivery vehicle or configure 3rd-party freight carrier"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Entity Type Selector */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Delivery Transport Method <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  >
                    <option value="Company Vehicle">Company Vehicle (Own Fleet & Driver)</option>
                    <option value="Courier / Transport">Courier / Transport (3rd-Party Logistics Provider)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Form: Company Vehicle */}
              {formData.entityType === 'Company Vehicle' ? (
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={16} /> Company Vehicle & Driver Details
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Vehicle Registration Number <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. TN 52 AB 1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Vehicle Body Type</label>
                      <select
                        className="form-select"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      >
                        <option value="Van">Light Van / Cargo Van</option>
                        <option value="Truck">Medium Duty Truck</option>
                        <option value="Heavy Lorry">Heavy Transport Lorry</option>
                        <option value="Car">Utility Car</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assigned Driver Name <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Murugan"
                        value={formData.driverName}
                        onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Driver Mobile Number <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 9842109876"
                        value={formData.driverMobile}
                        onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Driver License Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. TN-43-2018-09142"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Vehicle Load Capacity</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 3.5 Tons / 10 Units"
                        value={formData.vehicleCapacity}
                        onChange={(e) => setFormData({ ...formData, vehicleCapacity: e.target.value })}
                      />
                    </div>

                    <div className="form-group col-span-2">
                      <label className="form-label">Insurance / Fitness Certificate Expiry</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.insuranceExpiry}
                        onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Conditional Form: Courier / Transport */
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} /> Courier & Freight Carrier Details
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Courier / Logistics Provider <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. ABC Transport, BlueDart, VRL"
                        value={formData.courierPartner}
                        onChange={(e) => setFormData({ ...formData, courierPartner: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Service Grade</label>
                      <select
                        className="form-select"
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      >
                        <option value="Express Cargo">Express Dedicated Cargo</option>
                        <option value="Standard Surface">Standard Surface Freight</option>
                        <option value="Air Freight">Air Freight Priority</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hub Contact Person</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Branch Dispatch Officer"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Carrier Phone / Helpline</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 044-22334455"
                        value={formData.contactMobile}
                        onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                      />
                    </div>

                    <div className="form-group col-span-2">
                      <label className="form-label">Consignment / Booking Account Reference</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Corporate A/C # CRYO-9982"
                        value={formData.trackingNumber}
                        onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Fleet Remarks & Operating Notes</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    placeholder="Route restrictions, speed governor installed, toll fastag enabled..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Transport Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

