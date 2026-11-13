import React, { useState } from 'react';
import { Plus, Eye, RotateCcw, ShieldX } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function SupplierReturnsModule({ supplierReturns, qcTests, onSave, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Eligible QC Tests with rejected stock available for return
  const eligibleQCs = qcTests.filter(q => (q.availableRejectedQuantity || 0) > 0);

  // Form State
  const [formData, setFormData] = useState({
    returnNumber: '',
    qcReference: '',
    supplier: '',
    grn: '',
    material: '',
    rejectedQuantityAvailable: 0,
    returnQuantity: 0,
    returnDate: new Date().toISOString().split('T')[0],
    reason: 'Failed QC Specifications',
    debitNoteNumber: '',
    vehicleNumber: '',
    remarks: 'Dispatched back to vendor with debit note memo.'
  });

  const handleOpenAdd = () => {
    const targetQC = eligibleQCs[0];
    const availRej = targetQC?.availableRejectedQuantity || 0;

    setFormData({
      returnNumber: '',
      qcReference: targetQC?._id || '',
      supplier: targetQC?.supplier?._id || targetQC?.supplier || '',
      grn: targetQC?.grn?._id || targetQC?.grn || '',
      material: targetQC?.material?._id || targetQC?.material || '',
      rejectedQuantityAvailable: availRej,
      returnQuantity: availRej,
      returnDate: new Date().toISOString().split('T')[0],
      reason: 'Failed QC Specifications',
      debitNoteNumber: `DN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehicleNumber: '',
      remarks: 'Material dispatched on outbound truck against vendor debit note.'
    });
    setIsAddOpen(true);
  };

  const handleQCChange = (qcId) => {
    const targetQC = qcTests.find(q => q._id === qcId);
    if (!targetQC) return;

    const availRej = targetQC.availableRejectedQuantity || 0;
    setFormData({
      ...formData,
      qcReference: qcId,
      supplier: targetQC.supplier?._id || targetQC.supplier,
      grn: targetQC.grn?._id || targetQC.grn,
      material: targetQC.material?._id || targetQC.material,
      rejectedQuantityAvailable: availRej,
      returnQuantity: availRej
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.qcReference) {
        showToast('Please select a QC Test reference with rejected stock', 'error');
        return;
      }
      if (Number(formData.returnQuantity) > formData.rejectedQuantityAvailable) {
        showToast(`Return quantity cannot exceed available rejected stock (${formData.rejectedQuantityAvailable})`, 'error');
        return;
      }
      await onSave(formData);
      showToast('Supplier return gate pass & debit note generated successfully', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Return Slip No',
      accessor: 'returnNumber',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReturn(row);
          }}
        >
          {row.returnNumber}
        </span>
      )
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.supplier?.supplierName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.supplier?.supplierCode}</div>
        </div>
      )
    },
    {
      header: 'QC Ref',
      accessor: 'qcReference',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>
          {row.qcReference?.qcNumber || '—'}
        </span>
      )
    },
    {
      header: 'Material',
      accessor: 'material',
      render: (row) => row.material?.materialName || '—'
    },
    {
      header: 'Returned Qty',
      accessor: 'returnQuantity',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#F87171', fontFamily: 'var(--font-mono)' }}>
          {row.returnQuantity} {row.material?.unit || ''}
        </span>
      )
    },
    {
      header: 'Debit Note',
      accessor: 'debitNoteNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>{row.debitNoteNumber}</span>
    },
    {
      header: 'Return Date',
      accessor: 'returnDate',
      render: (row) => new Date(row.returnDate).toLocaleDateString('en-GB')
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
          <button className="icon-btn" title="View Gate Pass" onClick={() => setSelectedReturn(row)}>
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
        <KpiCard title="Total Vendor Returns" value={supplierReturns.length} subtext="Dispatched Gate Passes" icon={RotateCcw} color="#3B82F6" />
        <KpiCard title="Pending Return Queue" value={eligibleQCs.length} subtext="Rejected Batches in Quarantine" icon={ShieldX} color="#EF4444" />
        <KpiCard title="Debit Notes Active" value={supplierReturns.length} subtext="Pending Supplier Credit" icon={RotateCcw} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={supplierReturns}
        searchPlaceholder="Search return voucher, supplier, debit note..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Supplier Return
          </button>
        }
      />

      {/* Create Supplier Return Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Create Supplier Return & Outward Gate Pass"
        subtitle="Return QC-rejected materials back to the vendor with formal debit note accounting"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Return Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. RT-2026-002)"
                value={formData.returnNumber}
                onChange={(e) => setFormData({ ...formData, returnNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">QC Inspection Ref <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.qcReference}
                onChange={(e) => handleQCChange(e.target.value)}
              >
                <option value="">Select QC Test with Rejected Stock</option>
                {qcTests.filter(q => q.rejectedQuantity > 0).map(q => (
                  <option key={q._id} value={q._id}>
                    {q.qcNumber} — {q.material?.materialName} ({q.availableRejectedQuantity || 0} {q.material?.unit} avail to return)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Available Rejected Stock in QC</label>
              <input
                type="text"
                readOnly
                className="form-input"
                value={`${formData.rejectedQuantityAvailable} Units`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return Quantity to Dispatch <span className="req">*</span></label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                className="form-input"
                style={{ borderColor: '#EF4444', color: '#F87171', fontWeight: 700 }}
                value={formData.returnQuantity}
                onChange={(e) => setFormData({ ...formData, returnQuantity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Rejection Reason <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="Failed QC Specifications">Failed QC Specifications</option>
                <option value="Damaged in Transit">Damaged in Transit</option>
                <option value="Incorrect Dimension / Grade">Incorrect Dimension / Grade</option>
                <option value="Expired / Degraded">Expired / Degraded</option>
                <option value="Excess Dispatch">Excess Dispatch</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Debit Note Reference Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. DN-2026-015"
                value={formData.debitNoteNumber}
                onChange={(e) => setFormData({ ...formData, debitNoteNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Transport Vehicle / Driver Details</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. TN-05-BQ-7890 (Return load)"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Dispatch Remarks / Supplier Communication</label>
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
              Generate Return Gate Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* View Return Details Modal */}
      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title={`Supplier Return Gate Pass: ${selectedReturn?.returnNumber}`}
        subtitle={`Dispatched to ${selectedReturn?.supplier?.supplierName}`}
      >
        {selectedReturn && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Return Voucher No</div>
              <div className="detail-value">{selectedReturn.returnNumber}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={selectedReturn.status} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Supplier</div>
              <div className="detail-value">{selectedReturn.supplier?.supplierName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">QC Reference</div>
              <div className="detail-value">{selectedReturn.qcReference?.qcNumber}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Material Returned</div>
              <div className="detail-value">{selectedReturn.material?.materialName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Returned Quantity</div>
              <div className="detail-value" style={{ color: '#F87171', fontWeight: 800 }}>
                {selectedReturn.returnQuantity} {selectedReturn.material?.unit}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Debit Note No</div>
              <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>
                {selectedReturn.debitNoteNumber}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Dispatch Date</div>
              <div className="detail-value">{new Date(selectedReturn.returnDate).toLocaleDateString('en-GB')}</div>
            </div>
            <div className="detail-item col-span-2">
              <div className="detail-label">Rejection Reason & Remarks</div>
              <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                {selectedReturn.reason} — {selectedReturn.remarks}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

