import React, { useState } from 'react';
import { Plus, Eye, MessageSquarePlus, UserCheck, ArrowRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function EnquiriesModule({ enquiries, products, customers, onSave, onConvertToLead, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    enquiryNumber: '',
    enquiryDate: new Date().toISOString().split('T')[0],
    customerType: 'New',
    customer: '',
    companyName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    address: '',
    product: '',
    quantity: 1,
    unit: 'Nos',
    requiredDeliveryDate: '',
    additionalRequirements: '',
    enquirySource: 'Website',
    assignedSalesPerson: 'Sales Executive',
    remarks: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      enquiryNumber: '',
      enquiryDate: new Date().toISOString().split('T')[0],
      customerType: 'New',
      customer: '',
      companyName: '',
      contactPerson: '',
      mobileNumber: '',
      email: '',
      address: '',
      product: products[0]?._id || '',
      quantity: 1,
      unit: products[0]?.unit || 'Nos',
      requiredDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      additionalRequirements: '',
      enquirySource: 'Website',
      assignedSalesPerson: 'Sales Executive',
      remarks: ''
    });
    setIsAddOpen(true);
  };

  const handleCustomerTypeChange = (type) => {
    if (type === 'Existing' && customers.length > 0) {
      const firstCust = customers[0];
      setFormData({
        ...formData,
        customerType: 'Existing',
        customer: firstCust._id,
        companyName: firstCust.companyName,
        contactPerson: firstCust.contactPerson,
        mobileNumber: firstCust.mobileNumber,
        email: firstCust.email,
        address: firstCust.billingAddress
      });
    } else {
      setFormData({
        ...formData,
        customerType: 'New',
        customer: '',
        companyName: '',
        contactPerson: '',
        mobileNumber: '',
        email: '',
        address: ''
      });
    }
  };

  const handleSelectCustomer = (custId) => {
    const cust = customers.find(c => c._id === custId);
    if (cust) {
      setFormData({
        ...formData,
        customer: cust._id,
        companyName: cust.companyName,
        contactPerson: cust.contactPerson,
        mobileNumber: cust.mobileNumber,
        email: cust.email,
        address: cust.billingAddress
      });
    }
  };

  const handleProductChange = (prodId) => {
    const prod = products.find(p => p._id === prodId);
    setFormData({
      ...formData,
      product: prodId,
      unit: prod?.unit || 'Nos'
    });
  };

  const handleSubmit = async (convertToLead = false) => {
    try {
      if (!formData.companyName || !formData.contactPerson) {
        showToast('Please enter company and contact details', 'error');
        return;
      }
      if (!formData.product) {
        showToast('Please select a product requirement', 'error');
        return;
      }

      await onSave({
        ...formData,
        convertToLead
      });

      showToast(
        convertToLead
          ? 'Enquiry saved & automatically converted to Lead!'
          : 'Enquiry registered successfully!',
        'success'
      );
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleConvertLeadClick = async (enquiryId) => {
    try {
      await onConvertToLead(enquiryId);
      showToast('Enquiry converted to Lead without duplicate customer entry!', 'success');
      if (selectedEnquiry) {
        setSelectedEnquiry({ ...selectedEnquiry, status: 'Converted to Lead' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Enquiry No',
      accessor: 'enquiryNumber',
      render: (row) => (
        <span
          className="code-badge"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEnquiry(row);
          }}
        >
          {row.enquiryNumber}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'enquiryDate',
      render: (row) => new Date(row.enquiryDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Customer',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.companyName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#C7D2FE' }}>
            {row.product?.productName || 'Custom Product'}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Code: {row.product?.productCode}
          </div>
        </div>
      )
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => `${row.quantity} ${row.unit || 'Nos'}`
    },
    {
      header: 'Source',
      accessor: 'enquirySource',
      render: (row) => <span className="nav-badge-pill">{row.enquirySource}</span>
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
          <button className="icon-btn" title="View Enquiry Details" onClick={() => setSelectedEnquiry(row)}>
            <Eye size={15} />
          </button>
          {row.status === 'New' && (
            <button
              className="icon-btn"
              title="Convert to Lead Opportunity"
              style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              onClick={() => handleConvertLeadClick(row._id)}
            >
              <UserCheck size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Enquiries" value={enquiries.length} subtext="Prospect Inward" icon={MessageSquarePlus} color="#6366F1" />
        <KpiCard title="New Unprocessed" value={enquiries.filter(e => e.status === 'New').length} subtext="Pending Qualification" icon={MessageSquarePlus} color="#F59E0B" />
        <KpiCard title="Converted to Leads" value={enquiries.filter(e => e.status === 'Converted to Lead').length} subtext="Pipeline Qualified" icon={UserCheck} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={enquiries}
        searchPlaceholder="Search enquiry no, customer, product..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> New Customer Enquiry
          </button>
        }
      />

      {/* Add Enquiry Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Record New Customer Enquiry"
        subtitle="Log prospect interest and specifications with 1-click lead conversion"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
          {/* Section 1: Customer Details */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8', marginBottom: 12 }}>
            1. Customer Information
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="custType"
                    checked={formData.customerType === 'New'}
                    onChange={() => handleCustomerTypeChange('New')}
                  />
                  <span>New Customer</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="custType"
                    checked={formData.customerType === 'Existing'}
                    onChange={() => handleCustomerTypeChange('Existing')}
                  />
                  <span>Existing Client</span>
                </label>
              </div>
            </div>

            {formData.customerType === 'Existing' && (
              <div className="form-group">
                <label className="form-label">Select Existing Customer <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={formData.customer}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                >
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.companyName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Company Name <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. ABC Industries Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Kumar Mohan"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number <span className="req">*</span></label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="9876543210"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="kumar@abcindustries.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Customer Plant / Delivery Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Industrial Plot, City, State..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Product Details */}
          <div style={{ margin: '22px 0 12px', fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
            2. Product Requirement Details
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Required <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.product}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Select Product from Master</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.productCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Required <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  style={{ width: 80, textAlign: 'center' }}
                  value={formData.unit}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Delivery Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.requiredDeliveryDate}
                onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enquiry Source</label>
              <select
                className="form-select"
                value={formData.enquirySource}
                onChange={(e) => setFormData({ ...formData, enquirySource: e.target.value })}
              >
                <option value="Website">Website</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="Referral">Referral</option>
                <option value="Direct">Direct</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Additional Technical Requirements</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Voltage specs, customization options, speed parameters..."
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Commercial Meta */}
          <div style={{ margin: '22px 0 12px', fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
            3. Assignment & Remarks
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assigned Sales Executive</label>
              <input
                type="text"
                className="form-input"
                value={formData.assignedSalesPerson}
                onChange={(e) => setFormData({ ...formData, assignedSalesPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Internal Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="Urgent lead, competitor quotes in play..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSubmit(false)}
            >
              Save Enquiry
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit(true)}
            >
              Save & Convert to Lead Opportunity
            </button>
          </div>
        </form>
      </Modal>

      {/* View Enquiry Details Modal */}
      <Modal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        size="lg"
        title={`Enquiry: ${selectedEnquiry?.enquiryNumber}`}
        subtitle={`From ${selectedEnquiry?.companyName}`}
      >
        {selectedEnquiry && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Enquiry No</div>
                <div className="detail-value">{selectedEnquiry.enquiryNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedEnquiry.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Company</div>
                <div className="detail-value">{selectedEnquiry.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedEnquiry.contactPerson}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Phone & Email</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {selectedEnquiry.mobileNumber} • {selectedEnquiry.email || '—'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Enquiry Source</div>
                <div className="detail-value">{selectedEnquiry.enquirySource}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Product Requirement</div>
                <div className="detail-value" style={{ color: '#A5B4FC' }}>
                  {selectedEnquiry.product?.productName}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Requested Quantity</div>
                <div className="detail-value">
                  {selectedEnquiry.quantity} {selectedEnquiry.unit}
                </div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Technical Notes & Requirements</div>
                <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  {selectedEnquiry.additionalRequirements || 'Standard catalog requirements.'}
                </div>
              </div>
            </div>

            {selectedEnquiry.status === 'New' && (
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleConvertLeadClick(selectedEnquiry._id)}
                >
                  <UserCheck size={16} /> Convert to Lead Opportunity
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

