import React from 'react';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import {
  Truck,
  Clock,
  CheckCircle2,
  Wrench,
  Navigation,
  ArrowRight,
  PackageCheck,
  FileCheck2,
  Calendar
} from 'lucide-react';

export default function LogisticsDashboardModule({ dashboardData, onNavigateModule }) {
  const kpis = dashboardData || {
    pendingDeliveries: 12,
    inTransit: 8,
    delivered: 15,
    installationPending: 3,
    recentDeliveries: []
  };

  const recentDeliveries = kpis.recentDeliveries || [];

  const columns = [
    {
      header: 'Delivery No',
      accessor: 'deliveryNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.deliveryNumber}</span>
    },
    {
      header: 'SO Reference',
      accessor: 'soNumber',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.soNumber || 'SO-001'}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Delivery Date',
      accessor: 'deliveryDate',
      render: (row) => (row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : '-')
    },
    {
      header: 'Method',
      accessor: 'deliveryMethod',
      render: (row) => (
        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          {row.deliveryMethod}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    }
  ];

  return (
    <div className="module-container">
      {/* 4 Summary Cards */}
      <div className="kpi-grid">
        <KpiCard
          label="Pending Deliveries"
          value={kpis.pendingDeliveries || 12}
          subtext="Confirmed SOs ready for dispatch"
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label="In Transit"
          value={kpis.inTransit || 8}
          subtext="En route via vehicle or courier"
          icon={Truck}
          accent="primary"
        />
        <KpiCard
          label="Delivered (POD)"
          value={kpis.delivered || 15}
          subtext="Customer received & verified"
          icon={CheckCircle2}
          accent="success"
        />
        <KpiCard
          label="Installation Pending"
          value={kpis.installationPending || 3}
          subtext="Goods reached, awaiting site team"
          icon={Wrench}
          accent="cyan"
        />
      </div>

      {/* Visual Workflow Stepper */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24, background: 'var(--bg-surface)' }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Logistics & On-Site Installation Delivery Flow
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          alignItems: 'center'
        }}>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700 }}>01. DEMAND</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Sales Order Confirmed</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>02. STOCK</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>QA-Approved FG</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#818CF8', fontWeight: 700 }}>03. METHOD</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Vehicle or Courier</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>04. DISPATCH</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Challan & Gate Exit</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700 }}>05. TRACKING</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Live In-Transit</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>06. RECEIPT</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Proof of Delivery</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--primary-light)', borderRadius: 8, border: '1px solid var(--primary)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>07. INSTALL</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>7-Point QA Checklist</div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries Table */}
      <DataTable
        title="Recent Deliveries & Shipments"
        subtitle="Live movement of finished goods from factory warehouse to customer facilities"
        columns={columns}
        data={recentDeliveries}
      />
    </div>
  );
}

