import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import { PackageCheck, ShieldCheck, Warehouse, Truck, CheckCircle2, Eye, ArrowRight, Layers } from 'lucide-react';

export default function FinishedGoodsModule({
  finishedGoods = [],
  workOrders = [],
  qaTests = [],
  preSelectedQA = null,
  onClearPreSelectedQA,
  onSave,
  onUpdateStatus,
  onHandoverToLogistics,
  onNavigateModule,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Available' | 'Reserved' | 'Dispatched'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFG, setSelectedFG] = useState(null);

  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: 'WO-001',
    salesOrder: '',
    salesOrderNumber: 'SO-001',
    product: '',
    productName: 'Cryo Equipment',
    serialNumber: 'CRYO-FG-001',
    qaApprovalReference: '',
    qaNumber: 'QA-001',
    approvedQuantity: 1,
    warehouseLocation: 'FG Warehouse - Bay 4A',
    storageDate: new Date().toISOString().split('T')[0],
    productCondition: 'Brand New / QA Passed',
    stockStatus: 'Available',
    warrantyStartDate: new Date().toISOString().split('T')[0],
    remarks: 'Ready for client dispatch or sales order fulfillment.'
  });

  useEffect(() => {
    if (preSelectedQA) {
      handleSelectQA(preSelectedQA._id);
      setIsModalOpen(true);
      onClearPreSelectedQA?.();
    }
  }, [preSelectedQA]);

  const handleOpenModal = () => {
    if (qaTests.length > 0 && !formData.qaApprovalReference) {
      handleSelectQA(qaTests[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectQA = (qaId) => {
    const qa = qaTests.find(q => q._id === qaId);
    if (!qa) return;

    // Look for matching WO to get linked SO
    const wo = workOrders.find(w => String(w._id) === String(qa.workOrder?._id || qa.workOrder));

    setFormData(prev => ({
      ...prev,
      qaApprovalReference: qa._id,
      qaNumber: qa.qaNumber,
      workOrder: qa.workOrder?._id || qa.workOrder,
      workOrderNumber: qa.workOrderNumber,
      salesOrder: wo?.salesOrder?._id || wo?.salesOrder || '',
      salesOrderNumber: wo?.salesOrderNumber || wo?.salesOrder?.soNumber || '',
      product: qa.product?._id || qa.product,
      productName: qa.productName,
      approvedQuantity: qa.passedQuantity || 1,
      serialNumber: qa.batchSerialNumber || `CRYO-SN-${Date.now().toString().slice(-4)}`
    }));
  };

  const handleStatusChange = async (id, status) => {
    try {
      await onUpdateStatus(id, status);
      showToast(`Finished Goods status changed to "${status}"`, 'info');
      if (selectedFG && selectedFG._id === id) {
        setSelectedFG(prev => ({ ...prev, stockStatus: status }));
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName) {
      showToast('Please select an approved QA Test', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('Product received into Finished Goods warehouse storage!', 'success');
    } catch (err) {
      showToast(err.message || 'Error receiving finished goods', 'error');
    }
  };

  // Filter based on active sub-tab
  const filteredData = useMemo(() => {
    if (activeTab === 'Available') {
      return finishedGoods.filter(fg => fg.stockStatus === 'Available');
    }
    if (activeTab === 'Reserved') {
      return finishedGoods.filter(fg => fg.stockStatus === 'Reserved for Dispatch' || fg.stockStatus === 'Reserved');
    }
    if (activeTab === 'Dispatched') {
      return finishedGoods.filter(fg => fg.stockStatus === 'Dispatched');
    }
    return finishedGoods;
  }, [finishedGoods, activeTab]);

  const columns = [
    {
      header: 'FG No',
      accessor: 'fgNumber',
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => setSelectedFG(row)}
        >
          {row.fgNumber}
        </span>
      )
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.productName}</strong>
          {row.salesOrderNumber && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              SO: {row.salesOrderNumber}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Serial / Batch',
      accessor: 'serialNumber',
      render: (row) => <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{row.serialNumber}</span>
    },
    {
      header: 'Quantity',
      accessor: 'approvedQuantity',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.approvedQuantity || 1} Units
        </span>
      )
    },
    {
      header: 'QA Approval',
      accessor: 'qaNumber',
      render: (row) => (
        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={13} /> {row.qaNumber || 'QA Passed'}
        </span>
      )
    },
    {
      header: 'Warehouse Bay',
      accessor: 'warehouseLocation',
      render: (row) => row.warehouseLocation || 'Bay 4A'
    },
    {
      header: 'Stock Status',
      accessor: 'stockStatus',
      render: (row) => <StatusBadge status={row.stockStatus || 'Available'} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const isAvailable = row.stockStatus === 'Available';
        const isReserved = row.stockStatus === 'Reserved for Dispatch' || row.stockStatus === 'Reserved';
        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn"
              title="View Finished Goods Record"
              onClick={() => setSelectedFG(row)}
            >
              <Eye size={15} />
            </button>
            {isAvailable && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26 }}
                title="Reserve for Sales Order Dispatch"
                onClick={() => handleStatusChange(row._id, 'Reserved for Dispatch')}
              >
                Reserve
              </button>
            )}
            {isReserved && onHandoverToLogistics && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                title="Handover to Logistics for Dispatch"
                onClick={() => onHandoverToLogistics(row)}
              >
                <Truck size={12} /> Logistics ➔
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-finished-goods"
        onNavigate={onNavigateModule}
        counts={{ finishedGoods: finishedGoods.length }}
      />

      {/* Sub-Tabs: All | Available | Reserved | Dispatched */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Goods ({finishedGoods.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'Available' ? 'active' : ''}`}
            onClick={() => setActiveTab('Available')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6, color: '#16A36A' }} />
            Available ({finishedGoods.filter(f => f.stockStatus === 'Available').length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'Reserved' ? 'active' : ''}`}
            onClick={() => setActiveTab('Reserved')}
          >
            <Warehouse size={14} style={{ marginRight: 6, color: '#3B82F6' }} />
            Reserved ({finishedGoods.filter(f => f.stockStatus === 'Reserved for Dispatch' || f.stockStatus === 'Reserved').length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'Dispatched' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dispatched')}
          >
            <Truck size={14} style={{ marginRight: 6, color: '#6B7280' }} />
            Dispatched ({finishedGoods.filter(f => f.stockStatus === 'Dispatched').length})
          </button>
        </div>
      </div>

      {/* Finished Goods Integrity Rule */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(16, 185, 129, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PackageCheck size={20} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>QA-Certified Stock Gate:</strong> Only units with passed Quality Assurance inspections may enter Finished Goods warehouse storage. From here, units can be reserved and handed over to Logistics for dispatch.
          </span>
        </div>
      </div>

      <DataTable
        title="Finished Goods Inventory"
        subtitle="Manage certified completed machinery in the warehouse ready for client dispatch"
        columns={columns}
        data={filteredData}
        onAdd={handleOpenModal}
        addLabel="Receive QA Passed Goods"
      />

      {/* Modal: Receive Goods */}
      {isModalOpen && (
        <Modal
          title="Receive QA Passed Product into Finished Goods"
          subtitle="Generate inventory receipt into warehouse bays for certified manufacturing units"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Linked Quality Approval (QA Test) <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={formData.qaApprovalReference}
                  onChange={(e) => handleSelectQA(e.target.value)}
                  required
                >
                  <option value="">Select QA Passed Inspection Certificate</option>
                  {qaTests.map(q => (
                    <option key={q._id} value={q._id}>
                      {q.qaNumber} — {q.productName} ({q.passedQuantity} Passed) • [WO: {q.workOrderNumber}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Order Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.workOrderNumber}
                  readOnly
                  style={{ background: 'var(--bg-surface)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sales Order Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.salesOrderNumber || 'Direct Order'}
                  readOnly
                  style={{ background: 'var(--bg-surface)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.productName}
                  readOnly
                  style={{ background: 'var(--bg-surface)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial / Batch Numbers <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g. CRYO-MA-001 to 010"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Approved Quantity <span className="req">*</span></label>
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
                <label className="form-label">Warehouse Storage Bay <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  placeholder="e.g. Bay 4A - Heavy Machinery"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.storageDate}
                  onChange={(e) => setFormData({ ...formData, storageDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock Status</label>
                <select
                  className="form-select"
                  value={formData.stockStatus}
                  onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                >
                  <option value="Available">Available for Demand</option>
                  <option value="Reserved for Dispatch">Reserved for Dispatch</option>
                </select>
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Warehouse Receipts & Condition Remarks</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Sealed packaging, palletized, ready for freight pickup..."
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Store in Warehouse Bay
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Finished Goods Details */}
      {selectedFG && (
        <Modal
          title={`Finished Good: ${selectedFG.fgNumber}`}
          subtitle={`Warehouse record for ${selectedFG.productName}`}
          isOpen={!!selectedFG}
          onClose={() => setSelectedFG(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">FG Reference No</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedFG.fgNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Stock Status</div>
                <div className="detail-value"><StatusBadge status={selectedFG.stockStatus || 'Available'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Product / Model</div>
                <div className="detail-value">{selectedFG.productName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Quantity</div>
                <div className="detail-value" style={{ fontWeight: 700 }}>{selectedFG.approvedQuantity || 1} Units</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Serial / Batch Numbers</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedFG.serialNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Work Order Ref</div>
                <div className="detail-value">{selectedFG.workOrderNumber || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Linked Sales Order</div>
                <div className="detail-value">{selectedFG.salesOrderNumber || 'Direct Stock'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">QA Certificate Ref</div>
                <div className="detail-value" style={{ color: 'var(--success)', fontWeight: 600 }}>{selectedFG.qaNumber || 'QA Passed'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Warehouse Bay</div>
                <div className="detail-value">{selectedFG.warehouseLocation || 'Bay 4A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Date Received</div>
                <div className="detail-value">{selectedFG.storageDate ? new Date(selectedFG.storageDate).toLocaleDateString('en-GB') : '-'}</div>
              </div>
              {selectedFG.remarks && (
                <div className="detail-item col-span-2">
                  <div className="detail-label">Handling Remarks</div>
                  <div className="detail-value" style={{ fontSize: '0.82rem' }}>{selectedFG.remarks}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedFG.stockStatus === 'Available' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusChange(selectedFG._id, 'Reserved for Dispatch')}
                  >
                    Reserve for Dispatch
                  </button>
                )}
                {(selectedFG.stockStatus === 'Reserved for Dispatch' || selectedFG.stockStatus === 'Reserved') && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusChange(selectedFG._id, 'Available')}
                  >
                    Unreserve (Make Available)
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedFG(null)}
                >
                  Close
                </button>
                {(selectedFG.stockStatus === 'Reserved for Dispatch' || selectedFG.stockStatus === 'Reserved') && onHandoverToLogistics && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const fg = selectedFG;
                      setSelectedFG(null);
                      onHandoverToLogistics(fg);
                    }}
                  >
                    <Truck size={14} /> Handover to Logistics ➔
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
