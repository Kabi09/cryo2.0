import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Users,
  Trophy,
  XCircle,
  Building2,
  CheckCircle2,
  FileText,
  PhoneCall,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  Filter
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function CustomersLeadsModule({
  customers = [],
  leads = [],
  products = [],
  onSaveCustomer,
  onSaveLead,
  onUpdateLeadStatus,
  onSaveFollowUp,
  onNavigateToQuotation,
  showToast,
  defaultTab = 'qualified'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'qualified', 'not-qualified', 'all-leads', 'customers'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [quickFollowUpLead, setQuickFollowUpLead] = useState(null);

  // Quick Follow-up Form State
  const [followUpData, setFollowUpData] = useState({
    contactType: 'Phone Call',
    responseStatus: 'Interested',
    discussionNotes: '',
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Form State for New Customer + Lead
  const [formData, setFormData] = useState({
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
    productName: '',
    interestedProduct: '',
    expectedQuantity: 1,
    expectedOrderValue: 100000,
    expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      productName: '',
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
      if (!formData.companyName || !formData.contactPerson || !formData.mobileNumber) {
        showToast('Please fill Company Name, Contact Person, and Mobile Number', 'error');
        return;
      }

      const custRes = await onSaveCustomer({
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
      });

      const custId = custRes?._id || (typeof custRes === 'string' ? custRes : null) || customers[customers.length - 1]?._id;

      if (formData.createLeadOpportunity && custId) {
        await onSaveLead({
          leadNumber: formData.leadNumber,
          customer: custId,
          productName: formData.productName || 'Custom Equipment Requirement',
          interestedProduct: formData.interestedProduct || null,
          expectedQuantity: Number(formData.expectedQuantity) || 1,
          expectedOrderValue: Number(formData.expectedOrderValue) || 0,
          expectedClosingDate: formData.expectedClosingDate,
          leadOwner: formData.leadOwner,
          leadStatus: formData.leadStatus || 'Qualified',
          notes: formData.notes
        });
      }

      showToast('Customer & Lead opportunity saved successfully!', 'success');
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

  const handleOpenFollowUp = (lead) => {
    setQuickFollowUpLead(lead);
    setFollowUpData({
      contactType: 'Phone Call',
      responseStatus: 'Interested',
      discussionNotes: '',
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleSaveFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!quickFollowUpLead) return;
    try {
      if (!followUpData.discussionNotes) {
        showToast('Please enter discussion notes', 'error');
        return;
      }
      if (onSaveFollowUp) {
        await onSaveFollowUp({
          customer: quickFollowUpLead.customer?._id || quickFollowUpLead.customer,
          leadReference: quickFollowUpLead._id,
          contactType: followUpData.contactType,
          responseStatus: followUpData.responseStatus,
          discussionNotes: followUpData.discussionNotes,
          nextFollowUpDate: followUpData.nextFollowUpDate,
          priority: 'High',
          status: 'Pending'
        });
        showToast(`Follow-up note logged for ${quickFollowUpLead.leadNumber}!`, 'success');
      }
      setQuickFollowUpLead(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateQuotationClick = (lead) => {
    if (onNavigateToQuotation) {
      onNavigateToQuotation(lead);
    } else {
      showToast('Quotation module ready for Lead ' + lead.leadNumber, 'info');
    }
  };

  // Filtered Leads
  const qualifiedLeads = leads.filter(l => l.leadStatus === 'Qualified' || l.leadStatus === 'New');
  const notQualifiedLeads = leads.filter(l => l.leadStatus === 'Lost' || l.leadStatus === 'Not Qualified');

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
      header: 'Company / Client',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.customer?.contactPerson} • {row.customer?.city || 'India'}
          </div>
        </div>
      )
    },
    {
      header: 'Product Requirement',
      render: (row) => (
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {row.productName || row.interestedProduct?.productName || 'Custom Specification'}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Qty: {row.expectedQuantity || 1}
          </div>
        </div>
      )
    },
    {
      header: 'Deal Value',
      accessor: 'expectedOrderValue',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
          ₹{row.expectedOrderValue?.toLocaleString('en-IN') || '0'}
        </span>
      )
    },
    {
      header: 'Closing Date',
      accessor: 'expectedClosingDate',
      render: (row) => row.expectedClosingDate ? new Date(row.expectedClosingDate).toLocaleDateString('en-GB') : '—'
    },
    {
      header: 'Status',
      accessor: 'leadStatus',
      render: (row) => <StatusBadge status={row.leadStatus} />
    },
    {
      header: 'Pipeline Actions',
      render: (row) => {
        const isQualified = row.leadStatus === 'Qualified' || row.leadStatus === 'New';
        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" title="View Lead & History" onClick={() => setSelectedRecord(row)}>
              <Eye size={15} />
            </button>

            {/* Step 3 -> 4: Move from Qualified Lead to Quotation */}
            {isQualified && (
              <button
                className="btn btn-primary"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  gap: 4,
                  height: 26,
                  borderRadius: 6
                }}
                title="Create Quotation for this Lead"
                onClick={() => handleCreateQuotationClick(row)}
              >
                <FileText size={12} /> Quote ➔
              </button>
            )}

            {/* Quick Follow-up Logger */}
            <button
              className="icon-btn"
              title="Add Follow-up Log"
              style={{ color: 'var(--primary)' }}
              onClick={() => handleOpenFollowUp(row)}
            >
              <PhoneCall size={14} />
            </button>

            {/* Qualification Toggles */}
            {isQualified ? (
              <button
                className="icon-btn"
                title="Mark as Not Qualified / Lost"
                style={{ color: 'var(--danger)' }}
                onClick={() => handleUpdateStatus(row._id, 'Lost')}
              >
                <XCircle size={14} />
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--success)',
                  borderColor: 'var(--success-border)',
                  gap: 4,
                  height: 26,
                  borderRadius: 6
                }}
                title="Requalify Lead (Move to Qualified)"
                onClick={() => handleUpdateStatus(row._id, 'Qualified')}
              >
                <CheckCircle2 size={12} /> Requalify
              </button>
            )}
          </div>
        );
      }
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
          <strong style={{ color: 'var(--text-primary)' }}>{row.companyName}</strong>
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

  const currentData =
    activeTab === 'qualified'
      ? qualifiedLeads
      : activeTab === 'not-qualified'
      ? notQualifiedLeads
      : activeTab === 'customers'
      ? customers
      : leads;

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          title="Qualified Leads"
          value={qualifiedLeads.length}
          subtext="Ready for Quotation"
          icon={CheckCircle2}
          color="var(--success)"
        />
        <KpiCard
          title="Not Qualified / Lost"
          value={notQualifiedLeads.length}
          subtext="Cold or archived"
          icon={XCircle}
          color="var(--danger)"
        />
        <KpiCard
          title="Total Pipeline Value"
          value={`₹${(leads.reduce((sum, l) => sum + (l.expectedOrderValue || 0), 0) / 100000).toFixed(1)}L`}
          subtext="Active Deal Pipeline"
          icon={Trophy}
          color="var(--primary)"
        />
        <KpiCard
          title="Client Accounts"
          value={customers.length}
          subtext="Registered Companies"
          icon={Building2}
          color="#6366F1"
        />
      </div>

      {/* Sub-Tabs: Explicit Qualified vs Not Qualified */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'qualified' ? 'active' : ''}`}
            onClick={() => setActiveTab('qualified')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            Qualified Leads ({qualifiedLeads.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'not-qualified' ? 'active' : ''}`}
            onClick={() => setActiveTab('not-qualified')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <XCircle size={14} style={{ color: 'var(--danger)' }} />
            Not Qualified / Lost ({notQualifiedLeads.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'all-leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-leads')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Users size={14} />
            All Pipeline ({leads.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Building2 size={14} />
            Client Accounts ({customers.length})
          </button>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Opportunity
        </button>
      </div>

      {/* Main Table */}
      {activeTab === 'customers' ? (
        <DataTable
          columns={customersColumns}
          data={customers}
          searchPlaceholder="Search customer accounts by company, phone, city..."
        />
      ) : (
        <DataTable
          columns={leadsColumns}
          data={currentData}
          searchPlaceholder="Search leads by customer, product, lead no..."
        />
      )}

      {/* Modal: Quick Follow-up Logger */}
      <Modal
        isOpen={!!quickFollowUpLead}
        onClose={() => setQuickFollowUpLead(null)}
        title={`Log Follow-up: ${quickFollowUpLead?.leadNumber}`}
        subtitle={`Record discussion note for ${quickFollowUpLead?.customer?.companyName || 'Lead'}`}
        size="md"
      >
        <form onSubmit={handleSaveFollowUpSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contact Method</label>
              <select
                className="form-select"
                value={followUpData.contactType}
                onChange={(e) => setFollowUpData({ ...followUpData, contactType: e.target.value })}
              >
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="In-Person Meeting">In-Person Meeting</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Client Response</label>
              <select
                className="form-select"
                value={followUpData.responseStatus}
                onChange={(e) => setFollowUpData({ ...followUpData, responseStatus: e.target.value })}
              >
                <option value="Interested">Interested (High Chance)</option>
                <option value="Negotiation">Negotiation / Reviewing</option>
                <option value="Call Scheduled">Call Scheduled</option>
                <option value="No Response">No Response</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Discussion Notes & Action Required *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Client requested technical specs and pricing breakdown for 2 units..."
                value={followUpData.discussionNotes}
                onChange={(e) => setFollowUpData({ ...followUpData, discussionNotes: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Next Reminder Date</label>
              <input
                type="date"
                className="form-input"
                value={followUpData.nextFollowUpDate}
                onChange={(e) => setFollowUpData({ ...followUpData, nextFollowUpDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setQuickFollowUpLead(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-up Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Customer & Lead Opportunity */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Customer & Opportunity"
        subtitle="Register new client particulars and initiate sales opportunity"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
            1. Client Master Information
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CryoGas Systems India Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mr. Rajesh Kumar"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rajesh@cryogas.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="33AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
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
          </div>

          <div style={{ marginTop: 20, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>2. Lead Opportunity Details</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.createLeadOpportunity}
                onChange={(e) => setFormData({ ...formData, createLeadOpportunity: e.target.checked })}
              />
              Create Active Pipeline Lead
            </label>
          </div>

          {formData.createLeadOpportunity && (
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Requirement (Manual Specification) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cryogenic Tank 5000L with Vacuum Jacketed Piping"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required={formData.createLeadOpportunity}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Deal Value (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500000"
                  value={formData.expectedOrderValue}
                  onChange={(e) => setFormData({ ...formData, expectedOrderValue: e.target.value })}
                  required={formData.createLeadOpportunity}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.expectedQuantity}
                  onChange={(e) => setFormData({ ...formData, expectedQuantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Qualification Status</label>
                <select
                  className="form-select"
                  value={formData.leadStatus}
                  onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                >
                  <option value="Qualified">Qualified (High Probability)</option>
                  <option value="New">New Lead</option>
                  <option value="Lost">Not Qualified / Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Closing Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expectedClosingDate}
                  onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Opportunity
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.leadNumber ? `Lead: ${selectedRecord.leadNumber}` : `Client: ${selectedRecord?.companyName}`}
        subtitle={selectedRecord?.customer?.companyName || selectedRecord?.companyName}
        size="lg"
      >
        {selectedRecord && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <StatusBadge status={selectedRecord.leadStatus || selectedRecord.status || 'Active'} />
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Client Name</div>
                <div className="detail-value">
                  {selectedRecord.customer?.companyName || selectedRecord.companyName}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">
                  {selectedRecord.customer?.contactPerson || selectedRecord.contactPerson}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Mobile Number</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedRecord.customer?.mobileNumber || selectedRecord.mobileNumber}
                </div>
              </div>

              {selectedRecord.leadNumber && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">Product Requirement</div>
                    <div className="detail-value" style={{ color: 'var(--primary)' }}>
                      {selectedRecord.productName || selectedRecord.interestedProduct?.productName || 'Custom Specification'}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Estimated Value</div>
                    <div className="detail-value" style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                      ₹{selectedRecord.expectedOrderValue?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedRecord.leadNumber && (
              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    handleOpenFollowUp(selectedRecord);
                  }}
                >
                  <PhoneCall size={14} /> + Log Follow-up
                </button>

                {(selectedRecord.leadStatus === 'Qualified' || selectedRecord.leadStatus === 'New') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedRecord(null);
                      handleCreateQuotationClick(selectedRecord);
                    }}
                  >
                    <FileText size={14} /> Create Quotation ➔
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
