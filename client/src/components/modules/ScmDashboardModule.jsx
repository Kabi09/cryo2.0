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
  Truck
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
  onNavigateTab
}) {
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Draft' || p.status === 'Issued');
  const pendingGRNs = grns.filter(g => g.status === 'Draft' || g.status === 'Pending');
  const quarantineGRNs = grns.filter(g => g.status === 'QC Pending');
  const lowStockMaterials = inventory.filter(i => i.availableStock <= (i.material?.minimumStockLevel || 10));
  const pendingIssues = materialRequests.filter(r => r.status === 'Pending' || r.status === 'Approved');

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

  return (
    <div className="module-container">
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
          label="Pending Material Issues"
          value={pendingIssues.length || materialIssues.length}
          subtext="Requisitions from Factory"
          icon={ArrowUpRight}
          accent="purple"
        />
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
            onClick={() => onNavigateTab && onNavigateTab('quality-inventory', 'stock')}
          >
            Check Stock Balances ➔
          </button>
        </div>

        {/* Production Requisitions */}
        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Factory Material Requests</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{pendingIssues.length} Requests</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            {pendingIssues.length > 0 ? `${pendingIssues.length} shop floor requisitions awaiting issue.` : 'No pending factory requisitions.'}
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
