import React, { useState, useMemo } from 'react';
import {
  Plus,
  Eye,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  ArrowRight,
  MessageSquarePlus,
  RotateCcw,
  Tag,
  Package,
  Layers,
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
  onUpdateStatus,
  onSaveFollowUp,
  onNavigateToQuotation,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'New' | 'Follow-up' | 'Qualified' | 'Lost'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quickFollowUpEnquiry, setQuickFollowUpEnquiry] = useState(null);
  const [lostModalEnquiry, setLostModalEnquiry] = useState(null);
  const [lostReasonText, setLostReasonText] = useState('');

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
    selectedCatalogProduct: '',
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
    initialFollowUpNotes: 'Inquiry logged. Requirement captured and specs discussed with client.',
    initialFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Quick Follow-up Form State
  const [inlineFollowUp, setInlineFollowUp] = useState({
    contactType: 'Phone Call',
    responseStatus: 'Interested',
    discussionNotes: '',
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const getEnquiryFollowUps = (enquiryId) => {
    return followUps.filter(f =>
      f.enquiryReference?._id === enquiryId ||
      f.enquiryReference === enquiryId ||
      (f.discussionNotes && f.discussionNotes.includes(enquiryId))
    );
  };

  const getLatestFollowUp = (enquiryId) => {
    const list = getEnquiryFollowUps(enquiryId);
    if (!list || list.length === 0) return null;
    return list.slice().sort((a, b) => new Date(b.createdAt || b.contactDate) - new Date(a.createdAt || a.contactDate))[0];
  };

  // Filter enquiries by subtabs
  const filteredEnquiries = useMemo(() => {
    if (activeTab === 'all') return enquiries;
    if (activeTab === 'New') return enquiries.filter(e => e.status === 'New');
    if (activeTab === 'Follow-up') {
      return enquiries.filter(e => {
        const count = getEnquiryFollowUps(e._id).length;
        return e.status === 'Follow-up' || (e.status === 'New' && count > 0);
      });
    }
    if (activeTab === 'Qualified') {
      return enquiries.filter(e => e.status === 'Qualified' || e.status === 'Converted to Lead');
    }
    if (activeTab === 'Lost') return enquiries.filter(e => e.status === 'Lost');
    return enquiries;
  }, [enquiries, activeTab, followUps]);

  const handleOpenAdd = () => {
    const nextNum = `ENQ-${String(enquiries.length + 1).padStart(3, '0')}`;
    setFormData({
      enquiryNumber: nextNum,
      enquiryDate: new Date().toISOString().split('T')[0],
      customerType: 'New',
      customer: '',
      companyName: '',
      contactPerson: '',
      mobileNumber: '',
      email: '',
      address: '',
      selectedCatalogProduct: '',
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
      initialFollowUpNotes: 'Inquiry logged. Requirement captured and specs discussed with client.',
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

  const handleCatalogProductSelect = (prodId) => {
    const prod = products.find(p => p._id === prodId);
    if (prod) {
      setFormData(prev => ({
        ...prev,
        selectedCatalogProduct: prod._id,
        productName: prod.productName,
        productDescription: prod.description || prod.specifications || '',
        targetPrice: prod.standardPrice || '',
        unit: prod.unit || 'Nos'
      }));
    }
  };

  const handleSubmit = async (e, markQualified = false) => {
    e.preventDefault();
    try {
      if (!formData.companyName || !formData.contactPerson || !formData.mobileNumber) {
        showToast('Please fill Company Name, Contact Person, and Mobile Number', 'error');
        return;
      }
      if (!formData.productName.trim()) {
        showToast('Please specify Product Name or select from Catalog', 'error');
        return;
      }

      const payload = {
        ...formData,
        productName: formData.productName.trim(),
        targetPrice: Number(formData.targetPrice) || 0,
        quantity: Number(formData.quantity) || 1,
        convertToLead: !!markQualified,
        initialFollowUp: formData.logInitialFollowUp ? {
          contactMethod: 'Call',
          notes: formData.initialFollowUpNotes,
          response: 'Interested',
          nextDate: formData.initialFollowUpDate
        } : null
      };

      await onSave(payload);
      showToast(
        markQualified
          ? 'Enquiry created and marked as Qualified Lead!'
          : 'Customer Enquiry saved successfully!',
        'success'
      );
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkQualified = async (enquiryId) => {
    try {
      if (onConvertToLead) {
        await onConvertToLead(enquiryId);
      } else if (onUpdateStatus) {
        await onUpdateStatus(enquiryId, { status: 'Qualified' });
      }
      showToast('Enquiry marked as Qualified! You can now create Quotation.', 'success');
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry(prev => ({ ...prev, status: 'Qualified' }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkLost = async (enquiryId) => {
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(enquiryId, { status: 'Lost', lostReason: lostReasonText });
      }
      showToast('Enquiry marked as Lost', 'info');
      setLostModalEnquiry(null);
      setLostReasonText('');
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry(prev => ({ ...prev, status: 'Lost', lostReason: lostReasonText }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReopenEnquiry = async (enquiryId) => {
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(enquiryId, { status: 'New', lostReason: '' });
      }
      showToast('Enquiry reopened successfully', 'success');
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry(prev => ({ ...prev, status: 'New' }));
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
          companyName: enquiry.companyName,
          enquiryReference: enquiry._id,
          contactMethod: inlineFollowUp.contactType,
          contactType: inlineFollowUp.contactType,
          customerResponse: inlineFollowUp.responseStatus,
          responseStatus: inlineFollowUp.responseStatus,
          discussionNotes: inlineFollowUp.discussionNotes,
          nextFollowUpDate: inlineFollowUp.nextFollowUpDate,
          priority: 'High',
          status: 'Pending'
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

  const columns = [
    {
      header: 'Enquiry No',
      accessor: 'enquiryNumber',
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedEnquiry(row)}
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
      header: 'Product Requirement',
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
      header: 'Qty',
      accessor: 'quantity',
      render: (row) => `${row.quantity} ${row.unit || 'Nos'}`
    },
    {
      header: 'Next Follow-up',
      render: (row) => {
        const latest = getLatestFollowUp(row._id);
        if (!latest?.nextFollowUpDate) {
          return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>None scheduled</span>;
        }
        return (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} style={{ color: 'var(--primary)' }} />
            <span>{new Date(latest.nextFollowUpDate).toLocaleDateString('en-GB')}</span>
          </div>
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
            title="Log Discussion Note"
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

          {/* Mark Qualified Button */}
          {(row.status === 'New' || row.status === 'Follow-up') && (
            <button
              className="btn btn-secondary"
              title="Mark as Qualified Opportunity"
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                gap: 4,
                height: 26,
                borderRadius: 6,
                color: '#16A36A',
                borderColor: '#A7F3D0',
                background: '#ECFDF5'
              }}
              onClick={() => handleMarkQualified(row._id)}
            >
              <CheckCircle size={12} /> Qualify
            </button>
          )}

          {/* Direct Quote Shortcut if Qualified */}
          {(row.status === 'Qualified' || row.status === 'Converted to Lead') && onNavigateToQuotation && (
            <button
              className="btn btn-primary"
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

          {/* Mark Lost Button */}
          {row.status !== 'Lost' && row.status !== 'Qualified' && row.status !== 'Converted to Lead' && (
            <button
              className="icon-btn"
              title="Mark as Lost"
              style={{ color: '#EF4444' }}
              onClick={() => setLostModalEnquiry(row)}
            >
              <XCircle size={14} />
            </button>
          )}

          {/* Reopen Button if Lost */}
          {row.status === 'Lost' && (
            <button
              className="btn btn-secondary"
              title="Reopen Enquiry"
              style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4, height: 26, borderRadius: 6 }}
              onClick={() => handleReopenEnquiry(row._id)}
            >
              <RotateCcw size={12} /> Reopen
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* Overview Metrics Matching Reference UI */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Enquiries"
          value={enquiries.length}
          subtext="Customer Touchpoints"
          icon={MessageSquarePlus}
          color="var(--primary)"
        />
        <KpiCard
          title="New Inquiries"
          value={enquiries.filter(e => e.status === 'New').length}
          subtext="Awaiting Follow-up"
          icon={Clock}
          color="#F59E0B"
        />
        <KpiCard
          title="Qualified Deals"
          value={enquiries.filter(e => e.status === 'Qualified' || e.status === 'Converted to Lead').length}
          subtext="Ready for Quotation"
          icon={CheckCircle}
          color="#16A36A"
        />
        <KpiCard
          title="Follow-ups Logged"
          value={followUps.length}
          subtext="Discussion Notes"
          icon={PhoneCall}
          color="#7C3AED"
        />
      </div>

      {/* Sub-tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'all', label: 'All Enquiries', count: enquiries.length },
            { key: 'New', label: 'New', count: enquiries.filter(e => e.status === 'New').length },
            {
              key: 'Follow-up',
              label: 'Follow-up',
              count: enquiries.filter(e => e.status === 'Follow-up' || (e.status === 'New' && getEnquiryFollowUps(e._id).length > 0)).length
            },
            {
              key: 'Qualified',
              label: 'Qualified',
              count: enquiries.filter(e => e.status === 'Qualified' || e.status === 'Converted to Lead').length
            },
            { key: 'Lost', label: 'Lost', count: enquiries.filter(e => e.status === 'Lost').length }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredEnquiries}
        searchPlaceholder="Search enquiries by company, contact, product, or enquiry number..."
        toolbarAction={
          <button
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> New Enquiry
          </button>
        }
      />

      {/* Quick Follow-up Modal */}
      <Modal
        isOpen={!!quickFollowUpEnquiry}
        onClose={() => setQuickFollowUpEnquiry(null)}
        title={`Log Follow-up: ${quickFollowUpEnquiry?.enquiryNumber}`}
        subtitle={`Record discussion note for ${quickFollowUpEnquiry?.companyName}`}
        maxWidth="560px"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (quickFollowUpEnquiry) {
            handleSaveInlineFollowUp(quickFollowUpEnquiry);
          }
        }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label>Contact Method</label>
              <select
                className="form-control"
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
              <label>Client Response</label>
              <select
                className="form-control"
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

            <div className="form-group col-span-2">
              <label>Discussion Notes & Next Steps *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Spoke with client. Discussed delivery timeline and specs, requested quote..."
                value={inlineFollowUp.discussionNotes}
                onChange={(e) => setInlineFollowUp({ ...inlineFollowUp, discussionNotes: e.target.value })}
                required
              />
            </div>

            <div className="form-group col-span-2">
              <label>Next Reminder Date</label>
              <input
                type="date"
                className="form-control"
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

      {/* Mark Lost Modal */}
      <Modal
        isOpen={!!lostModalEnquiry}
        onClose={() => setLostModalEnquiry(null)}
        title={`Mark Enquiry as Lost: ${lostModalEnquiry?.enquiryNumber}`}
        maxWidth="500px"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (lostModalEnquiry) {
            handleMarkLost(lostModalEnquiry._id);
          }
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Please select or specify the reason why <strong>{lostModalEnquiry?.companyName}</strong> chose not to proceed:
          </p>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Reason for Loss *</label>
            <select
              className="form-control"
              value={lostReasonText}
              onChange={(e) => setLostReasonText(e.target.value)}
              required
            >
              <option value="">-- Select Loss Reason --</option>
              <option value="Price too high / Competitor lower price">Price too high / Competitor lower price</option>
              <option value="Delivery lead time too long">Delivery lead time too long</option>
              <option value="Technical specifications did not match">Technical specifications did not match</option>
              <option value="Client project cancelled / postponed">Client project cancelled / postponed</option>
              <option value="Unresponsive client / No contact">Unresponsive client / No contact</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setLostModalEnquiry(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Mark Lost
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Customer Enquiry */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Customer Enquiry"
        subtitle="Capture new client request with manual specs or catalog model and initial follow-up"
        maxWidth="740px"
      >
        <form onSubmit={(e) => handleSubmit(e, false)}>
          {/* Section 1: Customer Details */}
          <div style={{ marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building size={14} /> 1. Customer Particulars
          </div>

          {customers.length > 0 && (
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Select Existing Client (Optional)</label>
              <select
                className="form-control"
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

          <div className="form-grid">
            <div className="form-group">
              <label>Company / Client Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Apex Cryo Engineering Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Person *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rajesh Kumar (Procurement Manager)"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. rajesh@apexcryo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label>Plant / Delivery Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Plot 14, SIPCOT Industrial Park, Sriperumbudur"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Product & Requirements */}
          <div style={{ marginTop: 18, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={14} /> 2. Product Requirement (Catalog Select or Manual Specs)
          </div>

          {products.length > 0 && (
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Quick Select from Product Master Catalog (Optional)</label>
              <select
                className="form-control"
                value={formData.selectedCatalogProduct}
                onChange={(e) => handleCatalogProductSelect(e.target.value)}
              >
                <option value="">-- Choose catalog product or enter manual specs below --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.productCode} - {p.productName} ({p.category}) - ₹{Number(p.standardPrice || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group col-span-2">
              <label>Product / Equipment Name & Specification *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cryogenic Liquid Nitrogen Storage Vessel 5000L - Dual Safety Valve"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Budget / Unit Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 750000"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Required Quantity</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Unit of Measure</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nos, Sets, Units"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Target Delivery Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.requiredDeliveryDate}
                onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label>Technical Notes & Custom Requirements</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Multi-layer vacuum insulation, ASME Section VIII compliance, dual safety relief valves..."
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Initial Follow-up */}
          <div style={{ marginTop: 18, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneCall size={14} /> 3. Initial Follow-up & Reminder
            </span>
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
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Initial Discussion Note</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.initialFollowUpNotes}
                  onChange={(e) => setFormData({ ...formData, initialFollowUpNotes: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Next Reminder Date</label>
                <input
                  type="date"
                  className="form-control"
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
              style={{ color: '#16A36A', borderColor: '#A7F3D0', background: '#ECFDF5' }}
              onClick={(e) => handleSubmit(e, true)}
            >
              <CheckCircle size={14} /> Save & Mark Qualified
            </button>
            <button type="submit" className="btn btn-primary">
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details & Follow-up History */}
      {selectedEnquiry && (
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title={`Enquiry: ${selectedEnquiry?.enquiryNumber}`}
          subtitle={`Submitted on ${new Date(selectedEnquiry.enquiryDate).toLocaleDateString('en-GB')}`}
          maxWidth="700px"
        >
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
                <div className="detail-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>
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

            {selectedEnquiry.lostReason && (
              <div style={{ marginTop: 14, padding: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
                <span style={{ fontSize: '0.74rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase' }}>
                  Loss Reason:
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#991B1B' }}>
                  {selectedEnquiry.lostReason}
                </p>
              </div>
            )}

            {/* Follow-up Discussion History */}
            <div style={{ marginTop: 20 }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
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
                            {fu.contactMethod || fu.contactType || 'Phone Call'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(fu.contactDate || fu.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <StatusBadge status={fu.customerResponse || fu.responseStatus || fu.status || 'Completed'} />
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
              {(selectedEnquiry.status === 'New' || selectedEnquiry.status === 'Follow-up') && (
                <button
                  className="btn btn-secondary"
                  style={{ color: '#16A36A', borderColor: '#A7F3D0', background: '#ECFDF5' }}
                  onClick={() => handleMarkQualified(selectedEnquiry._id)}
                >
                  <CheckCircle size={15} /> Mark Qualified
                </button>
              )}

              {selectedEnquiry.status !== 'Lost' && selectedEnquiry.status !== 'Qualified' && selectedEnquiry.status !== 'Converted to Lead' && (
                <button
                  className="btn btn-secondary"
                  style={{ color: '#EF4444' }}
                  onClick={() => {
                    const enq = selectedEnquiry;
                    setSelectedEnquiry(null);
                    setLostModalEnquiry(enq);
                  }}
                >
                  <XCircle size={15} /> Mark Lost
                </button>
              )}

              {selectedEnquiry.status === 'Lost' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleReopenEnquiry(selectedEnquiry._id)}
                >
                  <RotateCcw size={15} /> Reopen Enquiry
                </button>
              )}

              {onNavigateToQuotation && (selectedEnquiry.status === 'Qualified' || selectedEnquiry.status === 'Converted to Lead') && (
                <button
                  className="btn btn-primary"
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
        </Modal>
      )}
    </div>
  );
}
