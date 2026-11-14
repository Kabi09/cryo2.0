import React, { useState } from 'react';
import {
  Plus,
  Eye,
  MessageSquarePlus,
  UserCheck,
  ArrowRight,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Building,
  Sparkles
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function EnquiriesModule({
  enquiries = [],
  products = [],
  customers = [],
  followUps = [],
  onSave,
  onConvertToLead,
  onSaveFollowUp,
  onNavigateToQuotation,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quickFollowUpEnquiry, setQuickFollowUpEnquiry] = useState(null);

  // Form State for New Enquiry
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
    // Manual product requirement
    productName: '',
    productDescription: '',
    targetPrice: '',
    quantity: 1,
    unit: 'Nos',
    requiredDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    additionalRequirements: '',
    enquirySource: 'Website',
    assignedSalesPerson: 'Sales Executive',
    remarks: '',
    // Optional initial follow-up note
    logInitialFollowUp: true,
    initialFollowUpNotes: 'First inquiry logged from client. Requirement captured and specs requested.',
    initialFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Quick Follow-up Form State
  const [inlineFollowUp, setInlineFollowUp] = useState({
    contactType: 'Phone Call',
    responseStatus: 'Interested',
    discussionNotes: '',
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
      productName: '',
      productDescription: '',
      targetPrice: '',
      quantity: 1,
      unit: 'Nos',
      requiredDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      additionalRequirements: '',
      enquirySource: 'Website',
      assignedSalesPerson: 'Sales Executive',
      remarks: '',
      logInitialFollowUp: true,
      initialFollowUpNotes: 'First inquiry logged. Awaiting technical discussions and quotation request.',
      initialFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleCustomerSelect = (custId) => {
    const cust = customers.find(c => c._id === custId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customer: cust._id,
        customerType: 'Existing',
        companyName: cust.companyName,
        contactPerson: cust.contactPerson,
        mobileNumber: cust.mobileNumber,
        email: cust.email || '',
        address: `${cust.billingAddress || ''} ${cust.city || ''}`.trim()
      }));
    }
  };

  const handleSubmit = async (e, convertToLead = false) => {
    e.preventDefault();
    try {
      if (!formData.companyName || !formData.contactPerson || !formData.mobileNumber) {
        showToast('Please fill Company Name, Contact Person, and Mobile Number', 'error');
        return;
      }
      if (!formData.productName.trim()) {
        showToast('Please enter the requested Product or Equipment Specification', 'error');
        return;
      }

      const payload = {
        ...formData,
        productName: formData.productName.trim(),
        targetPrice: Number(formData.targetPrice) || 0,
        quantity: Number(formData.quantity) || 1,
        convertToLead: !!convertToLead,
        initialFollowUp: formData.logInitialFollowUp ? {
          contactMethod: 'Call',
          notes: formData.initialFollowUpNotes,
          response: 'Interested',
          nextDate: formData.initialFollowUpDate
        } : null
      };

      await onSave(payload);
      showToast(
        convertToLead
          ? 'Enquiry created and automatically converted to Lead!'
          : 'Customer Enquiry saved successfully!',
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
      showToast('Enquiry successfully moved to Lead opportunity!', 'success');
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: 'Converted to Lead' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveInlineFollowUp = async (enquiry) => {
    try {
      if (!inlineFollowUp.discussionNotes.trim()) {
        showToast('Please enter discussion notes for the follow-up', 'error');
        return;
      }
      if (onSaveFollowUp) {
        await onSaveFollowUp({
          customer: enquiry.customer?._id || enquiry.customer,
          enquiryReference: enquiry._id,
          contactType: inlineFollowUp.contactType,
          responseStatus: inlineFollowUp.responseStatus,
          discussionNotes: inlineFollowUp.discussionNotes,
          nextFollowUpDate: inlineFollowUp.nextFollowUpDate,
          priority: 'High',
          status: 'Scheduled'
        });
        showToast('Follow-up discussion note logged successfully!', 'success');
      }
      setQuickFollowUpEnquiry(null);
      setInlineFollowUp({
        contactType: 'Phone Call',
        responseStatus: 'Interested',
        discussionNotes: '',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Get follow-ups associated with this enquiry
  const getEnquiryFollowUps = (enquiryId) => {
    return followUps.filter(f =>
      f.enquiryReference?._id === enquiryId ||
      f.enquiryReference === enquiryId ||
      (f.discussionNotes && f.discussionNotes.includes(enquiryId))
    );
  };

  const columns = [
    {
      header: 'Enquiry No',
      accessor: 'enquiryNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedEnquiry(row)}>
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
      header: 'Customer Particulars',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.companyName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.contactPerson} • {row.mobileNumber}
          </div>
        </div>
      )
    },
    {
      header: 'Product Requirement (Manual Specification)',
      render: (row) => (
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {row.productName || row.product?.productName || 'Custom Specification'}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Qty: {row.quantity} {row.unit}
            {row.targetPrice > 0 && ` • Budget: ₹${Number(row.targetPrice).toLocaleString('en-IN')}`}
          </div>
        </div>
      )
    },
    {
      header: 'Touchpoints',
      render: (row) => {
        const count = getEnquiryFollowUps(row._id).length;
        return (
          <span
            className="badge"
            style={{
              background: count > 0 ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
              color: count > 0 ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${count > 0 ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {count} {count === 1 ? 'Touchpoint' : 'Touchpoints'}
          </span>
        );
      }
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
          <button
            className="icon-btn"
            title="View Details & Follow-up History"
            onClick={() => setSelectedEnquiry(row)}
          >
            <Eye size={15} />
          </button>

          {/* Quick Follow-up Button */}
          <button
            className="icon-btn"
            title="Log Discussion / Follow-up Note"
            style={{ color: 'var(--primary)' }}
            onClick={() => {
              setQuickFollowUpEnquiry(row);
              setInlineFollowUp({
                contactType: 'Phone Call',
                responseStatus: 'Interested',
                discussionNotes: '',
                nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
            }}
          >
            <PhoneCall size={14} />
          </button>

          {/* Move to Lead Action */}
          {row.status === 'New' && (
            <button
              className="btn btn-primary"
              title="Convert / Move to Lead Opportunity"
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                gap: 4,
                height: 26,
                borderRadius: 6
              }}
              onClick={() => handleConvertLeadClick(row._id)}
            >
              Move to Lead <ArrowRight size={12} />
            </button>
          )}

          {/* Direct Quote Shortcut if converted */}
          {row.status === 'Converted to Lead' && onNavigateToQuotation && (
            <button
              className="btn btn-secondary"
              title="Create Quotation"
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                gap: 4,
                height: 26,
                borderRadius: 6
              }}
              onClick={() => onNavigateToQuotation(row)}
            >
              Quote <FileText size={12} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Enquiries"
          value={enquiries.length}
          subtext="Customer Touchpoints"
          icon={MessageSquarePlus}
          color="var(--primary)"
        />
        <KpiCard
          title="Active Open"
          value={enquiries.filter(e => e.status === 'New').length}
          subtext="Awaiting Conversion"
          icon={Clock}
          color="var(--warning)"
        />
        <KpiCard
          title="Moved to Lead"
          value={enquiries.filter(e => e.status === 'Converted to Lead').length}
          subtext="In Sales Pipeline"
          icon={UserCheck}
          color="var(--success)"
        />
        <KpiCard
          title="Follow-ups Logged"
          value={followUps.length}
          subtext="Client Interactions"
          icon={PhoneCall}
          color="#6366F1"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={enquiries}
        searchPlaceholder="Search enquiries by customer, company, product, or enquiry number..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> New Enquiry
          </button>
        }
      />

      {/* Quick Follow-up Modal for Table Row */}
      <Modal
        isOpen={!!quickFollowUpEnquiry}
        onClose={() => setQuickFollowUpEnquiry(null)}
        title={`Log Follow-up: ${quickFollowUpEnquiry?.enquiryNumber}`}
        subtitle={`Record discussion note for ${quickFollowUpEnquiry?.companyName}`}
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (quickFollowUpEnquiry) {
            handleSaveInlineFollowUp(quickFollowUpEnquiry);
          }
        }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contact Method</label>
              <select
                className="form-select"
                value={inlineFollowUp.contactType}
                onChange={(e) => setInlineFollowUp({ ...inlineFollowUp, contactType: e.target.value })}
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
                value={inlineFollowUp.responseStatus}
                onChange={(e) => setInlineFollowUp({ ...inlineFollowUp, responseStatus: e.target.value })}
              >
                <option value="Interested">Interested (High Chance)</option>
                <option value="Call Scheduled">Follow-up Call Scheduled</option>
                <option value="Negotiation">Commercial Negotiation</option>
                <option value="No Response">Awaiting Reply</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Discussion Notes & Next Steps *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Spoke with Mr. Rajesh. Explained vessel design specs, agreed to send quotation by tomorrow..."
                value={inlineFollowUp.discussionNotes}
                onChange={(e) => setInlineFollowUp({ ...inlineFollowUp, discussionNotes: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Next Reminder Date</label>
              <input
                type="date"
                className="form-input"
                value={inlineFollowUp.nextFollowUpDate}
                onChange={(e) => setInlineFollowUp({ ...inlineFollowUp, nextFollowUpDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setQuickFollowUpEnquiry(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-up Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Customer Enquiry */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Customer Enquiry"
        subtitle="Capture new client request with manual equipment specifications and initial follow-up"
        size="lg"
      >
        <form onSubmit={(e) => handleSubmit(e, false)}>
          {/* Section 1: Customer Details */}
          <div style={{ marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
            1. Customer Particulars
          </div>

          {customers.length > 0 && (
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Select Existing Client (Optional)</label>
              <select
                className="form-select"
                value={formData.customer}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">-- Or enter new client details below --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.contactPerson} - {c.mobileNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Company / Client Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Cryo Engineering Pvt Ltd"
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
                placeholder="e.g. Rajesh Kumar (Procurement Manager)"
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rajesh@apexcryo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Plant / Delivery Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot 14, SIPCOT Industrial Park, Sriperumbudur"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Product & Requirements (Manual Fill, No Dropdown Lock) */}
          <div style={{ marginTop: 20, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
            2. Product Requirement (Manual Specification)
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Product / Equipment Name & Specification *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cryogenic Liquid Nitrogen Storage Vessel 5000L - Dual Safety Valve"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Budget / Unit Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 750000"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nos, Sets, Units"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
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

            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Technical Notes & Custom Requirements</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Requires multi-layer vacuum insulation, ASME Section VIII compliance, and dual rupture discs..."
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Optional Initial Follow-up */}
          <div style={{ marginTop: 20, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>3. Initial Follow-up & Reminder</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.logInitialFollowUp}
                onChange={(e) => setFormData({ ...formData, logInitialFollowUp: e.target.checked })}
              />
              Log First Discussion Note
            </label>
          </div>

          {formData.logInitialFollowUp && (
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Initial Discussion Note</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.initialFollowUpNotes}
                  onChange={(e) => setFormData({ ...formData, initialFollowUpNotes: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Reminder Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.initialFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, initialFollowUpDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
              onClick={(e) => handleSubmit(e, true)}
            >
              Save & Move to Lead ➔
            </button>
            <button type="submit" className="btn btn-primary">
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details & Follow-up History */}
      <Modal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        title={`Enquiry: ${selectedEnquiry?.enquiryNumber}`}
        subtitle={`Submitted on ${selectedEnquiry ? new Date(selectedEnquiry.enquiryDate).toLocaleDateString('en-GB') : ''}`}
        size="lg"
      >
        {selectedEnquiry && (
          <div>
            <div className="detail-grid">
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
                <div className="detail-label">Mobile Number</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedEnquiry.mobileNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{selectedEnquiry.email || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Product Requirement</div>
                <div className="detail-value" style={{ color: 'var(--primary)' }}>
                  {selectedEnquiry.productName || selectedEnquiry.product?.productName || 'Custom Specification'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Quantity & Unit</div>
                <div className="detail-value">{selectedEnquiry.quantity} {selectedEnquiry.unit}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Budget</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                  {selectedEnquiry.targetPrice > 0 ? `₹${Number(selectedEnquiry.targetPrice).toLocaleString('en-IN')}` : 'To be estimated'}
                </div>
              </div>
            </div>

            {/* Follow-up Discussion History */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Follow-up Discussion History ({getEnquiryFollowUps(selectedEnquiry._id).length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                  onClick={() => {
                    const enq = selectedEnquiry;
                    setSelectedEnquiry(null);
                    setQuickFollowUpEnquiry(enq);
                  }}
                >
                  <PhoneCall size={12} /> + Add Follow-up Note
                </button>
              </div>

              {getEnquiryFollowUps(selectedEnquiry._id).length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No previous follow-up notes logged for this enquiry yet. Click <strong>+ Add Follow-up Note</strong> to record discussions.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {getEnquiryFollowUps(selectedEnquiry._id).map((fu, idx) => (
                    <div
                      key={fu._id || idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary)' }}>
                            {fu.contactMethod || 'Call'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(fu.contactDate || fu.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <StatusBadge status={fu.customerResponse || fu.status || 'Completed'} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 4 }}>
                        {fu.discussionNotes}
                      </div>
                      {fu.nextFollowUpDate && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Next Reminder: <strong>{new Date(fu.nextFollowUpDate).toLocaleDateString('en-GB')}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedEnquiry.status === 'New' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleConvertLeadClick(selectedEnquiry._id)}
                >
                  <UserCheck size={15} /> Move to Lead Opportunity ➔
                </button>
              )}
              {onNavigateToQuotation && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const enq = selectedEnquiry;
                    setSelectedEnquiry(null);
                    onNavigateToQuotation(enq);
                  }}
                >
                  <FileText size={15} /> Create Quotation ➔
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
