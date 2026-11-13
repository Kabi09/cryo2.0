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
  ArrowRight
} from 'lucide-react';

export default function ScmDashboardModule({
  materials = [],
  suppliers = [],
  purchaseOrders = [],
  grns = [],
  qcTests = [],
  inventory = [],
  materialIssues = [],
  onNavigateTab
}) {
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Draft' || p.status === 'Issued');
  const quarantineGRNs = grns.filter(g => g.status === 'QC Pending');
  const lowStockCount = inventory.filter(i => i.availableStock <= (i.material?.minimumStockLevel || 10)).length;

  return (
    <div className="module-container">
      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Registered Materials"
          value={materials.length}
          subtext="Active SKUs in Catalog"
          icon={Package}
          accent="primary"
        />
        <KpiCard
          label="Active Suppliers"
          value={suppliers.filter(s => s.status === 'Active').length}
          subtext="Approved Vendor Base"
          icon={Building2}
          accent="cyan"
        />
        <KpiCard
          label="Pending Purchase Orders"
          value={pendingPOs.length}
          subtext="Draft or Issued POs"
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label="Quarantine QC Pending"
          value={quarantineGRNs.length}
          subtext="Inward Lots Awaiting Test"
          icon={ShieldAlert}
          accent="danger"
        />
        <KpiCard
          label="Low Stock Warnings"
          value={lowStockCount}
          subtext="At or Below Reorder Level"
          icon={Boxes}
          accent={lowStockCount > 0 ? "danger" : "success"}
        />
        <KpiCard
          label="Material Issues"
          value={materialIssues.length}
          subtext="Dispatched to Production"
          icon={ArrowUpRight}
          accent="purple"
        />
      </div>

      {/* SCM Quick Actions & Workflow Banner */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'linear-gradient(90deg, rgba(36, 81, 197, 0.06), rgba(2, 132, 199, 0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Supply Chain Execution Pipeline
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Raw Materials → Verified Suppliers → Purchase Orders → GRN Inward → Quarantine QC → Warehouse Stock → Store Issue
            </p>
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
              onClick={() => onNavigateTab && onNavigateTab('quality', 'qc')}
            >
              <ShieldAlert size={14} /> QC Inspection
            </button>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent POs and Quarantine GRNs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Recent Purchase Orders */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Purchase Orders</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Latest supplier orders issued</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab && onNavigateTab('purchasing', 'po')}
            >
              All POs <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.slice(0, 5).map(po => (
                  <tr key={po._id}>
                    <td><span className="code-badge">{po.poNumber}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{po.supplier?.supplierName || '—'}</strong>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ₹{po.totalAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td><StatusBadge status={po.status} /></td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quarantine Inward GRN Lots */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Inward Goods Receipts (GRN)</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Materials received at factory warehouse</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab && onNavigateTab('purchasing', 'grn')}
            >
              All GRNs <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GRN Number</th>
                  <th>PO Reference</th>
                  <th>Supplier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {grns.slice(0, 5).map(grn => (
                  <tr key={grn._id}>
                    <td><span className="code-badge">{grn.grnNumber}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{grn.purchaseOrder?.poNumber || 'PO-Direct'}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{grn.supplier?.supplierName || '—'}</strong>
                    </td>
                    <td><StatusBadge status={grn.status} /></td>
                  </tr>
                ))}
                {grns.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                      No goods receipts inwarded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

