import React, { useState } from 'react';
import { Plus, Eye, Edit3, Building2 } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function SuppliersModule({ suppliers, onSave, onUpdate, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    supplierCode: '',
    supplierName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    gstNumber: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    paymentTerms: 'Net 30 Days',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setFormData({
      supplierCode: '',
      supplierName: '',
      contactPerson: '',
      mobileNumber: '',
      email: '',
      gstNumber: '',
      address: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '',
      paymentTerms: 'Net 30 Days',
      status: 'Active'
    });
    setIsEditMode(false);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setFormData({
      supplierCode: sup.supplierCode,
      supplierName: sup.supplierName,
      contactPerson: sup.contactPerson,
      mobileNumber: sup.mobileNumber,
      email: sup.email || '',
      gstNumber: sup.gstNumber || '',
      address: sup.address || '',
      city: sup.city || '',
      state: sup.state || 'Tamil Nadu',
      pincode: sup.pincode || '',
      paymentTerms: sup.paymentTerms || 'Net 30 Days',
      status: sup.status || 'Active'
    });
    setSelectedSupplier(sup);
    setIsEditMode(true);
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedSupplier) {
        await onUpdate(selectedSupplier._id, formData);
        showToast('Supplier updated successfully', 'success');
      } else {
        await onSave(formData);
        showToast('Supplier registered successfully', 'success');
      }
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Supplier Code',
      accessor: 'supplierCode',
      render: (row) => (
        <span 
          className="code-badge"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSupplier(row);
          }}
        >
          {row.supplierCode}
        </span>
      )
    },
    {
      header: 'Supplier Name',
      accessor: 'supplierName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.supplierName}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{row.email || 'No email registered'}</div>
        </div>
      )
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson',
      render: (row) => <span>{row.contactPerson}</span>
    },
    {
      header: 'Phone',
      accessor: 'mobileNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.mobileNumber}</span>
    },
    {
      header: 'GST Number',
      accessor: 'gstNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.gstNumber || '—'}</span>
    },
    {
      header: 'City / State',
      accessor: 'city',
      render: (row) => `${row.city}, ${row.state}`
    },
    {
      header: 'Payment Terms',
      accessor: 'paymentTerms',
      render: (row) => <span className="nav-badge-pill">{row.paymentTerms}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Details" onClick={() => setSelectedSupplier(row)}>
            <Eye size={15} />
          </button>
          <button className="icon-btn" title="Edit Supplier" onClick={() => handleOpenEdit(row)}>
            <Edit3 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Suppliers" value={suppliers.length} subtext="Registered Vendors" icon={Building2} color="#3B82F6" />
        <KpiCard title="Active Vendors" value={suppliers.filter(s => s.status === 'Active').length} subtext="Operational" icon={Building2} color="#10B981" />
        <KpiCard title="Tamil Nadu Region" value={suppliers.filter(s => s.state?.includes('Tamil')).length} subtext="Local Sourcing" icon={Building2} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search supplier name, person, GST..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Supplier
          </button>
        }
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEditMode ? 'Edit Supplier' : 'Register New Supplier'}
        subtitle="Maintain vendor contact info, tax registration, and commercial payment terms"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. SUP-001)"
                value={formData.supplierCode}
                onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                disabled={isEditMode}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Company Name <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. ABC Steels & Alloys Pvt Ltd"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Kumar Mohan"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number <span className="req">*</span></label>
              <input
                type="tel"
                className="form-input"
                required
                placeholder="10-digit mobile number"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="supplier@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST Number (GSTIN)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 33AABCA1234F1Z9"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Factory / Office Address</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Street address, industrial plot no..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <select
                className="form-select"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Delhi">Delhi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-input"
                placeholder="600058"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Immediate">Immediate / Cash</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
                <option value="Advance 100%">Advance 100%</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedSupplier && !isAddOpen}
        onClose={() => setSelectedSupplier(null)}
        title={`Supplier: ${selectedSupplier?.supplierCode}`}
        subtitle={selectedSupplier?.supplierName}
      >
        {selectedSupplier && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Supplier Code</div>
              <div className="detail-value">{selectedSupplier.supplierCode}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={selectedSupplier.status} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact Person</div>
              <div className="detail-value">{selectedSupplier.contactPerson}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Phone Number</div>
              <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedSupplier.mobileNumber}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{selectedSupplier.email || '—'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">GSTIN</div>
              <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedSupplier.gstNumber || 'Not provided'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Payment Terms</div>
              <div className="detail-value">{selectedSupplier.paymentTerms}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Location</div>
              <div className="detail-value">{selectedSupplier.city}, {selectedSupplier.state} - {selectedSupplier.pincode}</div>
            </div>
            <div className="detail-item col-span-2">
              <div className="detail-label">Address</div>
              <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                {selectedSupplier.address || 'No street address given.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

