import React, { useState } from 'react';
import { Plus, Eye, PhoneCall, CheckCircle, Clock, Calendar } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function FollowUpsModule({ followUps, customers, leads, quotations, onSave, onUpdateStatus, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    followUpNumber: '',
    customer: '',
    relatedLead: '',
    relatedQuotation: '',
    contactDate: new Date().toISOString().split('T')[0],
    contactMethod: 'Call',
    discussionNotes: '',
    customerResponse: 'Interested',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextAction: 'Follow-up Call & Share Technical Brouchure',
    assignedEmployee: 'Kabilan (Sales Executive)',
    status: 'Pending'
  });

  const handleOpenAdd = () => {
    setFormData({
      followUpNumber: '',
      customer: customers[0]?._id || '',
      relatedLead: leads[0]?._id || '',
      relatedQuotation: '',
      contactDate: new Date().toISOString().split('T')[0],
      contactMethod: 'Call',
      discussionNotes: '',
      customerResponse: 'Interested',
      nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextAction: 'Follow-up Call & Share Technical Brouchure',
      assignedEmployee: 'Kabilan (Sales Executive)',
      status: 'Pending'
    });
    setIsAddOpen(true);
  };

  const handleCustomerChange = (custId) => {
    const custLeads = leads.filter(l => (l.customer?._id || l.customer) === custId);
    const custQuotes = quotations.filter(q => (q.customer?._id || q.customer) === custId);

    setFormData({
      ...formData,
      customer: custId,
      relatedLead: custLeads[0]?._id || '',
      relatedQuotation: custQuotes[0]?._id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer) {
        showToast('Please select a customer for this follow-up', 'error');
        return;
      }
      if (!formData.discussionNotes) {
        showToast('Please enter discussion notes', 'error');
        return;
      }
      await onSave(formData);
      showToast('Follow-up scheduled and logged successfully', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleComplete = async (fuId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await onUpdateStatus(fuId, nextStatus);
      showToast(`Follow-up marked as ${nextStatus}`, 'success');
      if (selectedFollowUp) {
        setSelectedFollowUp({ ...selectedFollowUp, status: nextStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Follow-up No',
      accessor: 'followUpNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedFollowUp(row)}>
          {row.followUpNumber}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {row.customer?.contactPerson} • {row.customer?.mobileNumber}
          </div>
        </div>
      )
    },
    {
      header: 'Related Lead',
      render: (row) => row.relatedLead?.leadNumber ? (
        <span style={{ color: '#818CF8', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          {row.relatedLead?.leadNumber}
        </span>
      ) : '—'
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
      header: 'Next Action Date',
      accessor: 'nextFollowUpDate',
      render: (row) => {
        const dateObj = new Date(row.nextFollowUpDate);
        const isToday = new Date().toDateString() === dateObj.toDateString();
        return (
          <div>
            <div style={{ fontWeight: 600, color: isToday ? '#FBBF24' : '#fff' }}>
              {isToday ? 'Today' : dateObj.toLocaleDateString('en-GB')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.nextAction}</div>
          </div>
        );
      }
    },
    {
      header: 'Assigned To',
      accessor: 'assignedEmployee',
      render: (row) => row.assignedEmployee
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
            style={{ color: row.status === 'Pending' ? '#10B981' : '#F59E0B' }}
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
        <KpiCard title="Total Follow-ups" value={followUps.length} subtext="Client Interactions" icon={PhoneCall} color="#6366F1" />
        <KpiCard title="Pending Action" value={followUps.filter(f => f.status === 'Pending').length} subtext="Scheduled Ahead" icon={Clock} color="#F59E0B" />
        <KpiCard title="Completed Calls" value={followUps.filter(f => f.status === 'Completed').length} subtext="Logged & Executed" icon={CheckCircle} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={followUps}
        searchPlaceholder="Search customer, discussion notes, employee..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Schedule Follow-up
          </button>
        }
      />

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Schedule & Log Customer Follow-up"
        subtitle="Record meeting details, customer reactions, and calendarize next steps"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Follow-up No</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. FU-003)"
                value={formData.followUpNumber}
                onChange={(e) => setFormData({ ...formData, followUpNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Customer <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.customer}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                <option value="">Select Account</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Related Lead Opportunity</label>
              <select
                className="form-select"
                value={formData.relatedLead}
                onChange={(e) => setFormData({ ...formData, relatedLead: e.target.value })}
              >
                <option value="">None / General Discussion</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.leadNumber} — {l.customer?.companyName} ({l.leadStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Related Quotation (Optional)</label>
              <select
                className="form-select"
                value={formData.relatedQuotation}
                onChange={(e) => setFormData({ ...formData, relatedQuotation: e.target.value })}
              >
                <option value="">None / Pre-Quote</option>
                {quotations.map(q => (
                  <option key={q._id} value={q._id}>
                    {q.quotationNumber} ({q.version}) — ₹{q.grandTotal?.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.contactDate}
                onChange={(e) => setFormData({ ...formData, contactDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Method</label>
              <select
                className="form-select"
                value={formData.contactMethod}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">In-Person Meeting</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Discussion Notes <span className="req">*</span></label>
              <textarea
                rows="3"
                required
                className="form-textarea"
                placeholder="Key points discussed, technical queries raised, commercial reaction..."
                value={formData.discussionNotes}
                onChange={(e) => setFormData({ ...formData, discussionNotes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Response</label>
              <select
                className="form-select"
                value={formData.customerResponse}
                onChange={(e) => setFormData({ ...formData, customerResponse: e.target.value })}
              >
                <option value="Interested">Interested (Warm Lead)</option>
                <option value="Negotiation">Negotiation (Price discussion)</option>
                <option value="No Response">No Response (Need follow-up)</option>
                <option value="Not Interested">Not Interested (Cold)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Next Action Scheduled</label>
              <input
                type="text"
                className="form-input"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next Follow-up Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.nextFollowUpDate}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Representative</label>
              <input
                type="text"
                className="form-input"
                value={formData.assignedEmployee}
                onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-up Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedFollowUp}
        onClose={() => setSelectedFollowUp(null)}
        title={`Follow-up Note: ${selectedFollowUp?.followUpNumber}`}
        subtitle={`Account: ${selectedFollowUp?.customer?.companyName}`}
      >
        {selectedFollowUp && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Customer Company</div>
              <div className="detail-value">{selectedFollowUp.customer?.companyName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={selectedFollowUp.status} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact Person</div>
              <div className="detail-value">{selectedFollowUp.customer?.contactPerson} ({selectedFollowUp.customer?.mobileNumber})</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Interaction Method</div>
              <div className="detail-value">{selectedFollowUp.contactMethod}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Customer Response</div>
              <div className="detail-value" style={{ color: '#FBBF24' }}>{selectedFollowUp.customerResponse}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Next Action Date</div>
              <div className="detail-value" style={{ color: '#06B6D4' }}>
                {new Date(selectedFollowUp.nextFollowUpDate).toLocaleDateString('en-GB')}
              </div>
            </div>
            <div className="detail-item col-span-2">
              <div className="detail-label">Discussion Notes</div>
              <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                {selectedFollowUp.discussionNotes}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

