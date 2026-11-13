import React, { useState } from 'react';
import { Eye, Warehouse, History, SlidersHorizontal, AlertCircle } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';
import { api } from '../../services/api';

export default function InventoryModule({ inventory, onAdjustStock, showToast }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Adjustment Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustData, setAdjustData] = useState({
    adjustedStock: 0,
    reason: '',
    loggedBy: 'Inventory Auditor'
  });

  const handleOpenLedger = async (invItem) => {
    setSelectedItem(invItem);
    setLoadingLedger(true);
    try {
      const res = await api.getMaterialLedger(invItem.material?._id);
      setLedgerHistory(res.ledger || []);
    } catch (err) {
      showToast('Failed to load ledger history', 'error');
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleOpenAdjust = (invItem) => {
    setAdjustTarget(invItem);
    setAdjustData({
      adjustedStock: invItem.availableStock,
      reason: 'Physical Stock Count Reconciliation',
      loggedBy: 'Plant Auditor'
    });
    setIsAdjustOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    try {
      await onAdjustStock({
        materialId: adjustTarget.material?._id,
        adjustedStock: adjustData.adjustedStock,
        reason: adjustData.reason,
        loggedBy: adjustData.loggedBy
      });
      showToast('Stock audit adjustment logged successfully', 'success');
      setIsAdjustOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Material Code',
      accessor: 'materialCode',
      render: (row) => (
        <span 
          className="code-badge"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenLedger(row);
          }}
        >
          {row.material?.materialCode || '—'}
        </span>
      )
    },
    {
      header: 'Material Name',
      accessor: 'materialName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.material?.materialName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.material?.category}</div>
        </div>
      )
    },
    {
      header: 'UOM',
      render: (row) => row.material?.unit || 'Kg'
    },
    {
      header: 'Total QC Inward',
      accessor: 'totalReceived',
      render: (row) => `${row.totalReceived} ${row.material?.unit || ''}`
    },
    {
      header: 'Total Issued',
      accessor: 'totalIssued',
      render: (row) => `${row.totalIssued} ${row.material?.unit || ''}`
    },
    {
      header: 'Available Stock',
      accessor: 'availableStock',
      render: (row) => {
        const isLow = row.availableStock <= row.minimumStock;
        return (
          <span style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: isLow ? '#F87171' : '#34D399',
            fontFamily: 'var(--font-mono)'
          }}>
            {row.availableStock} {row.material?.unit || ''}
          </span>
        );
      }
    },
    {
      header: 'Min Threshold',
      accessor: 'minimumStock',
      render: (row) => `${row.minimumStock} ${row.material?.unit || ''}`
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Stock Ledger" onClick={() => handleOpenLedger(row)}>
            <History size={15} />
          </button>
          <button className="icon-btn" title="Stock Adjustment" onClick={() => handleOpenAdjust(row)}>
            <SlidersHorizontal size={15} />
          </button>
        </div>
      )
    }
  ];

  const totalSKUs = inventory.length;
  const inStockSKUs = inventory.filter(i => i.status === 'In Stock').length;
  const lowStockSKUs = inventory.filter(i => i.status === 'Low Stock').length;

  return (
    <div>
      {/* Notice on stock conservation rule */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <AlertCircle size={20} color="#60A5FA" />
        <div style={{ fontSize: '0.82rem', color: '#93C5FD' }}>
          <strong>Inventory Conservation Rule:</strong> Available stock is strictly system-calculated. Direct arbitrary additions are disabled. Stock automatically increments when items pass <strong>QC Inspection</strong> and decrements on <strong>Production Issue</strong>.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Active Materials in Stock" value={totalSKUs} subtext="Cataloged SKUs" icon={Warehouse} color="#3B82F6" />
        <KpiCard title="Healthy Stock Level" value={inStockSKUs} subtext="Above Safety Threshold" icon={Warehouse} color="#10B981" />
        <KpiCard title="Reorder Warnings" value={lowStockSKUs} subtext="At or Below Min Stock" icon={AlertCircle} color="#EF4444" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={inventory}
        searchPlaceholder="Search material code or name in stock..."
      />

      {/* Stock Ledger Drawer / Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        size="lg"
        title={`Stock Ledger: ${selectedItem?.material?.materialCode}`}
        subtitle={selectedItem?.material?.materialName}
      >
        {selectedItem && (
          <div>
            {/* Balance Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginBottom: 20
            }}>
              <div>
                <div className="detail-label">Opening Stock</div>
                <div style={{ fontWeight: 600 }}>{selectedItem.openingStock || 0} {selectedItem.material?.unit}</div>
              </div>
              <div>
                <div className="detail-label">QC Receipts (+)</div>
                <div style={{ fontWeight: 600, color: '#34D399' }}>+{selectedItem.totalReceived} {selectedItem.material?.unit}</div>
              </div>
              <div>
                <div className="detail-label">Production Issues (-)</div>
                <div style={{ fontWeight: 600, color: '#F87171' }}>-{selectedItem.totalIssued} {selectedItem.material?.unit}</div>
              </div>
              <div>
                <div className="detail-label">Current Available</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedItem.availableStock} {selectedItem.material?.unit}
                </div>
              </div>
            </div>

            {/* Ledger Transactions */}
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              Chronological Movement History
            </div>

            {loadingLedger ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading ledger records...</div>
            ) : ledgerHistory.length > 0 ? (
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction Type</th>
                      <th>Doc Ref</th>
                      <th>Inward (+)</th>
                      <th>Outward (-)</th>
                      <th>Balance After</th>
                      <th>Logged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                            {item.transactionType}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{item.referenceDoc}</td>
                        <td style={{ color: '#34D399', fontWeight: 600 }}>
                          {item.qtyIn > 0 ? `+${item.qtyIn}` : '—'}
                        </td>
                        <td style={{ color: '#F87171', fontWeight: 600 }}>
                          {item.qtyOut > 0 ? `-${item.qtyOut}` : '—'}
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.balanceAfter}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.loggedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                No movement transactions recorded yet.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Physical Stock Audit Adjustment"
        subtitle={`Adjust balance for ${adjustTarget?.material?.materialName}`}
      >
        <form onSubmit={handleSaveAdjust}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Current System Stock</label>
              <input
                type="text"
                readOnly
                className="form-input"
                value={`${adjustTarget?.availableStock || 0} ${adjustTarget?.material?.unit || ''}`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Verified Physical Stock Count <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                step="any"
                required
                className="form-input"
                value={adjustData.adjustedStock}
                onChange={(e) => setAdjustData({ ...adjustData, adjustedStock: Number(e.target.value) })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Mandatory Audit Justification / Reason <span className="req">*</span></label>
              <textarea
                rows="2"
                required
                className="form-textarea"
                placeholder="Physical warehouse cycle count variance, damaged stock write-off..."
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Auditor / Authorizing Lead</label>
              <input
                type="text"
                className="form-input"
                value={adjustData.loggedBy}
                onChange={(e) => setAdjustData({ ...adjustData, loggedBy: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Post Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

