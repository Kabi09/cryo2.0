import React, { useState, useEffect } from 'react';
import { Plus, Eye, Receipt, Send, Download, DollarSign, ShoppingBag, ArrowRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function ProformaInvoicesModule({
  proformaInvoices = [],
  quotations = [],
  onSave,
  onNavigateToSO,
  preSelectedQuote,
  showToast
}) {
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

  // Pre-fill from quotation if navigated from Quotations module
  useEffect(() => {
    if (preSelectedQuote) {
      setFormData({
        piNumber: '',
        customer: preSelectedQuote.customer?._id || preSelectedQuote.customer || '',
        quotation: preSelectedQuote._id || '',
        piDate: new Date().toISOString().split('T')[0],
        advancePercentage: 50,
        bankDetails: 'HDFC Bank, Anna Nagar Branch, A/C: 50200012345678, IFSC: HDFC0000240',
        paymentTerms: preSelectedQuote.paymentTerms || '50% Advance via Bank/RTGS, Balance Before Dispatch',
        deliveryTerms: preSelectedQuote.deliveryTerms || '4 Weeks from receipt of Advance & verified PO',
        validity: '30 Days from date of issue',
        status: 'Sent'
      });
      setIsAddOpen(true);
    }
  }, [preSelectedQuote]);

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
        balanceAmount,
        advancePercentage: Number(formData.advancePercentage) || 50
      });

      showToast('Proforma Invoice issued successfully!', 'success');
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
      header: 'Date',
      accessor: 'piDate',
      render: (row) => new Date(row.piDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Quote: {row.quotation?.quotationNumber || 'Ref'}
          </div>
        </div>
      )
    },
    {
      header: 'Invoice Amount',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Advance Required',
      accessor: 'advanceAmount',
      render: (row) => (
        <div>
          <span style={{ color: 'var(--warning)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
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
          <button
            className="btn btn-primary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              gap: 4,
              height: 26,
              borderRadius: 6
            }}
            title="Convert to Confirmed Sales Order"
            onClick={() => onNavigateToSO?.(row)}
          >
            <ShoppingBag size={12} /> Convert to SO ➔
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
        <KpiCard title="Advance Invoiced" value={`₹${proformaInvoices.reduce((a, b) => a + (b.advanceAmount || 0), 0).toLocaleString('en-IN')}`} subtext="Target Inflows" icon={DollarSign} color="var(--warning)" />
        <KpiCard title="Fully Paid PIs" value={proformaInvoices.filter(p => p.status === 'Paid').length} subtext="Settled in Full" icon={Receipt} color="var(--success)" />
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
                placeholder="Auto-generated (e.g. PI-001)"
                value={formData.piNumber}
                onChange={(e) => setFormData({ ...formData, piNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Reference *</label>
              <select
                className="form-select"
                value={formData.quotation}
                onChange={(e) => handleQuoteChange(e.target.value)}
                required
              >
                <option value="">Select Accepted Quotation...</option>
                {eligibleQuotes.map(q => (
                  <option key={q._id} value={q._id}>
                    {q.quotationNumber} ({q.version}) - {q.customer?.companyName} (₹{q.grandTotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PI Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.piDate}
                onChange={(e) => setFormData({ ...formData, piDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advance % Required</label>
              <select
                className="form-select"
                value={formData.advancePercentage}
                onChange={(e) => setFormData({ ...formData, advancePercentage: Number(e.target.value) })}
              >
                <option value={20}>20% Advance</option>
                <option value={30}>30% Advance</option>
                <option value={50}>50% Advance (Standard)</option>
                <option value={100}>100% Full Payment</option>
              </select>
            </div>
          </div>

          {/* Amount Calculation Summary Card */}
          <div style={{
            marginTop: 18,
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Commercial Quote Value:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Advance Billing Required ({formData.advancePercentage}%):</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--warning)' }}>
                ₹{advanceAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance Payable Before Dispatch:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{balanceAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Terms & Bank Details */}
          <div className="form-grid" style={{ marginTop: 18 }}>
            <div className="form-group col-span-2">
              <label className="form-label">Payment Terms</label>
              <input
                type="text"
                className="form-input"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Delivery Terms</label>
              <input
                type="text"
                className="form-input"
                value={formData.deliveryTerms}
                onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Bank Remittance Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
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
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                  ₹{selectedPI.grandTotal?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Advance Required</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                  ₹{selectedPI.advanceAmount?.toLocaleString('en-IN')} ({selectedPI.advancePercentage}%)
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Amount Received So Far</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  ₹{(selectedPI.totalReceived || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Balance Remaining</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>
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

            {onNavigateToSO && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const pi = selectedPI;
                    setSelectedPI(null);
                    onNavigateToSO(pi);
                  }}
                >
                  <ShoppingBag size={14} /> Convert to Confirmed Sales Order (SO) ➔
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
