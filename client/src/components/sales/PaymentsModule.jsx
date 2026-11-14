import React, { useState } from 'react';
import { Plus, Eye, CreditCard, CheckCircle2, DollarSign, Clock, AlertCircle, Building, Package, Receipt, ArrowRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function PaymentsModule({ payments = [], customers = [], proformaInvoices = [], onSave, onVerify, showToast }) {
  const [subTab, setSubTab] = useState('paid'); // 'paid' | 'pending'
  const [paidFilter, setPaidFilter] = useState('all'); // 'all' | 'Advance' | 'Partial' | 'Verified'
  const [pendingFilter, setPendingFilter] = useState('all'); // 'all' | 'advance-pending' | 'balance-pending'

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPIDetails, setSelectedPIDetails] = useState(null);

  const handleViewPIDetails = (piRef) => {
    if (!piRef) return;
    const piId = typeof piRef === 'object' ? piRef._id : piRef;
    const fullPI = proformaInvoices.find(p => p._id === piId) || (typeof piRef === 'object' ? piRef : null);
    if (fullPI) {
      setSelectedPIDetails(fullPI);
    } else if (showToast) {
      showToast('Proforma Invoice details not found', 'info');
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    paymentNumber: '',
    customer: '',
    piReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Advance',
    amountReceived: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    paymentProof: 'NEFT_Payment_Slip.pdf',
    remarks: ''
  });

  // Calculate pending Proforma Invoices (where balanceAmount > 0 or totalReceived < grandTotal)
  const pendingPIs = proformaInvoices.filter(pi => {
    const bal = pi.balanceAmount !== undefined ? pi.balanceAmount : Math.max(0, (pi.grandTotal || 0) - (pi.totalReceived || 0));
    return bal > 0 && pi.status !== 'Draft';
  });

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amountReceived) || 0), 0);
  const totalPendingBalance = pendingPIs.reduce((acc, pi) => {
    const bal = pi.balanceAmount !== undefined ? pi.balanceAmount : Math.max(0, (pi.grandTotal || 0) - (pi.totalReceived || 0));
    return acc + bal;
  }, 0);

  const handleOpenAdd = (targetPI = null) => {
    const activePI = targetPI || pendingPIs[0] || proformaInvoices[0];
    const targetCust = activePI ? (activePI.customer?._id || activePI.customer) : (customers[0]?._id || '');
    const bal = activePI ? (activePI.balanceAmount !== undefined ? activePI.balanceAmount : Math.max(0, (activePI.grandTotal || 0) - (activePI.totalReceived || 0))) : 50000;
    const defaultAmt = activePI ? (activePI.advanceAmount && (!activePI.totalReceived || activePI.totalReceived === 0) ? activePI.advanceAmount : bal) : 50000;

    setFormData({
      paymentNumber: '',
      customer: targetCust,
      piReference: activePI?._id || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: activePI?.totalReceived > 0 ? 'Partial' : 'Advance',
      amountReceived: defaultAmt || 50000,
      paymentMethod: 'Bank Transfer',
      transactionReference: `UTR-${Math.floor(100000000 + Math.random() * 900000000)}`,
      paymentProof: 'Bank_Transfer_Slip.pdf',
      remarks: activePI ? `Remittance received against ${activePI.piNumber}` : 'Customer remittance received.'
    });
    setIsAddOpen(true);
  };

  const handlePIChange = (piId) => {
    const pi = proformaInvoices.find(p => p._id === piId);
    if (pi) {
      const bal = pi.balanceAmount !== undefined ? pi.balanceAmount : Math.max(0, (pi.grandTotal || 0) - (pi.totalReceived || 0));
      const targetAmt = pi.advanceAmount && (!pi.totalReceived || pi.totalReceived === 0) ? pi.advanceAmount : bal;
      setFormData(prev => ({
        ...prev,
        piReference: piId,
        customer: pi.customer?._id || pi.customer,
        amountReceived: targetAmt || 50000,
        paymentType: (pi.totalReceived || 0) > 0 ? 'Partial' : 'Advance',
        remarks: `Remittance against ${pi.piNumber}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.piReference) {
        showToast('Please select a Proforma Invoice reference', 'error');
        return;
      }
      if (!formData.transactionReference.trim()) {
        showToast('Please provide a Bank / UTR transaction reference', 'error');
        return;
      }
      const amt = Number(formData.amountReceived);
      if (!amt || amt <= 0) {
        showToast('Please enter a valid positive payment amount', 'error');
        return;
      }

      await onSave({
        ...formData,
        amountReceived: amt,
        transactionReference: formData.transactionReference.trim()
      });
      showToast(`Payment of ₹${amt.toLocaleString('en-IN')} recorded successfully! Invoiced balance adjusted.`, 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleVerifyPayment = async (payId) => {
    try {
      await onVerify(payId, { verifiedBy: 'Commercial Accountant' });
      showToast('Payment confirmed & verified by accounts lead!', 'success');
      if (selectedPayment) {
        setSelectedPayment({ ...selectedPayment, status: 'Verified' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered Payments (Paid)
  const filteredPayments = payments
    .filter(p => {
      if (paidFilter === 'all') return true;
      if (paidFilter === 'Advance') return p.paymentType === 'Advance';
      if (paidFilter === 'Partial') return p.paymentType === 'Partial';
      if (paidFilter === 'Verified') return p.status === 'Verified';
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.paymentDate || 0) - new Date(a.createdAt || a.paymentDate || 0));

  // Filtered Pending PIs
  const filteredPendingPIs = pendingPIs
    .filter(pi => {
      const received = pi.totalReceived || 0;
      if (pendingFilter === 'advance-pending') return received === 0;
      if (pendingFilter === 'balance-pending') return received > 0;
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.piDate || 0) - new Date(a.createdAt || a.piDate || 0));

  // Columns for Paid Payments
  const paidColumns = [
    {
      header: 'Payment No',
      accessor: 'paymentNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedPayment(row)}>
          {row.paymentNumber}
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
      header: 'PI Ref',
      render: (row) => row.piReference?.piNumber ? (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 600 }}
          title="Click to view Customer, Products & Commercial breakdown of this PI"
          onClick={(e) => {
            e.stopPropagation();
            handleViewPIDetails(row.piReference);
          }}
        >
          {row.piReference.piNumber}
        </span>
      ) : '—'
    },
    {
      header: 'Amount Received',
      accessor: 'amountReceived',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#16A36A' }}>
          ₹{row.amountReceived?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: 'paymentType',
      render: (row) => <span className="nav-badge-pill">{row.paymentType}</span>
    },
    {
      header: 'Method & UTR',
      accessor: 'paymentMethod',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.paymentMethod}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            UTR: {row.transactionReference}
          </div>
        </div>
      )
    },
    {
      header: 'Payment Date',
      accessor: 'paymentDate',
      render: (row) => new Date(row.paymentDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Audit Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Receipt & Balance" onClick={() => setSelectedPayment(row)}>
            <Eye size={15} />
          </button>
          {row.status === 'Received' && (
            <button
              className="icon-btn"
              title="Verify Bank Settlement"
              style={{ color: '#10B981' }}
              onClick={() => handleVerifyPayment(row._id)}
            >
              <CheckCircle2 size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  // Columns for Pending Payments (Invoices Awaiting Remittance)
  const pendingColumns = [
    {
      header: 'PI Number',
      accessor: 'piNumber',
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 600 }}
          title="Click to view Customer, Products & Commercial breakdown of this PI"
          onClick={(e) => {
            e.stopPropagation();
            handleViewPIDetails(row);
          }}
        >
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Quote Ref: {row.quotation?.quotationNumber || '—'}
          </div>
        </div>
      )
    },
    {
      header: 'PI Date',
      accessor: 'piDate',
      render: (row) => new Date(row.piDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Invoice Amount',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Advance Target',
      accessor: 'advanceAmount',
      render: (row) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
          ₹{row.advanceAmount?.toLocaleString('en-IN')} ({row.advancePercentage}%)
        </div>
      )
    },
    {
      header: 'Received So Far',
      render: (row) => (
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: (row.totalReceived || 0) > 0 ? '#10B981' : 'var(--text-muted)' }}>
          ₹{(row.totalReceived || 0).toLocaleString('en-IN')}
        </div>
      )
    },
    {
      header: 'Pending Balance',
      render: (row) => {
        const bal = row.balanceAmount !== undefined ? row.balanceAmount : Math.max(0, (row.grandTotal || 0) - (row.totalReceived || 0));
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--danger)', fontSize: '0.88rem' }}>
            ₹{bal.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-primary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              gap: 4,
              height: 26,
              borderRadius: 6
            }}
            title="Record Customer Payment"
            onClick={() => handleOpenAdd(row)}
          >
            <CreditCard size={12} /> Record Payment ➔
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Top KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Cash Inward" value={`₹${totalCollected.toLocaleString('en-IN')}`} subtext="Verified Receipts" icon={DollarSign} color="#10B981" />
        <KpiCard title="Pending Receivables" value={`₹${totalPendingBalance.toLocaleString('en-IN')}`} subtext="Unsettled Balances" icon={AlertCircle} color="var(--danger)" />
        <KpiCard title="Pending Invoices" value={pendingPIs.length} subtext="Awaiting Customer Payment" icon={Clock} color="#F59E0B" />
        <KpiCard title="Verified Remittances" value={payments.filter(p => p.status === 'Verified').length} subtext="Account Reconciled" icon={CheckCircle2} color="#6366F1" />
      </div>

      {/* Sub-Tabs: Customer Paid Payments vs Pending Payments */}
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
        {/* Main Tab Switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn ${subTab === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setSubTab('paid')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Customer Paid Payments ({payments.length})
          </button>
          <button
            type="button"
            className={`btn ${subTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setSubTab('pending')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Pending Payments ({pendingPIs.length})
          </button>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary" onClick={() => handleOpenAdd()}>
          <Plus size={16} /> Record Inward Payment
        </button>
      </div>

      {/* Filter Badges depending on active sub-tab */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {subTab === 'paid' ? (
          [
            { key: 'all', label: 'All Paid', count: payments.length },
            { key: 'Advance', label: 'Advance Payments', count: payments.filter(p => p.paymentType === 'Advance').length },
            { key: 'Partial', label: 'Partials / Installments', count: payments.filter(p => p.paymentType === 'Partial').length },
            { key: 'Verified', label: 'Verified Settlements', count: payments.filter(p => p.status === 'Verified').length }
          ].map(f => (
            <button
              key={f.key}
              type="button"
              className={`btn btn-sm ${paidFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
              onClick={() => setPaidFilter(f.key)}
            >
              {f.label} ({f.count})
            </button>
          ))
        ) : (
          [
            { key: 'all', label: 'All Pending Invoices', count: pendingPIs.length },
            { key: 'advance-pending', label: 'Zero Advance Received', count: pendingPIs.filter(p => !p.totalReceived || p.totalReceived === 0).length },
            { key: 'balance-pending', label: 'Partial Paid (Balance Remaining)', count: pendingPIs.filter(p => (p.totalReceived || 0) > 0).length }
          ].map(f => (
            <button
              key={f.key}
              type="button"
              className={`btn btn-sm ${pendingFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
              onClick={() => setPendingFilter(f.key)}
            >
              {f.label} ({f.count})
            </button>
          ))
        )}
      </div>

      {/* Main Data Table */}
      {subTab === 'paid' ? (
        <DataTable
          columns={paidColumns}
          data={filteredPayments}
          searchPlaceholder="Search payment no, customer company, UTR ref..."
        />
      ) : (
        <DataTable
          columns={pendingColumns}
          data={filteredPendingPIs}
          searchPlaceholder="Search pending invoices by PI no, customer..."
        />
      )}

      {/* Add / Record Payment Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Record Customer Payment Receipt"
        subtitle="Post customer bank transfers, advance remittances, or milestone installments with UTR proof"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Payment Receipt No</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. PAY-002)"
                value={formData.paymentNumber}
                onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proforma Invoice Ref <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.piReference}
                onChange={(e) => handlePIChange(e.target.value)}
              >
                <option value="">Select PI to Settle</option>
                {proformaInvoices.map(p => {
                  const bal = p.balanceAmount !== undefined ? p.balanceAmount : Math.max(0, (p.grandTotal || 0) - (p.totalReceived || 0));
                  return (
                    <option key={p._id} value={p._id}>
                      {p.piNumber} — {p.customer?.companyName || 'Client'} (Pending: ₹{bal.toLocaleString('en-IN')})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Classification <span className="req">*</span></label>
              <select
                className="form-select"
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              >
                <option value="Advance">Advance Payment</option>
                <option value="Partial">Partial / Milestone Installment</option>
                <option value="Final">Final Full Settlement</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount Received (₹) <span className="req">*</span></label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                className="form-input"
                style={{ color: '#16A36A', fontWeight: 700 }}
                value={formData.amountReceived}
                onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="UPI">UPI / QR Remittance</option>
                <option value="Cheque">Corporate Cheque</option>
                <option value="Cash">Cash Receipt</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Transaction / UTR Reference No <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. UTR-HDFC-99182301 or IMPS reference number"
                value={formData.transactionReference}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks / Bank Notes</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="e.g. Cleared via corporate online banking into HDFC primary current account"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CreditCard size={15} style={{ marginRight: 6 }} /> Post Payment Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* View Payment Details Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={`Payment Voucher: ${selectedPayment?.paymentNumber}`}
        subtitle={`From ${selectedPayment?.customer?.companyName || 'Valued Client'}`}
      >
        {selectedPayment && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Receipt Number</div>
                <div className="detail-value">{selectedPayment.paymentNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Verification Status</div>
                <div className="detail-value"><StatusBadge status={selectedPayment.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer</div>
                <div className="detail-value">{selectedPayment.customer?.companyName || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Amount Cleared</div>
                <div className="detail-value" style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedPayment.amountReceived?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Transaction Ref (UTR)</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedPayment.transactionReference}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Channel</div>
                <div className="detail-value">{selectedPayment.paymentMethod} ({selectedPayment.paymentType})</div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Proforma Invoice Context</div>
                <div className="detail-value" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span>
                    PI Ref: <strong>{selectedPayment.piReference?.piNumber || '—'}</strong> • Total Value: <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{selectedPayment.piReference?.grandTotal?.toLocaleString('en-IN')}</strong> • Balance: <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{selectedPayment.piReference?.balanceAmount?.toLocaleString('en-IN')}</strong>
                  </span>
                  {selectedPayment.piReference && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem', gap: 4 }}
                      onClick={() => handleViewPIDetails(selectedPayment.piReference)}
                    >
                      <Receipt size={12} /> View Full PI Details ➔
                    </button>
                  )}
                </div>
              </div>
            </div>

            {selectedPayment.status === 'Received' && (
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleVerifyPayment(selectedPayment._id)}
                >
                  <CheckCircle2 size={15} /> Verify & Confirm Commercial Settlement
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Proforma Invoice Detailed Inspection Modal */}
      <Modal
        isOpen={!!selectedPIDetails}
        onClose={() => setSelectedPIDetails(null)}
        size="lg"
        title={`Proforma Invoice: ${selectedPIDetails?.piNumber}`}
        subtitle={`Commercial particulars and line items for ${selectedPIDetails?.customer?.companyName || selectedPIDetails?.companyName || 'Customer'}`}
      >
        {selectedPIDetails && (
          <div>
            {/* Customer & Order Reference Grid */}
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Customer Company</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedPIDetails.customer?.companyName || selectedPIDetails.companyName || '—'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">
                  {selectedPIDetails.customer?.contactPerson || '—'}
                  {selectedPIDetails.customer?.mobileNumber && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      Mob: {selectedPIDetails.customer.mobileNumber}
                    </span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">PI Status & Payment</div>
                <div className="detail-value" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={selectedPIDetails.status} />
                  <span className={`badge ${selectedPIDetails.paymentStatus === 'Paid' ? 'badge-success' : selectedPIDetails.paymentStatus === 'Partially Paid' ? 'badge-info' : 'badge-warning'}`}>
                    {selectedPIDetails.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Quotation Ref</div>
                <div className="detail-value">
                  {selectedPIDetails.quotation?.quotationNumber || selectedPIDetails.quotationNumber || '—'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Payment Terms</div>
                <div className="detail-value">{selectedPIDetails.paymentTerms || 'Advance with PO'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Delivery Schedule</div>
                <div className="detail-value">{selectedPIDetails.deliveryTerms || 'Standard dispatch schedule'}</div>
              </div>
              {selectedPIDetails.customer?.billingAddress && (
                <div className="detail-item col-span-2">
                  <div className="detail-label">Billing / Plant Address</div>
                  <div className="detail-value" style={{ fontSize: '0.82rem' }}>
                    {selectedPIDetails.customer.billingAddress}
                  </div>
                </div>
              )}
            </div>

            {/* Product Items Table */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Itemized Product & Commercial Schedule:
              </div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Product / Model</th>
                      <th>Quantity</th>
                      <th>Unit Rate</th>
                      <th>GST</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPIDetails.items || selectedPIDetails.quotation?.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{it.productName || it.product?.productName || it.description || 'Cryogenic Unit'}</strong>
                          {it.description && it.description !== it.productName && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{it.description}</div>
                          )}
                        </td>
                        <td>{it.quantity} {it.unit || 'Nos'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td>{it.gstPercent || 18}%</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                          ₹{(it.amount || ((it.quantity || 1) * (it.unitPrice || 0))).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Settlement Card */}
            <div style={{
              marginTop: 18,
              padding: '14px 18px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Grand Total
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹{(selectedPIDetails.grandTotal || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Advance Required ({selectedPIDetails.advancePercentage || 50}%)
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--font-mono)' }}>
                  ₹{(selectedPIDetails.advanceAmount || Math.round((selectedPIDetails.grandTotal || 0) * 0.5)).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Received
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16A36A', fontFamily: 'var(--font-mono)' }}>
                  ₹{(selectedPIDetails.totalReceived || selectedPIDetails.advanceReceived || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Remaining Balance
                </div>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: (selectedPIDetails.balanceAmount || 0) <= 0 ? '#16A36A' : '#DC2626',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ₹{(selectedPIDetails.balanceAmount !== undefined ? selectedPIDetails.balanceAmount : Math.max(0, (selectedPIDetails.grandTotal || 0) - (selectedPIDetails.totalReceived || 0))).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Bank Particulars if present */}
            {selectedPIDetails.bankDetails && (
              <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Designated Bank Account:</strong> {selectedPIDetails.bankDetails.bankName || 'State Bank of India'} • A/C: {selectedPIDetails.bankDetails.accountNumber || '39948291039'} • IFSC: {selectedPIDetails.bankDetails.ifscCode || 'SBIN0001824'}
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedPIDetails(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
