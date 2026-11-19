import React from 'react';
import KpiCard from '../common/KpiCard';
import StatusBadge from '../common/StatusBadge';
import {
  Package,
  Building2,
  Clock,
  ShieldAlert,
  Boxes,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  ShoppingCart,
  ArrowDownLeft,
  Factory
} from 'lucide-react';

export default function ScmDashboardModule({
  materials = [],
  suppliers = [],
  purchaseOrders = [],
  grns = [],
  qcTests = [],
  inventory = [],
  materialIssues = [],
  materialRequests = [],
  supplierLinks = [],
  onNavigateTab,
  onNavigateToPOWithData
}) {
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Draft' || p.status === 'Issued');
  const pendingGRNs = grns.filter(g => g.status === 'Draft' || g.status === 'Pending');
  const quarantineGRNs = grns.filter(g => g.status === 'QC Pending');
  const lowStockMaterials = inventory.filter(i => (i.availableStock || i.currentStock || 0) <= (i.material?.minimumStockLevel || 10));
  const pendingRequests = materialRequests.filter(r => r.status === 'Pending' || r.status === 'Approved');

  // Combined recent transactions
  const transactions = [
    ...purchaseOrders.slice(0, 4).map(po => ({
      id: po._id,
      ref: po.poNumber,
      type: 'Purchase Order',
      party: po.supplier?.supplierName || 'Supplier',
      date: po.poDate || po.createdAt,
      status: po.status,
      targetTab: 'purchasing',
      subTab: 'po'
    })),
    ...grns.slice(0, 4).map(grn => ({
      id: grn._id,
      ref: grn.grnNumber,
      type: 'Goods Receipt',
      party: grn.supplier?.supplierName || 'Inward Vendor',
      date: grn.receivedDate || grn.createdAt,
      status: grn.status,
      targetTab: 'purchasing',
      subTab: 'grn'
    })),
    ...qcTests.slice(0, 4).map(qc => ({
      id: qc._id,
      ref: qc.qcNumber,
      type: 'QC Inspection',
      party: qc.material?.materialName || 'Inspection Lot',
      date: qc.testDate || qc.createdAt,
      status: qc.overallResult || qc.status,
      targetTab: 'quality-inventory',
      subTab: 'qc'
    })),
    ...materialIssues.slice(0, 4).map(mi => ({
      id: mi._id,
      ref: mi.issueNumber,
      type: 'Material Issue',
      party: mi.department || 'Production Line',
      date: mi.issueDate || mi.createdAt,
      status: mi.status || 'Issued',
      targetTab: 'material-issues',
      subTab: 'issues'
    }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);

  // Helper to handle ordering from supplier on shortage
  const handleOrderShortage = (matId, requiredQty) => {
    // Find preferred supplier link
    const link = (supplierLinks || []).find(l => (l.material?._id || l.material) === matId && l.preferredSupplier) ||
                 (supplierLinks || []).find(l => (l.material?._id || l.material) === matId);
    
    const supplierId = link ? (link.supplier?._id || link.supplier) : (suppliers[0]?._id || '');
    const unitPrice = link?.unitPrice || 80;
    const orderQty = Math.max(requiredQty || 100, link?.minOrderQty || 100);

    if (onNavigateToPOWithData) {
      onNavigateToPOWithData({
        supplierId,
        materialId: matId,
        quantity: orderQty,
        unitPrice
      });
    } else if (onNavigateTab) {
      onNavigateTab('purchasing', 'po');
    }
  };

  return (
    <div className="module-container">
      {/* 5-Step SCM Workflow Visual Guide (Requested by User) */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--primary)' }}>
              End-to-End Supply Chain Procurement & Issue Lifecycle
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Quarantine Quality Gated • Approved Stock Conservation
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10
        }}>
          {/* Step 1 */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('purchasing', 'po')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>01. ORDER SUPPLIER</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
              Purchase Order (PO)
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('purchasing', 'grn')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>02. GATE ENTRY</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              Goods Receipt (GRN)
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('quality-inventory', 'qc-pending')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>03. QUALITY CHECK</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#D97706', marginTop: 2 }}>
              QC Test (Pass/Reject)
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('inventory')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>04. STOCK INCREASE</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#16A36A', marginTop: 2 }}>
              Available Warehouse Stock
            </div>
          </div>

          {/* Step 5 */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('material-issues', 'requests')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>05. ISSUE TO PRODUCTION</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#8B5CF6', marginTop: 2 }}>
              Store Issue Slip
            </div>
          </div>
        </div>
      </div>

      {/* 6 Useful KPI Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard
          label="Total Raw Materials"
          value={materials.length}
          subtext="Active SKUs in Catalog"
          icon={Package}
          accent="primary"
        />
        <KpiCard
          label="Pending Purchase Orders"
          value={pendingPOs.length}
          subtext="Draft or Issued POs"
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label="Pending GRNs"
          value={pendingGRNs.length}
          subtext="Awaiting Gate Entry"
          icon={Truck}
          accent="cyan"
        />
        <KpiCard
          label="Pending QC"
          value={quarantineGRNs.length}
          subtext="Quarantined Lots"
          icon={ShieldAlert}
          accent="danger"
        />
        <KpiCard
          label="Low Stock Materials"
          value={lowStockMaterials.length}
          subtext="At or Below Reorder Level"
          icon={Boxes}
          accent={lowStockMaterials.length > 0 ? "danger" : "success"}
        />
        <KpiCard
          label="Factory Material Requests"
          value={pendingRequests.length}
          subtext="Requisitions from Factory"
          icon={ArrowUpRight}
          accent="purple"
        />
      </div>

      {/* SECTION: FACTORY MATERIAL REQUESTS (PRODUCTION REQUISITIONS - Requested by User) */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Factory size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Production Material Requisitions (Shopfloor Demand)
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {pendingRequests.length} Pending
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Materials requested by Production Work Orders. If stock is available, click "Issue". If out of stock, click "+ Order from Supplier".
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab && onNavigateTab('material-issues', 'requests')}
          >
            View Requisitions Hub ➔
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request No</th>
                <th>Work Order</th>
                <th>Product</th>
                <th>Materials Required</th>
                <th>Warehouse Stock Status</th>
                <th>Required Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req) => {
                const items = req.items || [];
                // Check stock for every item
                let firstShortageItem = null;
                let hasShortage = false;

                items.forEach(it => {
                  const matId = it.material?._id || it.material;
                  const inv = inventory.find(i => (i.material?._id || i.material) === matId);
                  const available = inv ? (inv.availableStock || inv.currentStock || 0) : 0;
                  const needed = it.requestedQty || it.requiredQty || 0;
                  if (available < needed) {
                    hasShortage = true;
                    if (!firstShortageItem) {
                      firstShortageItem = {
                        materialId: matId,
                        materialName: it.materialName || 'Raw Material',
                        shortageQty: needed - available,
                        unit: it.unit || 'Kg'
                      };
                    }
                  }
                });

                return (
                  <tr key={req._id || req.requestNumber}>
                    <td>
                      <span className="code-badge" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {req.requestNumber}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono">{req.workOrderNumber || 'WO-Direct'}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{req.productName || 'Cryo Unit'}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{items.length} Component{items.length !== 1 ? 's' : ''}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {items.slice(0, 2).map(it => `${it.materialName}: ${it.requestedQty || it.requiredQty} ${it.unit || ''}`).join(', ')}
                        {items.length > 2 ? '...' : ''}
                      </div>
                    </td>
                    <td>
                      {!hasShortage ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11} /> Stock Available in Store
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={11} /> Material Shortage: Need Supplier PO
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td>
                      {!hasShortage ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 10px', fontSize: '0.72rem', height: 26, gap: 4 }}
                          onClick={() => onNavigateTab && onNavigateTab('material-issues', 'issues')}
                        >
                          <CheckCircle2 size={12} /> Issue to Production ➔
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          style={{ padding: '2px 10px', fontSize: '0.72rem', height: 26, gap: 4, background: '#D97706', color: '#fff', borderColor: '#B45309' }}
                          title={`Order missing ${firstShortageItem?.materialName} (${firstShortageItem?.shortageQty} ${firstShortageItem?.unit}) from supplier`}
                          onClick={() => handleOrderShortage(firstShortageItem?.materialId, firstShortageItem?.shortageQty)}
                        >
                          <ShoppingCart size={12} /> + Order from Supplier (PO) ➔
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pendingRequests.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    No pending factory material requests. When Production creates a requisition, it will appear here with stock status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Actions Alert Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
        {/* POs awaiting action */}
        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>POs Awaiting Action</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{pendingPOs.length} Pending</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            {pendingPOs.length > 0 ? `${pendingPOs.length} orders need approval or supplier transmission.` : 'All purchase orders have been processed.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateTab && onNavigateTab('purchasing', 'po')}
          >
            Review Purchase Orders ➔
          </button>
        </div>

        {/* Materials Awaiting QC */}
        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Materials Awaiting QC</span>
            <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{quarantineGRNs.length} Quarantine</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            {quarantineGRNs.length > 0 ? `${quarantineGRNs.length} received lots in quarantine pending test.` : 'No lots waiting in incoming quarantine.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateTab && onNavigateTab('quality-inventory', 'qc-pending')}
          >
            Inspect Quarantine Lots ➔
          </button>
        </div>

        {/* Low Stock Alerts */}
        <div className="card" style={{ padding: 14, borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Low-Stock Alerts</span>
            <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{lowStockMaterials.length} Shortage</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            {lowStockMaterials.length > 0 ? `${lowStockMaterials.length} items at or below reorder threshold.` : 'All stock balances healthy.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateTab && onNavigateTab('inventory')}
          >
            Check Stock Balances ➔
          </button>
        </div>

        {/* Production Requisitions */}
        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Factory Store Issue</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{pendingRequests.length} Requisitions</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            {pendingRequests.length > 0 ? `${pendingRequests.length} shop floor requisitions ready for issue.` : 'No pending factory requisitions.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateTab && onNavigateTab('material-issues', 'requests')}
          >
            Issue to Production ➔
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
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
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Supply Chain Transactions</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Chronological ledger of purchasing, receipts, QC, and store issues</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigateTab && onNavigateTab('purchasing', 'po')}
            >
              <Plus size={14} /> New Purchase Order
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab && onNavigateTab('quality-inventory', 'qc-pending')}
            >
              <ShieldAlert size={14} /> Incoming QC
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Supplier / Department</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={tx.id || idx}>
                  <td><span className="code-badge">{tx.ref}</span></td>
                  <td><span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{tx.type}</span></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{tx.party}</strong></td>
                  <td style={{ fontSize: '0.78rem' }}>{tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '—'}</td>
                  <td><StatusBadge status={tx.status} /></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                      onClick={() => onNavigateTab && onNavigateTab(tx.targetTab, tx.subTab)}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No transactions recorded yet in supply chain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
