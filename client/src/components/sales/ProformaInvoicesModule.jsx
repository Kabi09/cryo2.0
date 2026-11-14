import React, { useState, useEffect } from 'react';
import { Plus, Eye, Receipt, Send, Download, DollarSign, ShoppingBag, ArrowRight, CreditCard, CheckCircle2 } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function ProformaInvoicesModule({
  proformaInvoices = [],
  quotations = [],
  payments = [],
  onSave,
  onSavePayment,
  onNavigateToSO,
  preSelectedQuote,
  selectedPIForView,
  onClearViewPI,
  onClearPreSelectedQuote,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPI, setSelectedPI] = useState(null);
  const [recordPaymentPI, setRecordPaymentPI] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Draft' | 'Sent' | 'Confirmed'

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amountReceived: '',
    transactionReference: '',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const getPIPayments = (piId) => {
    return payments.filter(p => (p.piReference?._id || p.piReference) === piId);
  };

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

  // Handle direct view navigation from Quotations
  useEffect(() => {
    if (selectedPIForView) {
      setSelectedPI(selectedPIForView);
      onClearViewPI?.();
    }
  }, [selectedPIForView]);

  // Pre-fill from quotation if navigated from Quotations module
  useEffect(() => {
    if (preSelectedQuote) {
      // Check if a PI already exists for this quotation to prevent duplicate creation
      const existingPI = proformaInvoices.find(pi => (pi.quotation?._id || pi.quotation) === preSelectedQuote._id);
      if (existingPI) {
        setSelectedPI(existingPI);
        showToast?.(`Proforma Invoice ${existingPI.piNumber} already exists for this quotation.`, 'info');
        onClearPreSelectedQuote?.();
        return;
      }

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
      onClearPreSelectedQuote?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      if (!paymentData.transactionReference.trim()) {
        showToast('Please provide a Bank / UTR transaction reference', 'error');
        return;
      }
      const amt = Number(paymentData.amountReceived);
      if (!amt || amt <= 0) {
        showToast('Please enter a valid positive payment amount', 'error');
        return;
      }

      if (onSavePayment) {
        await onSavePayment({
          customer: recordPaymentPI.customer?._id || recordPaymentPI.customer,
          piReference: recordPaymentPI._id,
          amountReceived: amt,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          transactionReference: paymentData.transactionReference.trim(),
          paymentProof: 'Bank_Transfer_Slip.pdf',
          remarks: paymentData.remarks || `Advance remittance received against ${recordPaymentPI.piNumber}`,
          paymentType: (recordPaymentPI.totalReceived || 0) > 0 ? 'Partial' : 'Advance',
          status: 'Received'
        });
        showToast(`Payment of ₹${amt.toLocaleString('en-IN')} with UTR ${paymentData.transactionReference.trim()} recorded successfully!`, 'success');
      }

      setRecordPaymentPI(null);
      if (selectedPI && selectedPI._id === recordPaymentPI._id) {
        const newTotal = (selectedPI.totalReceived || 0) + amt;
        const newBal = Math.max(0, selectedPI.grandTotal - newTotal);
        setSelectedPI({
          ...selectedPI,
          totalReceived: newTotal,
          balanceAmount: newBal,
          status: newBal === 0 ? 'Paid' : 'Partially Paid'
        });
      }
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
      header: 'Advance / Received',
      render: (row) => {
        const received = row.totalReceived || 0;
        const balance = row.balanceAmount !== undefined ? row.balanceAmount : Math.max(0, row.grandTotal - received);
        return (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: received > 0 ? 'var(--success)' : 'var(--warning)' }}>
              ₹{received.toLocaleString('en-IN')} recd
            </div>
            <div style={{ fontSize: '0.72rem', color: balance > 0 ? 'var(--text-muted)' : 'var(--success)' }}>
              {balance > 0 ? `₹${balance.toLocaleString('en-IN')} bal` : 'Fully Paid'}
            </div>
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
      render: (row) => {
        const balance = row.balanceAmount !== undefined ? row.balanceAmount : Math.max(0, row.grandTotal - (row.totalReceived || 0));
        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" title="View PI Document" onClick={() => setSelectedPI(row)}>
              <Eye size={15} />
            </button>
            {balance > 0 && onSavePayment && (
              <button
                className="icon-btn"
                title="Record Payment / Installment"
                style={{ color: '#10B981' }}
                onClick={() => {
                  setRecordPaymentPI(row);
                  setPaymentData({
                    amountReceived: balance > 0 ? (row.advanceAmount && (!row.totalReceived || row.totalReceived === 0) ? row.advanceAmount : balance) : '',
                    transactionReference: '',
                    paymentMethod: 'Bank Transfer',
                    paymentDate: new Date().toISOString().split('T')[0],
                    remarks: `Advance remittance against ${row.piNumber}`
                  });
                }}
              >
                <CreditCard size={15} />
              </button>
            )}
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
        );
      }
    }
  ];

  const filteredPIs = proformaInvoices
    .filter(p => {
      if (activeTab === 'all') return true;
      if (activeTab === 'Draft') return p.status === 'Draft';
      if (activeTab === 'Sent') return p.status === 'Sent';
      if (activeTab === 'Confirmed') return p.status === 'Confirmed' || p.status === 'Partially Paid' || p.status === 'Paid';
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.piDate || 0) - new Date(a.createdAt || a.piDate || 0));

  return (
    <div className="module-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total PIs Issued" value={proformaInvoices.length} subtext="Formal Pre-Invoices" icon={Receipt} color="var(--primary)" />
        <KpiCard title="Advance Invoiced" value={`₹${proformaInvoices.reduce((a, b) => a + (b.advanceAmount || 0), 0).toLocaleString('en-IN')}`} subtext="Target Inflows" icon={DollarSign} color="#F59E0B" />
        <KpiCard title="Confirmed / Paid PIs" value={proformaInvoices.filter(p => p.status === 'Paid' || p.status === 'Confirmed' || p.status === 'Partially Paid').length} subtext="Ready for Production SO" icon={Receipt} color="#16A36A" />
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
            { key: 'all', label: 'All Invoices', count: proformaInvoices.length },
            { key: 'Draft', label: 'Draft', count: proformaInvoices.filter(p => p.status === 'Draft').length },
            { key: 'Sent', label: 'Sent', count: proformaInvoices.filter(p => p.status === 'Sent').length },
            {
              key: 'Confirmed',
              label: 'Confirmed / Advance Received',
              count: proformaInvoices.filter(p => p.status === 'Confirmed' || p.status === 'Partially Paid' || p.status === 'Paid').length
            }
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
        data={filteredPIs}
        searchPlaceholder="Search PI number, customer, quote..."
        toolbarAction={
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

            {/* Payment & Installment Tracking Section */}
            <div style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Payments & Collections ({getPIPayments(selectedPI._id).length})
                </span>
                {onSavePayment && (selectedPI.balanceAmount > 0 || !selectedPI.totalReceived) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4, color: 'var(--success)', borderColor: 'var(--success-border)' }}
                    onClick={() => {
                      const pi = selectedPI;
                      setRecordPaymentPI(pi);
                      const bal = pi.balanceAmount !== undefined ? pi.balanceAmount : Math.max(0, pi.grandTotal - (pi.totalReceived || 0));
                      setPaymentData({
                        amountReceived: bal > 0 ? (pi.advanceAmount && (!pi.totalReceived || pi.totalReceived === 0) ? pi.advanceAmount : bal) : '',
                        transactionReference: '',
                        paymentMethod: 'Bank Transfer',
                        paymentDate: new Date().toISOString().split('T')[0],
                        remarks: `Remittance against ${pi.piNumber}`
                      });
                    }}
                  >
                    <CreditCard size={12} /> + Record Payment
                  </button>
                )}
              </div>

              {getPIPayments(selectedPI._id).length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No payments recorded for this Proforma Invoice yet. Click <strong>+ Record Payment</strong> to log customer advance or installments.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {getPIPayments(selectedPI._id).map((pay, idx) => (
                    <div
                      key={pay._id || idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 8
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="code-badge">{pay.paymentNumber || `PAY-${idx + 1}`}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(pay.paymentDate).toLocaleDateString('en-GB')}
                          </span>
                          <span style={{ fontSize: '0.72rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                            {pay.paymentMethod}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          UTR / Ref: <strong style={{ fontFamily: 'var(--font-mono)' }}>{pay.transactionReference}</strong>
                          {pay.remarks && <span> • {pay.remarks}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10B981', fontSize: '0.95rem' }}>
                          ₹{pay.amountReceived?.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: pay.status === 'Verified' ? 'var(--success)' : 'var(--warning)' }}>
                          {pay.status || 'Received'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {onNavigateToSO && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {onSavePayment && (selectedPI.balanceAmount > 0 || !selectedPI.totalReceived) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const pi = selectedPI;
                      setRecordPaymentPI(pi);
                      const bal = pi.balanceAmount !== undefined ? pi.balanceAmount : Math.max(0, pi.grandTotal - (pi.totalReceived || 0));
                      setPaymentData({
                        amountReceived: bal > 0 ? (pi.advanceAmount && (!pi.totalReceived || pi.totalReceived === 0) ? pi.advanceAmount : bal) : '',
                        transactionReference: '',
                        paymentMethod: 'Bank Transfer',
                        paymentDate: new Date().toISOString().split('T')[0],
                        remarks: `Remittance against ${pi.piNumber}`
                      });
                    }}
                  >
                    <CreditCard size={14} /> Record Payment
                  </button>
                )}
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

      {/* Record Payment / Advance Installment Modal */}
      {recordPaymentPI && (
        <Modal
          isOpen={!!recordPaymentPI}
          onClose={() => setRecordPaymentPI(null)}
          title={`Record Payment: ${recordPaymentPI.piNumber}`}
          subtitle={`Customer: ${recordPaymentPI.customer?.companyName || 'Valued Client'}`}
        >
          <form onSubmit={handleSavePayment}>
            <div style={{
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem'
            }}>
              <div>
                Total Invoice: <strong>₹{recordPaymentPI.grandTotal?.toLocaleString('en-IN')}</strong> • Advance Req: <strong>₹{recordPaymentPI.advanceAmount?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ color: 'var(--danger)', fontWeight: 600 }}>
                Remaining Balance: ₹{(recordPaymentPI.balanceAmount !== undefined ? recordPaymentPI.balanceAmount : Math.max(0, recordPaymentPI.grandTotal - (recordPaymentPI.totalReceived || 0))).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Amount Received (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  placeholder="e.g. 50000"
                  value={paymentData.amountReceived}
                  onChange={(e) => setPaymentData({ ...paymentData, amountReceived: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  className="form-control"
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI / QR Remittance</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div className="form-group col-span-2">
                <label>Transaction / UTR Reference No <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. UTR-HDFC-99182301 or IMPS reference"
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label>Payment Date</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label>Remarks / Notes</label>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Optional bank account or payment note..."
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRecordPaymentPI(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={14} /> Save Payment Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
