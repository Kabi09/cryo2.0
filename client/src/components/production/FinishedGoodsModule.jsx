import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { PackageCheck, ShieldCheck, Warehouse, Truck, CheckCircle2 } from 'lucide-react';

export default function FinishedGoodsModule({
  finishedGoods = [],
  workOrders = [],
  qaTests = [],
  onSave,
  onUpdateStatus,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: 'WO-001',
    salesOrder: '',
    salesOrderNumber: 'SO-001',
    product: '',
    productName: 'Machine A',
    serialNumber: 'MA-001 to MA-010',
    qaApprovalReference: '',
    qaNumber: 'QA-001',
    approvedQuantity: 10,
    warehouseLocation: 'FG Warehouse - Bay 4A',
    storageDate: new Date().toISOString().split('T')[0],
    productCondition: 'Brand New / QA Passed',
    stockStatus: 'Available',
    warrantyStartDate: new Date().toISOString().split('T')[0],
    remarks: 'Ready for client dispatch or sales order fulfillment.'
  });

  const handleOpenModal = () => {
    if (qaTests.length > 0 && !formData.qaApprovalReference) {
      handleSelectQA(qaTests[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectQA = (qaId) => {
    const qa = qaTests.find(q => q._id === qaId);
    if (!qa) return;

    setFormData(prev => ({
      ...prev,
      qaApprovalReference: qa._id,
      qaNumber: qa.qaNumber,
      workOrder: qa.workOrder?._id || qa.workOrder,
      workOrderNumber: qa.workOrderNumber,
      product: qa.product?._id || qa.product,
      productName: qa.productName,
      approvedQuantity: qa.passedQuantity || 1,
      serialNumber: qa.batchSerialNumber || 'MA-SERIES-01'
    }));
  };

  const handleStatusChange = async (id, status) => {
    try {
      await onUpdateStatus(id, status);
      showToast(`Finished Goods status changed to "${status}"`, 'info');
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName) {
      showToast('Please select a passing QA test record', 'error');
      return;
    }
    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Product received into Finished Goods warehouse!', 'success');
    } catch (err) {
      showToast(err.message || 'Error receiving finished goods', 'error');
    }
  };

  const columns = [
    {
      header: 'FG No',
      accessor: 'fgNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.fgNumber}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Serial / Batch',
      accessor: 'serialNumber',
      render: (row) => <span className="font-mono" style={{ color: '#A5B4FC' }}>{row.serialNumber}</span>
    },
    {
      header: 'Quantity',
      accessor: 'approvedQuantity',
      render: (row) => `${row.approvedQuantity || 1} Units`
    },
    {
      header: 'QA Approval',
      accessor: 'qaNumber',
      render: (row) => (
        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
          <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
          {row.qaNumber || 'QA Passed'}
        </span>
      )
    },
    {
      header: 'Warehouse Bay',
      accessor: 'warehouseLocation',
      render: (row) => row.warehouseLocation
    },
    {
      header: 'Storage Date',
      accessor: 'storageDate',
      render: (row) => (row.storageDate ? new Date(row.storageDate).toLocaleDateString() : '-')
    },
    {
      header: 'Stock Status',
      accessor: 'stockStatus',
      render: (row) => <StatusBadge status={row.stockStatus || 'Available'} />
    },
    {
      header: 'Dispatch Action',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.stockStatus === 'Available' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(row._id, 'Reserved for Dispatch')}
            >
              Reserve
            </button>
          )}
          {row.stockStatus === 'Reserved for Dispatch' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange(row._id, 'Dispatched')}
            >
              <Truck size={13} /> Dispatch
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* Finished Goods Integrity Rule */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(16, 185, 129, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PackageCheck size={20} style={{ color: 'var(--success)' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>QA-Guaranteed Finished Goods:</strong> Only fully tested, QA-approved machines are admitted to this inventory. Stored units are serialized and directly available for Sales Order delivery and customer dispatch.
          </div>
        </div>
      </div>

      <DataTable
        title="Finished Goods (FG) Warehouse"
        subtitle="Final serialized stock of QA-approved products ready for customer packaging and delivery"
        columns={columns}
        data={finishedGoods}
        onAdd={handleOpenModal}
        addLabel="Receive QA-Approved Goods"
      />

      {isModalOpen && (
        <Modal
          title="Receive Finished Goods into Warehouse"
          subtitle="Record storage bay, serialization, warranty start, and dispatch readiness for QA-cleared machines"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* QA Approval & Product Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageCheck size={16} /> 1. QA Approval & Product Identification
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Select QA Test Approval <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.qaApprovalReference}
                      onChange={(e) => handleSelectQA(e.target.value)}
                      required
                    >
                      <option value="">Select Passing QA Test</option>
                      {qaTests.map(q => (
                        <option key={q._id} value={q._id}>
                          {q.qaNumber} — {q.productName} ({q.passedQuantity} Units Passed) — [{q.overallResult}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      placeholder="Auto-derived from QA"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial / Batch Number <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g. MA-001 to MA-010"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approved Quantity Received <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.approvedQuantity}
                      onChange={(e) => setFormData({ ...formData, approvedQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Condition <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productCondition}
                      onChange={(e) => setFormData({ ...formData, productCondition: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Warehouse Storage & Warranty */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Warehouse size={16} /> 2. Warehouse Bay & Warranty Metadata
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Warehouse Storage Location <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.warehouseLocation}
                      onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Storage Receipt Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.storageDate}
                      onChange={(e) => setFormData({ ...formData, storageDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Warranty Inception Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.warrantyStartDate}
                      onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Storage & Packaging Remarks</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Crated with shrink wrap, silica gel packets inserted, user manual and accessories enclosed..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <PackageCheck size={14} /> Receive Finished Goods into Warehouse
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

