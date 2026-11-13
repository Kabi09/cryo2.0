import React, { useState } from 'react';
import { Plus, Eye, Truck, ShieldAlert } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function GRNModule({ grns, purchaseOrders, onSave, showToast, onNavigateToQC }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    grnNumber: '',
    purchaseOrder: '',
    supplier: '',
    receivedDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryChallanNo: '',
    vehicleNumber: '',
    receivedBy: 'Store Officer',
    remarks: '',
    items: []
  });

  const handleOpenAdd = () => {
    // Find eligible POs that can be inwarded (Approved or Partially Received)
    const eligiblePOs = purchaseOrders.filter(p => p.status === 'Approved' || p.status === 'Partially Received');
    const defaultPO = eligiblePOs[0] || purchaseOrders[0];

    const initialItems = defaultPO ? defaultPO.items.map(item => ({
      material: item.material?._id || item.material,
      materialName: item.material?.materialName || 'Material',
      orderedQty: item.quantity,
      previouslyReceivedQty: item.receivedQuantity || 0,
      currentReceivedQty: Math.max(0, item.quantity - (item.receivedQuantity || 0)),
      balanceQty: 0,
      unit: item.unit,
      batchNumber: `BAT-${Date.now().toString().slice(-6)}`,
      expiryDate: ''
    })) : [];

    setFormData({
      grnNumber: '',
      purchaseOrder: defaultPO?._id || '',
      supplier: defaultPO?.supplier?._id || defaultPO?.supplier || '',
      receivedDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryChallanNo: '',
      vehicleNumber: '',
      receivedBy: 'Store Officer',
      remarks: '',
      items: initialItems
    });
    setIsAddOpen(true);
  };

  const handlePOChange = (poId) => {
    const po = purchaseOrders.find(p => p._id === poId);
    if (!po) return;

    const items = po.items.map(item => ({
      material: item.material?._id || item.material,
      materialName: item.material?.materialName || 'Material',
      orderedQty: item.quantity,
      previouslyReceivedQty: item.receivedQuantity || 0,
      currentReceivedQty: Math.max(0, item.quantity - (item.receivedQuantity || 0)),
      balanceQty: 0,
      unit: item.unit,
      batchNumber: `BAT-${Date.now().toString().slice(-6)}`,
      expiryDate: ''
    }));

    setFormData({
      ...formData,
      purchaseOrder: poId,
      supplier: po.supplier?._id || po.supplier,
      items
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    item[field] = value;

    if (field === 'currentReceivedQty') {
      const current = Number(value) || 0;
      const pending = item.orderedQty - item.previouslyReceivedQty;
      item.balanceQty = Math.max(0, pending - current);
    }

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.purchaseOrder) {
        showToast('Please select a Purchase Order', 'error');
        return;
      }
      await onSave(formData);
      showToast('GRN generated successfully! Material placed in QC Pending status.', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'GRN Number',
      accessor: 'grnNumber',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGRN(row);
          }}
        >
          {row.grnNumber}
        </span>
      )
    },
    {
      header: 'PO Ref',
      accessor: 'purchaseOrder',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>
          {row.purchaseOrder?.poNumber || '—'}
        </span>
      )
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => row.supplier?.supplierName || '—'
    },
    {
      header: 'Received Date',
      accessor: 'receivedDate',
      render: (row) => new Date(row.receivedDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Invoice No',
      accessor: 'invoiceNumber',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.invoiceNumber}</span>
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
          <button className="icon-btn" title="View GRN Inward Slip" onClick={() => setSelectedGRN(row)}>
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  const pendingQCCount = grns.filter(g => g.status === 'QC Pending').length;

  return (
    <div>
      {/* Alert banner highlighting the business rule */}
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <ShieldAlert size={20} color="#F59E0B" />
        <div style={{ fontSize: '0.82rem', color: '#FCD34D' }}>
          <strong>Quarantine Inward Protocol:</strong> Materials received at factory gate via GRN are automatically assigned <strong>QC Pending</strong> quarantine status. They do not enter available inventory until inspected & approved in Module 06 (QC Tests).
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Gate Receipts" value={grns.length} subtext="Goods Inwarded" icon={Truck} color="#3B82F6" />
        <KpiCard title="Awaiting QC Inspection" value={pendingQCCount} subtext="In Quarantine Bay" icon={ShieldAlert} color="#F59E0B" />
        <KpiCard title="Completed Inward" value={grns.filter(g => g.status === 'Completed').length} subtext="Inspected & Processed" icon={Truck} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={grns}
        searchPlaceholder="Search GRN, PO number, or supplier..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create GRN
          </button>
        }
      />

      {/* Create GRN Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Create Goods Receipt Note (GRN)"
        subtitle="Record inward delivery against an approved Purchase Order into quarantine holding"
      >
        <form onSubmit={handleSubmit}>
          {/* Section A: Header */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA', marginBottom: 12 }}>
            Section A: Inward Receipt Particulars
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">GRN Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. GRN-2026-002)"
                value={formData.grnNumber}
                onChange={(e) => setFormData({ ...formData, grnNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Order Ref <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.purchaseOrder}
                onChange={(e) => handlePOChange(e.target.value)}
              >
                <option value="">Select Approved Purchase Order</option>
                {purchaseOrders.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.poNumber} — {p.supplier?.supplierName} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Received Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Invoice No <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. INV-8891"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Challan (DC) No</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. DC-102"
                value={formData.deliveryChallanNo}
                onChange={(e) => setFormData({ ...formData, deliveryChallanNo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Registration No</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. TN-01-AB-1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Received By</label>
              <input
                type="text"
                className="form-input"
                value={formData.receivedBy}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
              />
            </div>
          </div>

          {/* Section B: Materials Received */}
          <div style={{ margin: '20px 0 10px', fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>
            Section B: Received Materials (Pre-populated from PO)
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Material</th>
                  <th style={{ width: '12%' }}>Ordered</th>
                  <th style={{ width: '12%' }}>Prev. Inward</th>
                  <th style={{ width: '16%' }}>Current Received</th>
                  <th style={{ width: '20%' }}>Batch Number</th>
                  <th style={{ width: '12%' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.materialName}</strong></td>
                    <td>{item.orderedQty}</td>
                    <td>{item.previouslyReceivedQty}</td>
                    <td>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.currentReceivedQty}
                        onChange={(e) => handleItemChange(idx, 'currentReceivedQty', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        placeholder="BAT-XXXX"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                      />
                    </td>
                    <td>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section C: Remarks */}
          <div style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Unloading Remarks / Condition</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Condition of package seals, temperature logs, bay assignment..."
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
              Submit GRN for Quality Inspection
            </button>
          </div>
        </form>
      </Modal>

      {/* View GRN Details Modal */}
      <Modal
        isOpen={!!selectedGRN}
        onClose={() => setSelectedGRN(null)}
        size="lg"
        title={`GRN Inward Slip: ${selectedGRN?.grnNumber}`}
        subtitle={`PO Ref: ${selectedGRN?.purchaseOrder?.poNumber}`}
      >
        {selectedGRN && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">GRN Number</div>
                <div className="detail-value">{selectedGRN.grnNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Current Status</div>
                <div className="detail-value"><StatusBadge status={selectedGRN.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Supplier</div>
                <div className="detail-value">{selectedGRN.supplier?.supplierName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gate Received Date</div>
                <div className="detail-value">{new Date(selectedGRN.receivedDate).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Supplier Invoice No</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedGRN.invoiceNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Vehicle Number</div>
                <div className="detail-value">{selectedGRN.vehicleNumber || 'Unspecified'}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Inwarded Materials:</div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Batch Number</th>
                      <th>Ordered</th>
                      <th>Inward Received</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGRN.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.material?.materialName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{it.batchNumber}</td>
                        <td>{it.orderedQty}</td>
                        <td style={{ fontWeight: 700, color: '#FBBF24' }}>{it.currentReceivedQty}</td>
                        <td>{it.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedGRN.status === 'QC Pending' && onNavigateToQC && (
              <div style={{ marginTop: 18, textAlign: 'right' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedGRN(null);
                    onNavigateToQC(selectedGRN);
                  }}
                >
                  Proceed to QC Quality Testing
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

