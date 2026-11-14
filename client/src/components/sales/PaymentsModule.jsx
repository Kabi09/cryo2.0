import React, { useState } from 'react';
import { Plus, Eye, CreditCard, CheckCircle2, DollarSign, FileCheck } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function PaymentsModule({ payments, customers, proformaInvoices, onSave, onVerify, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    paymentNumber: '',
    customer: '',
    piReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Advance',
    amountReceived: 50000,
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    paymentProof: 'NEFT_Payment_Slip.pdf',
    remarks: 'Advance remittance received into HDFC bank account.'
  });

  const handleOpenAdd = () => {
    const defaultCust = customers[0]?._id || '';
    const custPI = proformaInvoices.find(p => (p.customer?._id || p.customer) === defaultCust);

    setFormData({
      paymentNumber: '',
      customer: defaultCust,
      piReference: custPI?._id || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'Advance',
      amountReceived: custPI?.advanceAmount || 50000,
      paymentMethod: 'Bank Transfer',
      transactionReference: `UTR-${Math.floor(100000000 + Math.random() * 900000000)}`,
      paymentProof: 'NEFT_Payment_Slip.pdf',
      remarks: 'Advance remittance received into company bank account.'
    });
    setIsAddOpen(true);
  };

  const handlePIChange = (piId) => {
    const pi = proformaInvoices.find(p => p._id === piId);
    if (pi) {
      setFormData({
        ...formData,
        piReference: piId,
        customer: pi.customer?._id || pi.customer,
        amountReceived: pi.balanceAmount > 0 ? pi.balanceAmount : pi.advanceAmount
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.piReference) {
        showToast('Please select a Proforma Invoice reference', 'error');
        return;
      }
      if (!formData.transactionReference) {
        showToast('Please provide a Bank / UTR transaction reference', 'error');
        return;
      }

      await onSave(formData);
      showToast('Payment recorded successfully! PI balance automatically adjusted.', 'success');
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

  const totalCollected = payments.reduce((acc, p) => acc + (p.amountReceived || 0), 0);

  const columns = [
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
        <span className="code-badge">
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
      header: 'Method',
      accessor: 'paymentMethod',
      render: (row) => (
        <div>
          <div>{row.paymentMethod}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {row.transactionReference}
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

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Cash Inward" value={`₹${totalCollected.toLocaleString('en-IN')}`} subtext="Verified Receipts" icon={DollarSign} color="#10B981" />
        <KpiCard title="Verified Remittances" value={payments.filter(p => p.status === 'Verified').length} subtext="Account Reconciled" icon={CheckCircle2} color="#6366F1" />
        <KpiCard title="Pending Audit" value={payments.filter(p => p.status === 'Received').length} subtext="Awaiting Bank Clearance" icon={CreditCard} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={payments.slice().sort((a, b) => new Date(b.createdAt || b.paymentDate || 0) - new Date(a.createdAt || a.paymentDate || 0))}
        searchPlaceholder="Search payment no, customer, UTR ref..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Record Inward Payment
          </button>
        }
      />

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Record Customer Payment Receipt"
        subtitle="Post customer bank transfers, advance payments, and reconcile Proforma Invoice balances"
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
                {proformaInvoices.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.piNumber} — {p.customer?.companyName} (Balance: ₹{p.balanceAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
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
                <option value="Partial">Partial / Milestone Payment</option>
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
                style={{ color: '#34D399', fontWeight: 700 }}
                value={formData.amountReceived}
                onChange={(e) => setFormData({ ...formData, amountReceived: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                <option value="UPI">UPI Remittance</option>
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
                placeholder="e.g. UTR-HDFC-99182301"
                value={formData.transactionReference}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                rows="2"
                className="form-textarea"
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
              Post Payment Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* View Payment Details Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={`Payment Voucher: ${selectedPayment?.paymentNumber}`}
        subtitle={`From ${selectedPayment?.customer?.companyName}`}
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
                <div className="detail-value">{selectedPayment.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Amount Cleared</div>
                <div className="detail-value" style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedPayment.amountReceived?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Transaction Ref</div>
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
                <div className="detail-value" style={{ fontSize: '0.85rem' }}>
                  PI Ref: <strong>{selectedPayment.piReference?.piNumber}</strong> • Total Value: ₹{selectedPayment.piReference?.grandTotal?.toLocaleString('en-IN')} • Current Remaining Balance: ₹{selectedPayment.piReference?.balanceAmount?.toLocaleString('en-IN')}
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
    </div>
  );
}

