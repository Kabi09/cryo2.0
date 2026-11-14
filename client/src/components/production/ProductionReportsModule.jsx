import React, { useState, useMemo } from 'react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Factory,
  ShieldCheck,
  Package,
  Layers,
  RotateCcw
} from 'lucide-react';

export default function ProductionReportsModule({
  workOrders = [],
  productionUpdates = [],
  completions = [],
  qaTests = [],
  reworkOrders = [],
  finishedGoods = [],
  materialRequests = [],
  products = []
}) {
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'this-month' | 'last-30'
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtered Work Orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      if (productFilter !== 'all') {
        const prodId = wo.product?._id || wo.product;
        if (String(prodId) !== String(productFilter)) return false;
      }
      if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
      return true;
    });
  }, [workOrders, productFilter, statusFilter]);

  // Aggregate Metrics
  const totalOrders = filteredWorkOrders.length;
  const runningOrders = filteredWorkOrders.filter(w => w.status === 'Running' || w.status === 'Ready to Start').length;
  const completedOrders = filteredWorkOrders.filter(w => w.status === 'Completed').length;
  const waitingMaterials = filteredWorkOrders.filter(w => w.status === 'Waiting for Materials').length;

  const totalTested = qaTests.reduce((sum, q) => sum + (q.testedQuantity || 0), 0);
  const totalPassed = qaTests.reduce((sum, q) => sum + (q.passedQuantity || 0), 0);
  const passRate = totalTested > 0 ? Math.round((totalPassed / totalTested) * 100) : 100;

  const totalFGAvailable = finishedGoods.filter(f => f.stockStatus === 'Available').reduce((sum, f) => sum + (f.approvedQuantity || 1), 0);
  const totalFGReserved = finishedGoods.filter(f => f.stockStatus === 'Reserved for Dispatch' || f.stockStatus === 'Reserved').reduce((sum, f) => sum + (f.approvedQuantity || 1), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Work Order No', 'Sales Order', 'Customer', 'Product', 'Quantity', 'Status', 'Start Date', 'Target Date'];
    const rows = filteredWorkOrders.map(wo => [
      wo.workOrderNumber,
      wo.salesOrderNumber || 'Direct Order',
      wo.customerName || 'Customer',
      wo.productName || 'Product',
      wo.productionQuantity || wo.orderQuantity || 0,
      wo.status || 'Planned',
      wo.plannedStartDate ? new Date(wo.plannedStartDate).toLocaleDateString('en-GB') : '',
      wo.expectedCompletionDate ? new Date(wo.expectedCompletionDate).toLocaleDateString('en-GB') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Production_Summary_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.workOrderNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName || 'Customer'
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName || 'Cryo Unit'
    },
    {
      header: 'Quantity',
      accessor: 'productionQuantity',
      render: (row) => `${row.productionQuantity || row.orderQuantity || 0} Units`
    },
    {
      header: 'Supervisor',
      accessor: 'productionManager',
      render: (row) => row.productionManager || 'Supervisor'
    },
    {
      header: 'Target Date',
      render: (row) => (row.expectedCompletionDate ? new Date(row.expectedCompletionDate).toLocaleDateString('en-GB') : '-')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    }
  ];

  return (
    <div className="module-container">
      {/* KPI Cards Grid */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="card kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(36, 81, 197, 0.1)', color: 'var(--primary)' }}>
            <Factory size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{totalOrders}</span>
            <span className="kpi-label">Total Work Orders</span>
            <span className="kpi-subtext" style={{ color: 'var(--primary)' }}>{runningOrders} In Assembly</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(22, 163, 106, 0.1)', color: 'var(--success)' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{passRate}%</span>
            <span className="kpi-label">Quality Pass Rate</span>
            <span className="kpi-subtext" style={{ color: 'var(--success)' }}>{totalPassed} of {totalTested} Passed</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{waitingMaterials}</span>
            <span className="kpi-label">Awaiting Materials</span>
            <span className="kpi-subtext" style={{ color: 'var(--warning)' }}>{reworkOrders.length} In Rework</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
            <Package size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{totalFGAvailable}</span>
            <span className="kpi-label">Finished Goods Ready</span>
            <span className="kpi-subtext" style={{ color: 'var(--text-secondary)' }}>{totalFGReserved} Reserved</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={14} /> Filter Reports:
            </span>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 160, padding: '4px 10px', fontSize: '0.8rem' }}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="all">All Products / Models</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.productName}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 140, padding: '4px 10px', fontSize: '0.8rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Ready to Start">Ready to Start</option>
              <option value="Running">Running</option>
              <option value="Waiting for Materials">Waiting for Materials</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
            onClick={handleExportCSV}
          >
            <Download size={14} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Main Work Order Status Table */}
      <DataTable
        title="Production Work Order Status Summary"
        subtitle="Operational status, team assignments, and target dates across all manufacturing lines"
        columns={columns}
        data={filteredWorkOrders}
      />
    </div>
  );
}
