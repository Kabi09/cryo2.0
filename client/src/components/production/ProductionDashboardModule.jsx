import React from 'react';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import {
  Factory,
  Clock,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  PackageCheck,
  ArrowDownLeft,
  Eye,
  Truck
} from 'lucide-react';

export default function ProductionDashboardModule({ dashboardData, onNavigateModule }) {
  const kpis = dashboardData?.kpis || {
    totalOrders: 12,
    pendingProduction: 3,
    inProgress: 4,
    waitingMaterials: 3,
    qaPending: 2,
    reworkCount: 2,
    completedOrders: 5,
    readyForDispatch: 6
  };

  const pendingProduction = kpis.pendingProduction || (kpis.totalOrders - (kpis.inProgress + kpis.completedOrders)) || 3;
  const readyForDispatch = kpis.readyForDispatch || kpis.completedOrders || 6;
  const recentOrders = dashboardData?.recentOrders || [];

  const columns = [
    {
      header: 'Work Order',
      accessor: 'workOrderNumber',
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => onNavigateModule && onNavigateModule('orders')}
        >
          {row.workOrderNumber}
        </span>
      )
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.productName || row.product?.productName || 'Cryo Unit'}</strong>
          {row.customerName && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customerName}</div>
          )}
        </div>
      )
    },
    {
      header: 'Quantity',
      accessor: 'productionQuantity',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.productionQuantity || row.orderQuantity || 0} Units
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    },
    {
      header: 'Delivery Date',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.expectedCompletionDate ? new Date(row.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}
        </span>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
          onClick={() => onNavigateModule && onNavigateModule('orders')}
        >
          <Eye size={12} /> View Order
        </button>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* Useful Summary Cards (6 Exact requested Cards) */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard
          label="Total Work Orders"
          value={kpis.totalOrders}
          subtext="Active demand pipeline"
          icon={Factory}
          accent="primary"
        />
        <KpiCard
          label="Pending Production"
          value={pendingProduction}
          subtext="Scheduled & planned"
          icon={Calendar}
          accent="cyan"
        />
        <KpiCard
          label="In Progress"
          value={kpis.inProgress}
          subtext="On shopfloor lines"
          icon={Clock}
          accent="primary"
        />
        <KpiCard
          label="Completed"
          value={kpis.completedOrders}
          subtext="Assembly completed"
          icon={CheckCircle2}
          accent="success"
        />
        <KpiCard
          label="Pending Quality Check"
          value={kpis.qaPending}
          subtext="In quarantine inspection"
          icon={ShieldCheck}
          accent="warning"
        />
        <KpiCard
          label="Ready for Dispatch"
          value={readyForDispatch}
          subtext="Passed QA in warehouse"
          icon={PackageCheck}
          accent="success"
        />
      </div>

      {/* Pending Actions Section */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--bg-surface)' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Priority Pending Tasks & Production Blockers:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Action 1: Materials Required */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Materials Required</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                {kpis.waitingMaterials} Orders
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
              onClick={() => onNavigateModule && onNavigateModule('materials')}
            >
              <ArrowDownLeft size={13} /> View Requests ➔
            </button>
          </div>

          {/* Action 2: Orders Awaiting Scheduling */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting Scheduling</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
                {pendingProduction} Orders
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
              onClick={() => onNavigateModule && onNavigateModule('orders')}
            >
              <Clock size={13} /> Schedule ➔
            </button>
          </div>

          {/* Action 3: Orders Awaiting QA */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting Quality Inspection</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16A36A', marginTop: 2 }}>
                {kpis.qaPending} Batches
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
              onClick={() => onNavigateModule && onNavigateModule('quality')}
            >
              <ShieldCheck size={13} /> Test QA ➔
            </button>
          </div>
        </div>
      </div>

      {/* Recent Production Work Orders */}
      <DataTable
        title="Recent Production Work Orders"
        subtitle="Live tracking of shop floor manufacturing orders from customer demand"
        columns={columns}
        data={recentOrders}
        onAdd={() => onNavigateModule && onNavigateModule('orders')}
        addLabel="New Work Order"
      />
    </div>
  );
}
