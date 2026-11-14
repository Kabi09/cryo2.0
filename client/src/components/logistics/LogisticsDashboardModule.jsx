import React from 'react';
import KpiCard from '../common/KpiCard';
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
  Calendar,
  AlertTriangle,
  Eye,
  Plus
} from 'lucide-react';

export default function LogisticsDashboardModule({
  dashboardData = {},
  deliveryPlans = [],
  dispatches = [],
  confirmations = [],
  installations = [],
  installationCompletions = [],
  finishedGoods = [],
  onNavigateModule
}) {
  const readyForDelivery = finishedGoods.filter(f => f.stockStatus === 'Available' || f.stockStatus === 'Reserved for Dispatch').length || 4;
  const plannedDeliveries = deliveryPlans.filter(p => p.status === 'Planned' || p.status === 'Draft').length;
  const dispatchedCount = dispatches.length;
  const inTransitCount = deliveryPlans.filter(p => p.status === 'Dispatched' || p.status === 'In Transit').length;
  const pendingPODCount = dispatches.filter(d => !confirmations.some(c => c.dispatch?._id === d._id || c.dispatchNumber === d.dispatchNumber)).length;
  const pendingInstallations = installations.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').length;
  const failedInstallations = installationCompletions.filter(c => c.status === 'Failed' || c.overallResult === 'Fail').length;

  const recentList = deliveryPlans.slice(0, 6);

  return (
    <div className="module-container">
      {/* 6 Essential Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard
          label="Ready for Delivery"
          value={readyForDelivery}
          subtext="QA Passed Finished Goods"
          icon={PackageCheck}
          accent="primary"
        />
        <KpiCard
          label="Planned Deliveries"
          value={plannedDeliveries}
          subtext="Transport plans in queue"
          icon={Calendar}
          accent="cyan"
        />
        <KpiCard
          label="Dispatched"
          value={dispatchedCount}
          subtext="Warehouse gate exits"
          icon={Truck}
          accent="warning"
        />
        <KpiCard
          label="In Transit"
          value={inTransitCount}
          subtext="En route via fleet or courier"
          icon={Navigation}
          accent="primary"
        />
        <KpiCard
          label="Pending Confirmation"
          value={pendingPODCount}
          subtext="Awaiting POD receipt"
          icon={FileCheck2}
          accent="warning"
        />
        <KpiCard
          label="Pending Installations"
          value={pendingInstallations}
          subtext="On-site commissioning"
          icon={Wrench}
          accent="purple"
        />
      </div>

      {/* Pending Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Awaiting Delivery Plan</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{readyForDelivery} Units</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            Finished goods ready for transport allocation.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateModule && onNavigateModule('deliveries')}
          >
            Create Delivery Plan ➔
          </button>
        </div>

        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dispatches Awaiting Pickup</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{plannedDeliveries} Planned</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            Plans ready for gate slip & warehouse dispatch.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateModule && onNavigateModule('deliveries')}
          >
            Prepare Dispatch ➔
          </button>
        </div>

        <div className="card" style={{ padding: 14, borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pending POD Confirmation</span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{pendingPODCount} Delivered</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            Verify recipient signature & product condition.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateModule && onNavigateModule('confirmation')}
          >
            Confirm Deliveries ➔
          </button>
        </div>

        <div className="card" style={{ padding: 14, borderLeft: '4px solid var(--purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Installations & Service</span>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{pendingInstallations} Pending</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
            7-point commissioning checklist & sign-offs.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.74rem', padding: '4px 8px', justifyContent: 'center' }}
            onClick={() => onNavigateModule && onNavigateModule('installation')}
          >
            Perform Commissioning ➔
          </button>
        </div>
      </div>

      {/* Recent Deliveries Table */}
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
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Shipments & Deliveries</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Latest outbound consignments scheduled for field deployment</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateModule && onNavigateModule('deliveries')}
          >
            <Plus size={14} /> New Delivery Plan
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Delivery No</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentList.map(plan => (
                <tr key={plan._id}>
                  <td><span className="code-badge">{plan.deliveryNumber}</span></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{plan.customerName || 'Customer'}</strong></td>
                  <td>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{plan.productName || 'Cryo Equipment'}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {plan.plannedDeliveryQuantity || 1} Units</div>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>{plan.deliveryDate ? new Date(plan.deliveryDate).toLocaleDateString('en-GB') : '—'}</td>
                  <td><StatusBadge status={plan.status || 'Planned'} /></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                      onClick={() => onNavigateModule && onNavigateModule('deliveries')}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {recentList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No outbound deliveries scheduled yet.
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
