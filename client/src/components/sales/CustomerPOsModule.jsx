import React, { useState } from 'react';
import { Plus, Eye, FileCheck, CheckCircle2, XCircle, FileText, UploadCloud } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function CustomerPOsModule({ customerPOs, customers, proformaInvoices, quotations, onSave, onVerify, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    internalPOId: '',
    customerPONumber: '',
    customer: '',
    piReference: '',
    quotationReference: '',
    customerPODate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
    poAmount: 0,
    deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '50% Advance with PO, 50% Before Dispatch',
    poDocument: 'Customer_Signed_PO.pdf',
    remarks: 'Verified commercial terms against Quotation. Payment schedule verified.',
    status: 'Received'
  });

  const handleOpenAdd = () => {
    const defaultCust = customers[0]?._id || '';
    const custPI = proformaInvoices.find(p => (p.customer?._id || p.customer) === defaultCust);
    const amount = custPI ? custPI.grandTotal : 200000;

    setFormData({
      internalPOId: '',
      customerPONumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customer: defaultCust,
      piReference: custPI?._id || '',
      quotationReference: custPI?.quotation?._id || '',
      customerPODate: new Date().toISOString().split('T')[0],
      receivedDate: new Date().toISOString().split('T')[0],
      poAmount: amount,
      deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: '50% Advance with PO, 50% Before Dispatch',
      poDocument: 'Customer_Signed_PO.pdf',
      remarks: 'Customer sent official stamped and signed purchase order copy.',
      status: 'Received'
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
        quotationReference: pi.quotation?._id || pi.quotation || '',
        poAmount: pi.grandTotal
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customerPONumber) {
        showToast('Please enter the Customer Purchase Order Number', 'error');
        return;
      }
      await onSave(formData);
      showToast('Customer PO recorded into commercial inbox!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleVerify = async (poId, status) => {
    try {
      await onVerify(poId, { status, verifiedBy: 'Commercial Head' });
      showToast(`Customer PO marked as ${status}! Ready for Sales Order confirmation.`, 'success');
      if (selectedPO) {
        setSelectedPO({ ...selectedPO, status });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Internal PO ID',
      accessor: 'internalPOId',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedPO(row)}>
          {row.internalPOId}
        </span>
      )
    },
    {
      header: 'Customer PO No',
      accessor: 'customerPONumber',
      render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.customerPONumber}</strong>
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customer?.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'PI Ref',
      render: (row) => row.piReference?.piNumber || '—'
    },
    {
      header: 'PO Date',
      accessor: 'customerPODate',
      render: (row) => new Date(row.customerPODate).toLocaleDateString('en-GB')
    },
    {
      header: 'PO Amount',
      accessor: 'poAmount',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34D399' }}>
          ₹{row.poAmount?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Verification Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View & Audit PO" onClick={() => setSelectedPO(row)}>
            <Eye size={15} />
          </button>
          {row.status === 'Received' && (
            <button
              className="icon-btn"
              title="Verify & Approve"
              style={{ color: '#10B981' }}
              onClick={() => handleVerify(row._id, 'Verified')}
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
        <KpiCard title="Total Customer POs" value={customerPOs.length} subtext="Client Orders Inward" icon={FileCheck} color="#6366F1" />
        <KpiCard title="Verified & Cleared" value={customerPOs.filter(p => p.status === 'Verified').length} subtext="Ready for Production" icon={CheckCircle2} color="#10B981" />
        <KpiCard title="Awaiting Verification" value={customerPOs.filter(p => p.status === 'Received').length} subtext="Commercial Audit" icon={FileText} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={customerPOs}
        searchPlaceholder="Search customer PO number, company..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Record Customer PO
          </button>
        }
      />

      {/* Add Customer PO Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Record Customer Purchase Order (PO)"
        subtitle="Verify client-issued purchase orders against commercial quotations and Proforma Invoices"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Internal PO Tracking ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. CPO-002)"
                value={formData.internalPOId}
                onChange={(e) => setFormData({ ...formData, internalPOId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Client PO Number <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. ABC/PO/101"
                value={formData.customerPONumber}
                onChange={(e) => setFormData({ ...formData, customerPONumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proforma Invoice Reference <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.piReference}
                onChange={(e) => handlePIChange(e.target.value)}
              >
                <option value="">Select Related PI</option>
                {proformaInvoices.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.piNumber} — {p.customer?.companyName} (₹{p.grandTotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Purchase Order Value (₹) <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={formData.poAmount}
                onChange={(e) => setFormData({ ...formData, poAmount: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer PO Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.customerPODate}
                onChange={(e) => setFormData({ ...formData, customerPODate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contracted Delivery Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Payment Terms</label>
              <input
                type="text"
                className="form-input"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </div>

            {/* Document upload simulation */}
            <div className="form-group col-span-2">
              <label className="form-label">Signed PO Document Attachment</label>
              <div style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <UploadCloud size={24} color="#818CF8" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.82rem', color: '#C7D2FE' }}>
                  {formData.poDocument} (Verified PDF Copy Attached)
                </div>
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Verification Notes</label>
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
              Save Customer PO
            </button>
          </div>
        </form>
      </Modal>

      {/* View & Audit Modal */}
      <Modal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        size="lg"
        title={`Customer PO: ${selectedPO?.customerPONumber}`}
        subtitle={`Internal Tracking ID: ${selectedPO?.internalPOId}`}
      >
        {selectedPO && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Client PO Number</div>
                <div className="detail-value">{selectedPO.customerPONumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Audit Status</div>
                <div className="detail-value"><StatusBadge status={selectedPO.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Client Company</div>
                <div className="detail-value">{selectedPO.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">PO Value</div>
                <div className="detail-value" style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedPO.poAmount?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Delivery Commitment</div>
                <div className="detail-value">{new Date(selectedPO.deliveryDate).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Commercial PI Reference</div>
                <div className="detail-value">{selectedPO.piReference?.piNumber || 'Direct PO'}</div>
              </div>
            </div>

            {selectedPO.status === 'Received' && (
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleVerify(selectedPO._id, 'Rejected')}
                >
                  <XCircle size={15} color="#EF4444" /> Reject PO Terms
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleVerify(selectedPO._id, 'Verified')}
                >
                  <CheckCircle2 size={15} /> Verify & Confirm Commercial Clearance
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

