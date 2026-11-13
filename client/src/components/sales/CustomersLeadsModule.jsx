import React, { useState } from 'react';
import { Plus, Eye, Users, Trophy, XCircle, Building2, CheckCircle2 } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function CustomersLeadsModule({ customers, leads, products, onSaveCustomer, onSaveLead, onUpdateLeadStatus, showToast }) {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'customers'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Customer Info
    customerCode: '',
    companyName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    gstNumber: '',
    billingAddress: '',
    shippingAddress: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    customerType: 'Company',
    paymentTerms: 'Net 30 Days',
    notes: '',
    
    // Lead Info
    createLeadOpportunity: true,
    leadNumber: '',
    interestedProduct: '',
    expectedQuantity: 1,
    expectedOrderValue: 0,
    expectedClosingDate: '',
    leadOwner: 'Senior Sales Lead',
    leadStatus: 'Qualified'
  });

  const handleOpenAdd = () => {
    setFormData({
      customerCode: '',
      companyName: '',
      contactPerson: '',
      mobileNumber: '',
      email: '',
      gstNumber: '',
      billingAddress: '',
      shippingAddress: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '',
      customerType: 'Company',
      paymentTerms: 'Net 30 Days',
      notes: '',
      createLeadOpportunity: true,
      leadNumber: '',
      interestedProduct: products[0]?._id || '',
      expectedQuantity: 1,
      expectedOrderValue: products[0]?.standardPrice || 100000,
      expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leadOwner: 'Senior Sales Lead',
      leadStatus: 'Qualified'
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.companyName || !formData.contactPerson) {
        showToast('Please fill out Company Name and Contact Person', 'error');
        return;
      }

      // 1. Create or Find Customer
      const custData = {
        customerCode: formData.customerCode,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        gstNumber: formData.gstNumber,
        billingAddress: formData.billingAddress,
        shippingAddress: formData.shippingAddress || formData.billingAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        customerType: formData.customerType,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes
      };

      const savedCust = await onSaveCustomer(custData);
      const custId = savedCust?.data?._id || savedCust?._id;

      // 2. Optionally Create Lead Opportunity
      if (formData.createLeadOpportunity && custId) {
        await onSaveLead({
          leadNumber: formData.leadNumber,
          customer: custId,
          interestedProduct: formData.interestedProduct,
          expectedQuantity: Number(formData.expectedQuantity) || 1,
          expectedOrderValue: Number(formData.expectedOrderValue) || 0,
          expectedClosingDate: formData.expectedClosingDate,
          leadOwner: formData.leadOwner,
          leadStatus: formData.leadStatus,
          notes: formData.notes
        });
      }

      showToast('Customer & Lead opportunity saved successfully without duplication!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await onUpdateLeadStatus(leadId, newStatus);
      showToast(`Lead opportunity marked as ${newStatus}!`, 'success');
      if (selectedRecord && selectedRecord.leadNumber) {
        setSelectedRecord({ ...selectedRecord, leadStatus: newStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Leads Columns
  const leadsColumns = [
    {
      header: 'Lead No',
      accessor: 'leadNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedRecord(row)}>
          {row.leadNumber}
        </span>
      )
    },
    {
      header: 'Company Name',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.customer?.customerCode} • {row.customer?.city}
          </div>
        </div>
      )
    },
    {
      header: 'Contact Person',
      render: (row) => row.customer?.contactPerson
    },
    {
      header: 'Interested Product',
      render: (row) => (
        <div>
          <span style={{ color: '#C7D2FE', fontWeight: 500 }}>
            {row.interestedProduct?.productName || 'Equipment'}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Qty: {row.expectedQuantity}
          </div>
        </div>
      )
    },
    {
      header: 'Expected Value',
      accessor: 'expectedOrderValue',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
          ₹{row.expectedOrderValue?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Closing Date',
      accessor: 'expectedClosingDate',
      render: (row) => row.expectedClosingDate ? new Date(row.expectedClosingDate).toLocaleDateString('en-GB') : '—'
    },
    {
      header: 'Lead Status',
      accessor: 'leadStatus',
      render: (row) => <StatusBadge status={row.leadStatus} />
    },
    {
      header: 'Lead Owner',
      accessor: 'leadOwner',
      render: (row) => row.leadOwner
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Lead & Account" onClick={() => setSelectedRecord(row)}>
            <Eye size={15} />
          </button>
          {row.leadStatus !== 'Won' && (
            <button
              className="icon-btn"
              title="Mark Won"
              style={{ color: '#10B981' }}
              onClick={() => handleUpdateStatus(row._id, 'Won')}
            >
              <Trophy size={14} />
            </button>
          )}
          {row.leadStatus !== 'Lost' && (
            <button
              className="icon-btn"
              title="Mark Lost"
              style={{ color: '#EF4444' }}
              onClick={() => handleUpdateStatus(row._id, 'Lost')}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  // Customers Columns
  const customersColumns = [
    {
      header: 'Customer Code',
      accessor: 'customerCode',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedRecord(row)}>
          {row.customerCode}
        </span>
      )
    },
    {
      header: 'Company Name',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.companyName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.city}, {row.state}</div>
        </div>
      )
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson',
      render: (row) => row.contactPerson
    },
    {
      header: 'Mobile',
      accessor: 'mobileNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.mobileNumber}</span>
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => row.email || '—'
    },
    {
      header: 'GST Number',
      accessor: 'gstNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.gstNumber || '—'}</span>
    },
    {
      header: 'Payment Terms',
      accessor: 'paymentTerms',
      render: (row) => <span className="nav-badge-pill">{row.paymentTerms}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Customer Details" onClick={() => setSelectedRecord(row)}>
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Accounts" value={customers.length} subtext="Customer Directory" icon={Building2} color="#6366F1" />
        <KpiCard title="Active Pipeline" value={leads.filter(l => l.leadStatus === 'Qualified' || l.leadStatus === 'New').length} subtext="Open Opportunities" icon={Users} color="#06B6D4" />
        <KpiCard title="Won Deals" value={leads.filter(l => l.leadStatus === 'Won').length} subtext="Converted Clients" icon={Trophy} color="#10B981" />
        <KpiCard title="Lost Opportunities" value={leads.filter(l => l.leadStatus === 'Lost').length} subtext="Archived" icon={XCircle} color="#EF4444" />
      </div>

      {/* Tab Switcher: Leads vs Customers */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Sales Leads ({leads.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Registered Customers ({customers.length})
          </button>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Customer & Opportunity
        </button>
      </div>

      {/* Main Table */}
      {activeTab === 'leads' ? (
        <DataTable
          columns={leadsColumns}
          data={leads}
          searchPlaceholder="Search leads by customer, product, lead no..."
        />
      ) : (
        <DataTable
          columns={customersColumns}
          data={customers}
          searchPlaceholder="Search customers by company, phone, city..."
        />
      )}

      {/* Add Customer & Lead Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Register Customer & Lead Opportunity"
        subtitle="Maintain account records and sales pipeline opportunity simultaneously without duplication"
      >
        <form onSubmit={handleSubmit}>
          {/* Section 1: Customer Profile */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8', marginBottom: 12 }}>
            Section 1: Company & Contact Information
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. CUS-004)"
                value={formData.customerCode}
                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">GSTIN Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="33AABCA1234F1Z9"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Billing Address</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Street address, industrial plot no..."
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
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
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="50% Advance, Balance Before Dispatch">50% Advance, Balance Before Dispatch</option>
                <option value="Advance 100%">Advance 100%</option>
                <option value="Immediate">Immediate / Cash</option>
              </select>
            </div>
          </div>

          {/* Section 2: Lead Details */}
          <div style={{ margin: '22px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
              Section 2: Sales Opportunity / Lead Particulars
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.createLeadOpportunity}
                onChange={(e) => setFormData({ ...formData, createLeadOpportunity: e.target.checked })}
              />
              <span>Create Active Lead</span>
            </label>
          </div>

          {formData.createLeadOpportunity && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Interested Product</label>
                <select
                  className="form-select"
                  value={formData.interestedProduct}
                  onChange={(e) => {
                    const prd = products.find(p => p._id === e.target.value);
                    setFormData({
                      ...formData,
                      interestedProduct: e.target.value,
                      expectedOrderValue: prd ? prd.standardPrice * formData.expectedQuantity : formData.expectedOrderValue
                    });
                  }}
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.productName} (₹{p.standardPrice?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.expectedQuantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value) || 1;
                    const prd = products.find(p => p._id === formData.interestedProduct);
                    setFormData({
                      ...formData,
                      expectedQuantity: qty,
                      expectedOrderValue: prd ? prd.standardPrice * qty : formData.expectedOrderValue
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.expectedOrderValue}
                  onChange={(e) => setFormData({ ...formData, expectedOrderValue: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Closing Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expectedClosingDate}
                  onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Status</label>
                <select
                  className="form-select"
                  value={formData.leadStatus}
                  onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lead Owner / Sales Staff</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.leadOwner}
                  onChange={(e) => setFormData({ ...formData, leadOwner: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Account & Opportunity
            </button>
          </div>
        </form>
      </Modal>

      {/* View Record Details Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        size="lg"
        title={selectedRecord?.leadNumber ? `Lead: ${selectedRecord.leadNumber}` : `Customer: ${selectedRecord?.customerCode}`}
        subtitle={selectedRecord?.customer?.companyName || selectedRecord?.companyName}
      >
        {selectedRecord && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Company Name</div>
                <div className="detail-value">{selectedRecord.customer?.companyName || selectedRecord.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <StatusBadge status={selectedRecord.leadStatus || selectedRecord.status || 'Active'} />
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedRecord.customer?.contactPerson || selectedRecord.contactPerson}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedRecord.customer?.mobileNumber || selectedRecord.mobileNumber}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{selectedRecord.customer?.email || selectedRecord.email || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Location</div>
                <div className="detail-value">{selectedRecord.customer?.city || selectedRecord.city || 'Chennai'}</div>
              </div>

              {selectedRecord.leadNumber && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">Interested Equipment</div>
                    <div className="detail-value" style={{ color: '#A5B4FC' }}>
                      {selectedRecord.interestedProduct?.productName || 'Machine Part'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Expected Deal Value</div>
                    <div className="detail-value" style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                      ₹{selectedRecord.expectedOrderValue?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedRecord.leadNumber && selectedRecord.leadStatus !== 'Won' && (
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleUpdateStatus(selectedRecord._id, 'Lost')}
                >
                  <XCircle size={15} color="#EF4444" /> Mark as Lost
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(selectedRecord._id, 'Won')}
                >
                  <Trophy size={15} color="#FBBF24" /> Mark as Won Deal
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

