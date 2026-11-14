import React, { useState } from 'react';
import { Plus, Eye, PhoneCall, CheckCircle, Clock, Calendar, HelpCircle, Users, FileText } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function FollowUpsModule({
  followUps = [],
  customers = [],
  leads = [],
  quotations = [],
  enquiries = [],
  onSave,
  onUpdateStatus,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'enquiry', 'lead', 'quotation'

  // Form State
  const [formData, setFormData] = useState({
    followUpNumber: '',
    customer: '',
    enquiryReference: '',
    relatedLead: '',
    relatedQuotation: '',
    contactDate: new Date().toISOString().split('T')[0],
    contactMethod: 'Call',
    discussionNotes: '',
    customerResponse: 'Interested',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextAction: 'Follow-up Call & Share Technical Specifications',
    assignedEmployee: 'Sales Executive',
    status: 'Pending'
  });

  const handleOpenAdd = () => {
    setFormData({
      followUpNumber: '',
      customer: customers[0]?._id || '',
      enquiryReference: enquiries[0]?._id || '',
      relatedLead: leads[0]?._id || '',
      relatedQuotation: '',
      contactDate: new Date().toISOString().split('T')[0],
      contactMethod: 'Call',
      discussionNotes: '',
      customerResponse: 'Interested',
      nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextAction: 'Follow-up Call & Share Technical Specifications',
      assignedEmployee: 'Sales Executive',
      status: 'Pending'
    });
    setIsAddOpen(true);
  };

  const handleCustomerChange = (custId) => {
    const custLeads = leads.filter(l => (l.customer?._id || l.customer) === custId);
    const custQuotes = quotations.filter(q => (q.customer?._id || q.customer) === custId);
    const custEnquiries = enquiries.filter(e => (e.customer?._id || e.customer) === custId);

    setFormData(prev => ({
      ...prev,
      customer: custId,
      enquiryReference: custEnquiries[0]?._id || '',
      relatedLead: custLeads[0]?._id || '',
      relatedQuotation: custQuotes[0]?._id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer) {
        showToast('Please select a customer', 'error');
        return;
      }
      if (!formData.discussionNotes) {
        showToast('Please enter discussion notes', 'error');
        return;
      }

      await onSave(formData);
      showToast('Follow-up interaction recorded successfully!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleComplete = async (followUpId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await onUpdateStatus(followUpId, nextStatus);
      showToast(`Follow-up marked as ${nextStatus}!`, 'success');
      if (selectedFollowUp) {
        setSelectedFollowUp({ ...selectedFollowUp, status: nextStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter Data based on stage
  const filteredData = followUps.filter(f => {
    if (filterType === 'enquiry') return f.enquiryReference || (f.discussionNotes && f.discussionNotes.toLowerCase().includes('enq'));
    if (filterType === 'lead') return f.relatedLead;
    if (filterType === 'quotation') return f.relatedQuotation;
    return true;
  });

  const columns = [
    {
      header: 'FU No',
      accessor: 'followUpNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedFollowUp(row)}>
          {row.followUpNumber}
        </span>
      )
    },
    {
      header: 'Client / Account',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>
            {row.customer?.companyName || row.enquiryReference?.companyName || '—'}
          </strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.customer?.contactPerson || row.enquiryReference?.contactPerson} • {row.customer?.mobileNumber}
          </div>
        </div>
      )
    },
    {
      header: 'Pipeline Ref',
      render: (row) => {
        if (row.enquiryReference) {
          return (
            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: '0.72rem' }}>
              ENQ: {row.enquiryReference?.enquiryNumber || 'Ref'}
            </span>
          );
        }
        if (row.relatedLead) {
          return (
            <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.72rem' }}>
              LD: {row.relatedLead?.leadNumber || 'Lead'}
            </span>
          );
        }
        if (row.relatedQuotation) {
          return (
            <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid var(--warning-border)', fontSize: '0.72rem' }}>
              QT: {row.relatedQuotation?.quotationNumber || 'Quote'}
            </span>
          );
        }
        return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Direct Touchpoint</span>;
      }
    },
    {
      header: 'Method',
      accessor: 'contactMethod',
      render: (row) => <span className="nav-badge-pill">{row.contactMethod}</span>
    },
    {
      header: 'Response',
      accessor: 'customerResponse',
      render: (row) => {
        let badgeType = 'badge-info';
        if (row.customerResponse === 'Interested') badgeType = 'badge-success';
        if (row.customerResponse === 'Negotiation') badgeType = 'badge-warning';
        if (row.customerResponse === 'Not Interested') badgeType = 'badge-danger';
        return <span className={`badge ${badgeType}`}>{row.customerResponse}</span>;
      }
    },
    {
      header: 'Discussion Summary',
      accessor: 'discussionNotes',
      render: (row) => (
        <div style={{ maxWidth: 260, fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.discussionNotes}
        </div>
      )
    },
    {
      header: 'Next Reminder',
      accessor: 'nextFollowUpDate',
      render: (row) => {
        if (!row.nextFollowUpDate) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        const dateObj = new Date(row.nextFollowUpDate);
        const isToday = new Date().toDateString() === dateObj.toDateString();
        return (
          <div>
            <div style={{ fontWeight: 600, color: isToday ? 'var(--warning)' : 'var(--text-primary)', fontSize: '0.8rem' }}>
              {isToday ? 'Today' : dateObj.toLocaleDateString('en-GB')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.nextAction}</div>
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
          <button className="icon-btn" title="View Interaction" onClick={() => setSelectedFollowUp(row)}>
            <Eye size={15} />
          </button>
          <button
            className="icon-btn"
            title={row.status === 'Pending' ? 'Mark Completed' : 'Re-open'}
            style={{ color: row.status === 'Pending' ? 'var(--success)' : 'var(--warning)' }}
            onClick={() => handleToggleComplete(row._id, row.status)}
          >
            <CheckCircle size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Touchpoints" value={followUps.length} subtext="Client Communications" icon={PhoneCall} color="var(--primary)" />
        <KpiCard title="Pending Reminders" value={followUps.filter(f => f.status === 'Pending').length} subtext="Scheduled Calls" icon={Clock} color="var(--warning)" />
        <KpiCard title="High Interest" value={followUps.filter(f => f.customerResponse === 'Interested').length} subtext="High Probability" icon={CheckCircle} color="var(--success)" />
        <KpiCard title="Under Negotiation" value={followUps.filter(f => f.customerResponse === 'Negotiation').length} subtext="Active Deals" icon={Calendar} color="#6366F1" />
      </div>

      {/* Stage Filter Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Follow-ups ({followUps.length})
          </button>
          <button
            className={`tab-btn ${filterType === 'enquiry' ? 'active' : ''}`}
            onClick={() => setFilterType('enquiry')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HelpCircle size={14} /> Enquiry Touchpoints ({followUps.filter(f => f.enquiryReference).length})
          </button>
          <button
            className={`tab-btn ${filterType === 'lead' ? 'active' : ''}`}
            onClick={() => setFilterType('lead')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Users size={14} /> Qualified Lead Calls ({followUps.filter(f => f.relatedLead).length})
          </button>
          <button
            className={`tab-btn ${filterType === 'quotation' ? 'active' : ''}`}
            onClick={() => setFilterType('quotation')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileText size={14} /> Quote Negotiations ({followUps.filter(f => f.relatedQuotation).length})
          </button>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Log Interaction
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search notes, company, phone, representative..."
      />

      {/* Modal: Log Interaction */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Client Follow-up"
        subtitle="Record meeting notes, call feedback, and schedule the next milestone"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Client / Customer Account *</label>
              <select
                className="form-select"
                value={formData.customer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
              >
                <option value="">Select Account...</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.companyName} ({c.contactPerson})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Enquiry Reference</label>
              <select
                className="form-select"
                value={formData.enquiryReference}
                onChange={(e) => setFormData({ ...formData, enquiryReference: e.target.value })}
              >
                <option value="">No Enquiry Link</option>
                {enquiries.map(enq => (
                  <option key={enq._id} value={enq._id}>
                    {enq.enquiryNumber} - {enq.productName || 'Equipment'} ({enq.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Lead Opportunity</label>
              <select
                className="form-select"
                value={formData.relatedLead}
                onChange={(e) => setFormData({ ...formData, relatedLead: e.target.value })}
              >
                <option value="">No Lead Link</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.leadNumber} - {l.productName || 'Lead'} (₹{l.expectedOrderValue?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Commercial Quotation</label>
              <select
                className="form-select"
                value={formData.relatedQuotation}
                onChange={(e) => setFormData({ ...formData, relatedQuotation: e.target.value })}
              >
                <option value="">No Quotation Link</option>
                {quotations.map(q => (
                  <option key={q._id} value={q._id}>
                    {q.quotationNumber} ({q.version}) - ₹{q.grandTotal?.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Method</label>
              <select
                className="form-select"
                value={formData.contactMethod}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
              >
                <option value="Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Meeting">In-Person Meeting</option>
                <option value="Email">Email Communication</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Response</label>
              <select
                className="form-select"
                value={formData.customerResponse}
                onChange={(e) => setFormData({ ...formData, customerResponse: e.target.value })}
              >
                <option value="Interested">Interested (High Chance)</option>
                <option value="Negotiation">Negotiation / Reviewing Price</option>
                <option value="Follow-up Required">Follow-up Call Scheduled</option>
                <option value="Not Interested">Not Interested / Closed</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Discussion Notes & Feedback *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Key takeaways, requested technical clarifications, discount discussions..."
                value={formData.discussionNotes}
                onChange={(e) => setFormData({ ...formData, discussionNotes: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next Reminder Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.nextFollowUpDate}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Action Item</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Issue Revised V2 Quote"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-up Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      <Modal
        isOpen={!!selectedFollowUp}
        onClose={() => setSelectedFollowUp(null)}
        title={`Follow-up Note: ${selectedFollowUp?.followUpNumber}`}
        subtitle={`Touchpoint with ${selectedFollowUp?.customer?.companyName || selectedFollowUp?.enquiryReference?.companyName}`}
        size="lg"
      >
        {selectedFollowUp && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedFollowUp.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Client Company</div>
                <div className="detail-value">{selectedFollowUp.customer?.companyName || selectedFollowUp.enquiryReference?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person & Phone</div>
                <div className="detail-value">{selectedFollowUp.customer?.contactPerson || selectedFollowUp.enquiryReference?.contactPerson} ({selectedFollowUp.customer?.mobileNumber || selectedFollowUp.enquiryReference?.mobileNumber})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Response Outcome</div>
                <div className="detail-value">{selectedFollowUp.customerResponse}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Method</div>
                <div className="detail-value">{selectedFollowUp.contactMethod}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Next Reminder Date</div>
                <div className="detail-value">{selectedFollowUp.nextFollowUpDate ? new Date(selectedFollowUp.nextFollowUpDate).toLocaleDateString('en-GB') : '—'}</div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Discussion Notes</div>
                <div className="detail-value" style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedFollowUp.discussionNotes}</div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleToggleComplete(selectedFollowUp._id, selectedFollowUp.status)}
              >
                {selectedFollowUp.status === 'Pending' ? 'Mark Completed' : 'Re-open Follow-up'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
