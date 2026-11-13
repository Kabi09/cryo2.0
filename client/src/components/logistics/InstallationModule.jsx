import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Wrench, Calendar, MapPin, User, CheckCircle2, AlertTriangle, Clock, Phone, FileText } from 'lucide-react';

export default function InstallationModule({
  installations = [],
  deliveryPlans = [],
  onSave,
  onUpdateStatus,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    deliveryPlan: '',
    deliveryNumber: '',
    salesOrder: '',
    soNumber: '',
    customer: '',
    customerName: '',
    installationAddress: '',
    contactPerson: '',
    mobileNumber: '',
    product: '',
    productName: '',
    serialNumber: '',
    installationQuantity: 1,
    assignedTechnician: 'Er. Rajesh Kumar (Senior Field Engineer)',
    plannedInstallationDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    requiredTools: 'Multimeter, Torque Wrench Set, Fluke Thermal Camera, Software Dongle, Grounding Tester',
    installationInstructions: 'Verify 3-phase 415V power stability, test pneumatic connections, ensure dust-free cleanroom environment before powering on.',
    customerRequirements: 'Ensure customer engineering lead is available for handover training.',
    remarks: ''
  });

  const handleOpenModal = () => {
    // Attempt auto-populate with first eligible delivery plan
    if (deliveryPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectDelivery(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectDelivery = (planId) => {
    const plan = deliveryPlans.find(p => p._id === planId);
    if (!plan) return;

    setFormData(prev => ({
      ...prev,
      deliveryPlan: plan._id,
      deliveryNumber: plan.deliveryNumber || '',
      salesOrder: plan.salesOrder?._id || plan.salesOrder || '',
      soNumber: plan.soNumber || '',
      customer: plan.customer?._id || plan.customer || '',
      customerName: plan.customerName || '',
      installationAddress: plan.deliveryAddress || '',
      contactPerson: plan.contactPerson || '',
      mobileNumber: plan.mobileNumber || '',
      product: plan.product?._id || plan.product || '',
      productName: plan.productName || '',
      serialNumber: plan.serialNumber || 'SN-PENDING',
      installationQuantity: plan.plannedDeliveryQuantity || 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryNumber || !formData.customerName || !formData.productName) {
      showToast?.('Please link a valid delivery and customer record', 'error');
      return;
    }
    try {
      await onSave?.(formData);
      setIsModalOpen(false);
      showToast?.('Installation scheduled successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Error scheduling installation', 'error');
    }
  };

  const columns = [
    {
      header: 'Installation No',
      accessor: 'installationNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.installationNumber}</span>
    },
    {
      header: 'Delivery Ref',
      accessor: 'deliveryNumber',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.deliveryNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.customerName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.contactPerson || 'N/A'} • {row.mobileNumber || ''}
          </div>
        </div>
      )
    },
    {
      header: 'Product & Serial',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span>{row.productName}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            SN: {row.serialNumber || 'N/A'} ({row.installationQuantity || 1} Units)
          </div>
        </div>
      )
    },
    {
      header: 'Technician',
      accessor: 'assignedTechnician',
      render: (row) => <span>{row.assignedTechnician}</span>
    },
    {
      header: 'Planned Date',
      accessor: 'plannedInstallationDate',
      render: (row) => (row.plannedInstallationDate ? new Date(row.plannedInstallationDate).toLocaleDateString() : 'N/A')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setSelectedItem(row)}
            className="btn btn-secondary btn-sm"
          >
            View Details
          </button>
          {row.status === 'Scheduled' && (
            <button
              onClick={() => onUpdateStatus?.(row._id, 'In Progress')}
              className="btn btn-primary btn-sm"
              title="Start On-Site Work"
            >
              Start
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Installation & Commissioning"
        subtitle="Schedule on-site technical deployment, tool allocation, and engineer dispatch for delivered machinery"
        columns={columns}
        data={installations}
        onAdd={handleOpenModal}
        addLabel="Schedule Installation"
      />

      {/* Schedule Installation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Machine Installation & Handover"
          subtitle="Assign certified service engineers and coordinate site deployment readiness"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Delivery Reference */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wrench size={16} /> 1. Linked Delivery & Equipment Particulars
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Delivery Order Reference <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.deliveryPlan}
                      onChange={(e) => handleSelectDelivery(e.target.value)}
                      required
                    >
                      <option value="">Select Delivered Shipment</option>
                      {deliveryPlans.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.deliveryNumber} — {p.customerName} ({p.productName})
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
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sales Order Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.soNumber}
                      readOnly
                      style={{ opacity: 0.8, fontFamily: 'var(--font-mono)' }}
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
                    <label className="form-label">Mobile Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Customer Site Installation Address <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.installationAddress}
                      onChange={(e) => setFormData({ ...formData, installationAddress: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial Number <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Technician & Schedule */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} /> 2. Technical Engineer & Schedule Planning
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Assigned Lead Technician <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.assignedTechnician}
                      onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      required
                    >
                      <option value="Er. Rajesh Kumar (Senior Field Engineer)">Er. Rajesh Kumar (Senior Field Engineer)</option>
                      <option value="Er. Vinoth S (Automation Specialist)">Er. Vinoth S (Automation Specialist)</option>
                      <option value="Er. Dinesh K (Electrical Engineer)">Er. Dinesh K (Electrical Engineer)</option>
                      <option value="Er. Anandhan M (Pneumatics Lead)">Er. Anandhan M (Pneumatics Lead)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Installation Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.plannedInstallationDate}
                      onChange={(e) => setFormData({ ...formData, plannedInstallationDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Required Tools & Specialized Equipment</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.requiredTools}
                      onChange={(e) => setFormData({ ...formData, requiredTools: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Pre-Installation Site Instructions</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.installationInstructions}
                      onChange={(e) => setFormData({ ...formData, installationInstructions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Confirm Installation Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Installation Job Details: ${selectedItem.installationNumber}`}
          subtitle={`Delivery Ref: ${selectedItem.deliveryNumber} • ${selectedItem.customerName}`}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Installation Number</div>
                <div className="detail-value font-mono text-cyan">{selectedItem.installationNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedItem.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Name</div>
                <div className="detail-value">{selectedItem.customerName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedItem.contactPerson} ({selectedItem.mobileNumber})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Product Name</div>
                <div className="detail-value">{selectedItem.productName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Serial Number</div>
                <div className="detail-value font-mono text-cyan">{selectedItem.serialNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Assigned Technician</div>
                <div className="detail-value">{selectedItem.assignedTechnician}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Planned Date</div>
                <div className="detail-value">
                  {selectedItem.plannedInstallationDate ? new Date(selectedItem.plannedInstallationDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <div className="detail-label">Site Address</div>
                <div className="detail-value">{selectedItem.installationAddress}</div>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <div className="detail-label">Required Tools</div>
                <div className="detail-value">{selectedItem.requiredTools || 'Standard Tool Set'}</div>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <div className="detail-label">Site Instructions</div>
                <div className="detail-value">{selectedItem.installationInstructions || 'None'}</div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
