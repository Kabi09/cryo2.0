import React, { useState } from 'react';
import QCTestsModule from './QCTestsModule';
import InventoryModule from './InventoryModule';
import SupplierReturnsModule from './SupplierReturnsModule';
import StatusBadge from '../common/StatusBadge';
import { ShieldAlert, ShieldCheck, Boxes, RotateCcw, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

export default function QualityInventoryPage({
  qcTests = [],
  grns = [],
  inventory = [],
  supplierReturns = [],
  onSaveQCTest,
  onAdjustStock,
  onSaveSupplierReturn,
  preSelectedGRN,
  showToast,
  defaultTab = 'qc-pending'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedPendingGRN, setSelectedPendingGRN] = useState(preSelectedGRN || null);

  // Filter GRNs in quarantine pending QC inspection
  const pendingGRNs = grns.filter(g => g.status === 'QC Pending');

  const handleStartQCTest = (grn) => {
    setSelectedPendingGRN(grn);
    setActiveTab('qc-history');
  };

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'qc-pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('qc-pending')}
          >
            <ShieldAlert size={14} style={{ marginRight: 6, color: pendingGRNs.length > 0 ? 'var(--danger)' : 'inherit' }} />
            QC Pending ({pendingGRNs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'qc-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('qc-history')}
          >
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            QC History ({qcTests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <Boxes size={14} style={{ marginRight: 6 }} />
            Stock ({inventory.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            Supplier Returns ({supplierReturns.length})
          </button>
        </div>
      </div>

      {/* Tab 1: QC Pending (Quarantined Inward Lots) */}
      {activeTab === 'qc-pending' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Incoming Goods Inward Quarantine (QC Pending)
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Materials received at factory store quarantined until certified by quality team. Stock is NOT credited to usable inventory until QC passed.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GRN Number</th>
                  <th>PO Reference</th>
                  <th>Supplier</th>
                  <th>Received Date</th>
                  <th>Received Items</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingGRNs.map(grn => {
                  const firstItem = grn.items?.[0];
                  const recQty = firstItem?.currentReceivedQty || 0;
                  const matName = firstItem?.material?.materialName || 'Raw Material';

                  return (
                    <tr key={grn._id}>
                      <td><span className="code-badge">{grn.grnNumber}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{grn.purchaseOrder?.poNumber || 'PO-Direct'}</span></td>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{grn.supplier?.supplierName || '—'}</strong></td>
                      <td style={{ fontSize: '0.78rem' }}>{grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString('en-GB') : '—'}</td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{matName}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Qty: {recQty} {firstItem?.unit || 'Units'} • Batch: {firstItem?.batchNumber || 'BAT-001'}
                        </div>
                      </td>
                      <td><StatusBadge status={grn.status} /></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4 }}
                          onClick={() => handleStartQCTest(grn)}
                        >
                          <ShieldCheck size={13} /> Start QC Test ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pendingGRNs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      <CheckCircle2 size={28} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 8px' }} />
                      <strong>No Quarantined Lots Pending QC!</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>All inward materials have been tested and approved or rejected.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: QC History */}
      {activeTab === 'qc-history' && (
        <QCTestsModule
          qcTests={qcTests}
          grns={grns}
          onSave={onSaveQCTest}
          showToast={showToast}
          preSelectedGRN={selectedPendingGRN || preSelectedGRN}
        />
      )}

      {/* Tab 3: Stock / Warehouse Inventory */}
      {activeTab === 'stock' && (
        <InventoryModule
          inventory={inventory}
          onAdjustStock={onAdjustStock}
          showToast={showToast}
        />
      )}

      {/* Tab 4: Supplier Returns */}
      {activeTab === 'returns' && (
        <SupplierReturnsModule
          supplierReturns={supplierReturns}
          qcTests={qcTests}
          onSave={onSaveSupplierReturn}
          showToast={showToast}
        />
      )}
    </div>
  );
}
