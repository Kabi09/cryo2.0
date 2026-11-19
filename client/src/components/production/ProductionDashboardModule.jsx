import React from 'react';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import ProductionPipelineStepper from './ProductionPipelineStepper';
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
  Truck,
  Wrench,
  Boxes,
  ShoppingCart,
  Plus,
  FileText
} from 'lucide-react';

export default function ProductionDashboardModule({
  dashboardData,
  salesOrders = [],
  workOrders = [],
  materialRequests = [],
  productionMaterialIssues = [],
  onNavigateModule,
  onSelectSOForWO
}) {
  const kpis = dashboardData?.kpis || {
    totalOrders: workOrders.length || 12,
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
  const recentOrders = dashboardData?.recentOrders?.length ? dashboardData.recentOrders : workOrders.slice(0, 8);

  // Incoming active Sales Orders from Sales CRM
  const incomingSOs = (salesOrders.length > 0 ? salesOrders : (dashboardData?.incomingSalesOrders || []))
    .filter(so => so.status === 'Confirmed' || so.status === 'In Production' || so.productionStatus === 'Sent to Production' || so.status === 'Sales Order Issued');

  // Work Orders Columns with Stock Status
  const woColumns = [
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
      header: 'Sales Order Ref',
      accessor: 'salesOrderNumber',
      render: (row) => (
        <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          {row.salesOrderNumber || row.salesOrder?.soNumber || 'SO-Direct'}
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
      header: 'Stock Status',
      render: (row) => {
        const isIssued = productionMaterialIssues.some(mi =>
          (mi.workOrderNumber === row.workOrderNumber || String(mi.workOrder?._id || mi.workOrder) === String(row._id)) &&
          (mi.status === 'Issued' || mi.status === 'Fully Issued')
        );
        const linkedMR = materialRequests.find(mr =>
          mr.workOrderNumber === row.workOrderNumber || String(mr.workOrder?._id || mr.workOrder) === String(row._id)
        );

        if (isIssued || row.status === 'Ready to Start' || row.status === 'Running' || row.status === 'Completed' || linkedMR?.status === 'Fully Issued') {
          return (
            <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} /> Stock Issued
            </span>
          );
        }
        if (row.status === 'Partially Issued' || linkedMR?.status === 'Partially Issued') {
          return (
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Partially Issued
            </span>
          );
        }
        if (linkedMR) {
          return (
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Store Issue Pending
            </span>
          );
        }
        return (
          <span className="badge badge-secondary" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={11} /> Request Not Sent
          </span>
        );
      }
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
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
            onClick={() => onNavigateModule && onNavigateModule('orders')}
          >
            <Eye size={12} /> View
          </button>
          {(row.status === 'Ready to Start' || row.status === 'Running') && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
              onClick={() => onNavigateModule && onNavigateModule('manufacturing')}
            >
              <Factory size={12} /> Assembly ➔
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-dashboard"
        onNavigate={onNavigateModule}
        counts={{
          workOrders: kpis.totalOrders,
          materialRequests: kpis.waitingMaterials,
          executions: kpis.inProgress,
          qaTests: kpis.qaPending,
          finishedGoods: readyForDispatch
        }}
      />

      {/* Useful Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard
          label="Total Work Orders"
          value={kpis.totalOrders}
          subtext="Active manufacturing orders"
          icon={Factory}
          accent="primary"
        />
        <KpiCard
          label="Incoming Sales Orders"
          value={incomingSOs.length}
          subtext="Customer orders to produce"
          icon={ShoppingCart}
          accent="purple"
        />
        <KpiCard
          label="In Assembly / Running"
          value={kpis.inProgress}
          subtext="On shopfloor lines"
          icon={Clock}
          accent="primary"
        />
        <KpiCard
          label="Materials Requisitioned"
          value={kpis.waitingMaterials}
          subtext="Store issue pending"
          icon={ArrowDownLeft}
          accent="warning"
        />
        <KpiCard
          label="Pending Quality Check"
          value={kpis.qaPending}
          subtext="In quarantine inspection"
          icon={ShieldCheck}
          accent="cyan"
        />
        <KpiCard
          label="Ready for Dispatch"
          value={readyForDispatch}
          subtext="Passed QA in warehouse"
          icon={PackageCheck}
          accent="success"
        />
      </div>

      {/* SECTION 1: INCOMING SALES ORDERS FROM SALES CRM (Requested by User) */}
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
              <ShoppingCart size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Incoming Sales Orders (from Sales CRM)
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {incomingSOs.length} Orders
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Confirmed customer orders from Sales Management. Click "+ Create Work Order" to schedule manufacturing.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateModule && onNavigateModule('orders')}
          >
            Go to Work Orders ➔
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SO Number</th>
                <th>Customer</th>
                <th>Product & Specs</th>
                <th>Quantity</th>
                <th>Delivery Target</th>
                <th>Commercial Status</th>
                <th>Work Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incomingSOs.map((so) => {
                const linkedWO = workOrders.find(wo =>
                  String(wo.salesOrder?._id || wo.salesOrder) === String(so._id) ||
                  wo.salesOrderNumber === so.soNumber
                );
                const firstItem = so.items && so.items[0];
                const prodName = firstItem?.productName || firstItem?.product?.productName || 'Cryo Chamber';
                const qty = firstItem?.quantity || so.totalQuantity || 10;

                return (
                  <tr key={so._id || so.soNumber}>
                    <td>
                      <span className="code-badge" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {so.soNumber}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {so.customer?.companyName || so.customerName || 'Customer Client'}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {so.customer?.contactPerson}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{prodName}</strong>
                      {firstItem?.productDescription && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {firstItem.productDescription}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{qty} Units</span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {so.expectedDeliveryDate ? new Date(so.expectedDeliveryDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td>
                      <StatusBadge status={so.status || 'Confirmed'} />
                    </td>
                    <td>
                      {linkedWO ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11} /> WO: {linkedWO.workOrderNumber}
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> Awaiting Work Order
                        </span>
                      )}
                    </td>
                    <td>
                      {linkedWO ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                          onClick={() => onNavigateModule && onNavigateModule('orders')}
                        >
                          <Eye size={12} /> View WO
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 10px', fontSize: '0.72rem', height: 26, gap: 4 }}
                          onClick={() => {
                            if (onSelectSOForWO) onSelectSOForWO(so);
                            else onNavigateModule && onNavigateModule('orders');
                          }}
                        >
                          <Plus size={12} /> Create Work Order ➔
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {incomingSOs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No pending Sales Orders. Confirmed orders from Sales CRM will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Pending Tasks & Production Blockers */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--bg-surface)' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Priority Production Tasks & Station Bottlenecks:
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting Quality Check</div>
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

      {/* SECTION 2: PRODUCTION WORK ORDERS TABLE */}
      <DataTable
        title="Active Production Work Orders"
        subtitle="Shop floor manufacturing orders linked to Sales Orders, BOM recipes, and stock status"
        columns={woColumns}
        data={recentOrders}
        onAdd={() => onNavigateModule && onNavigateModule('orders')}
        addLabel="New Work Order"
      />
    </div>
  );
}
