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
  ArrowRight
} from 'lucide-react';

export default function ProductionDashboardModule({ dashboardData, onNavigateModule }) {
  const kpis = dashboardData?.kpis || {
    totalOrders: 12,
    inProgress: 4,
    waitingMaterials: 3,
    qaPending: 2,
    reworkCount: 2,
    completedOrders: 5
  };

  const recentOrders = dashboardData?.recentOrders || [];

  const columns = [
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.workOrderNumber}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName
    },
    {
      header: 'Qty',
      accessor: 'productionQuantity',
      render: (row) => `${row.productionQuantity || 0} Units`
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => <StatusBadge status={row.priority || 'Medium'} />
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    }
  ];

  return (
    <div className="module-container">
      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Production Orders"
          value={kpis.totalOrders}
          subtext="Active & scheduled orders"
          icon={Factory}
          accent="primary"
        />
        <KpiCard
          label="In Progress (Running)"
          value={kpis.inProgress}
          subtext="Active on shop floor"
          icon={Clock}
          accent="cyan"
        />
        <KpiCard
          label="Waiting for Materials"
          value={kpis.waitingMaterials}
          subtext="Company store request pending"
          icon={AlertTriangle}
          accent="warning"
        />
        <KpiCard
          label="QA Pending"
          value={kpis.qaPending}
          subtext="Manufactured awaiting test"
          icon={ShieldCheck}
          accent="cyan"
        />
        <KpiCard
          label="Rework / Rebuild"
          value={kpis.reworkCount}
          subtext="Defect repair in progress"
          icon={RotateCcw}
          accent="danger"
        />
        <KpiCard
          label="Completed Orders"
          value={kpis.completedOrders}
          subtext="Approved to Finished Goods"
          icon={CheckCircle2}
          accent="success"
        />
      </div>

      {/* Production Workflow Banner */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.06))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Integrated Manufacturing Execution Workflow
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Sales Order → Production Plan → BOM → Schedule → Store Issue → Assembly → QA Testing → Rework → Finished Goods
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateModule && onNavigateModule('planning')}
            >
              <Calendar size={14} /> Plan Order
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigateModule && onNavigateModule('qa')}
            >
              <ShieldCheck size={14} /> QA Testing
            </button>
          </div>
        </div>
      </div>

      {/* Recent Production Work Orders */}
      <DataTable
        title="Recent Production Work Orders"
        subtitle="Live tracking of shop floor manufacturing orders"
        columns={columns}
        data={recentOrders}
        onAdd={() => onNavigateModule && onNavigateModule('planning')}
        addLabel="New Work Order"
      />
    </div>
  );
}

