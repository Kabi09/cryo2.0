import React, { useState } from 'react';
import { Plus, Eye, Receipt, Send, Download, DollarSign } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function ProformaInvoicesModule({ proformaInvoices, quotations, onSave, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPI, setSelectedPI] = useState(null);

  // Eligible quotations (Accepted or Sent)
  const eligibleQuotes = quotations.filter(q => q.status === 'Accepted' || q.status === 'Sent');

  // Form State
  const [formData, setFormData] = useState({
    piNumber: '',
    customer: '',
    quotation: '',
    piDate: new Date().toISOString().split('T')[0],
    advancePercentage: 50,
    bankDetails: 'HDFC Bank, Anna Nagar Branch, A/C: 50200012345678, IFSC: HDFC0000240',
    paymentTerms: '50% Advance via Bank/RTGS, Balance Before Dispatch',
    deliveryTerms: '4 Weeks from receipt of Advance & verified PO',
    validity: '30 Days from date of issue',
    status: 'Sent'
  });

  const handleOpenAdd = () => {
    const defaultQuote = eligibleQuotes[0] || quotations[0];
    setFormData({
      piNumber: '',
      customer: defaultQuote?.customer?._id || defaultQuote?.customer || '',
      quotation: defaultQuote?._id || '',
      piDate: new Date().toISOString().split('T')[0],
      advancePercentage: 50,
      bankDetails: 'HDFC Bank, Anna Nagar Branch, A/C: 50200012345678, IFSC: HDFC0000240',
      paymentTerms: defaultQuote?.paymentTerms || '50% Advance via Bank/RTGS, Balance Before Dispatch',
      deliveryTerms: defaultQuote?.deliveryTerms || '4 Weeks from receipt of Advance & verified PO',
      validity: '30 Days from date of issue',
      status: 'Sent'
    });
    setIsAddOpen(true);
  };

  const handleQuoteChange = (quoteId) => {
    const quote = quotations.find(q => q._id === quoteId);
    if (quote) {
      setFormData({
        ...formData,
        quotation: quoteId,
        customer: quote.customer?._id || quote.customer,
        paymentTerms: quote.paymentTerms || formData.paymentTerms,
        deliveryTerms: quote.deliveryTerms || formData.deliveryTerms
      });
    }
  };

  const selectedQuoteObj = quotations.find(q => q._id === formData.quotation);
  const grandTotal = selectedQuoteObj?.grandTotal || 200000;
  const advanceAmount = Math.round((grandTotal * (Number(formData.advancePercentage) || 50)) / 100);
  const balanceAmount = grandTotal - advanceAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.quotation) {
        showToast('Please select an accepted quotation', 'error');
        return;
      }
      await onSave({
        ...formData,
        grandTotal,
        advanceAmount,
        balanceAmount
      });
      showToast('Proforma Invoice generated and sent to client!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'PI Number',
      accessor: 'piNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedPI(row)}>
          {row.piNumber}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customer?.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'Quotation Ref',
      render: (row) => (
        <span className="code-badge">
          {row.quotation?.quotationNumber} ({row.quotation?.version})
        </span>
      )
    },
    {
      header: 'PI Date',
      accessor: 'piDate',
      render: (row) => new Date(row.piDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Grand Total',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Advance Required',
      accessor: 'advanceAmount',
      render: (row) => (
        <div>
          <span style={{ color: '#FBBF24', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            ₹{row.advanceAmount?.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
            ({row.advancePercentage}%)
          </span>
        </div>
      )
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
          <button className="icon-btn" title="View PI Document" onClick={() => setSelectedPI(row)}>
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
        <KpiCard title="Total PIs Issued" value={proformaInvoices.length} subtext="Formal Pre-Invoices" icon={Receipt} color="#6366F1" />
        <KpiCard title="Advance Invoiced" value={`₹${proformaInvoices.reduce((a, b) => a + (b.advanceAmount || 0), 0).toLocaleString('en-IN')}`} subtext="Target Inflows" icon={DollarSign} color="#F59E0B" />
        <KpiCard title="Fully Paid PIs" value={proformaInvoices.filter(p => p.status === 'Paid').length} subtext="Settled in Full" icon={Receipt} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={proformaInvoices}
        searchPlaceholder="Search PI number, customer, quote..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Generate Proforma Invoice
          </button>
        }
      />

      {/* Create PI Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Generate Proforma Invoice (PI)"
        subtitle="Formally invoice customer based on accepted commercial proposal for advance payment"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">PI Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. PI-003)"
                value={formData.piNumber}
                onChange={(e) => setFormData({ ...formData, piNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Accepted Quotation Reference <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.quotation}
                onChange={(e) => handleQuoteChange(e.target.value)}
              >
                <option value="">Select Accepted Proposal</option>
                {quotations.map(q => (
                  <option key={q._id} value={q._id}>
                    {q.quotationNumber} ({q.version}) — {q.customer?.companyName} (₹{q.grandTotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PI Issue Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.piDate}
                onChange={(e) => setFormData({ ...formData, piDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advance Required (%) <span className="req">*</span></label>
              <input
                type="number"
                min="10"
                max="100"
                required
                className="form-input"
                value={formData.advancePercentage}
                onChange={(e) => setFormData({ ...formData, advancePercentage: Number(e.target.value) })}
              />
            </div>

            {/* Live Financial Breakdown */}
            <div className="form-group col-span-2" style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Grand Total</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Advance Due ({formData.advancePercentage}%)</span>
                <strong style={{ fontSize: '1.1rem', color: '#D97706', fontFamily: 'var(--font-mono)' }}>
                  ₹{advanceAmount.toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Remaining Balance</span>
                <strong style={{ fontSize: '1.1rem', color: '#16A36A', fontFamily: 'var(--font-mono)' }}>
                  ₹{balanceAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remittance Bank Details</label>
              <input
                type="text"
                className="form-input"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <input
                type="text"
                className="form-input"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Terms</label>
              <input
                type="text"
                className="form-input"
                value={formData.deliveryTerms}
                onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> Issue & Send Proforma Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* View PI Details Modal */}
      <Modal
        isOpen={!!selectedPI}
        onClose={() => setSelectedPI(null)}
        size="lg"
        title={`Proforma Invoice: ${selectedPI?.piNumber}`}
        subtitle={`Issued to ${selectedPI?.customer?.companyName}`}
      >
        {selectedPI && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">PI Number</div>
                <div className="detail-value">{selectedPI.piNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedPI.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Company</div>
                <div className="detail-value">{selectedPI.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Quotation Ref</div>
                <div className="detail-value">{selectedPI.quotation?.quotationNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Total Invoiced Amount</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: '#34D399' }}>
                  ₹{selectedPI.grandTotal?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Advance Required</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>
                  ₹{selectedPI.advanceAmount?.toLocaleString('en-IN')} ({selectedPI.advancePercentage}%)
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Amount Received So Far</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: '#06B6D4' }}>
                  ₹{(selectedPI.totalReceived || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Balance Remaining</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: '#F87171' }}>
                  ₹{selectedPI.balanceAmount?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Bank Remittance Instructions</div>
                <div className="detail-value" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {selectedPI.bankDetails}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

