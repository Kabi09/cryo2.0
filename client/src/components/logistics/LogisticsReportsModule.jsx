import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Truck,
  PackageCheck,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  FileSpreadsheet,
  Navigation,
  Layers,
  Calendar
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import KpiCard from '../common/KpiCard';

export default function LogisticsReportsModule({
  deliveryPlans = [],
  dispatches = [],
  trackingRecords = [],
  confirmations = [],
  installations = [],
  installationCompletions = [],
  reportsData = {},
  showToast
}) {
  const [activeReportTab, setActiveReportTab] = useState('deliveries');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Compute KPI metrics
  const totalDeliveries = deliveryPlans.length;
  const inTransitCount = deliveryPlans.filter(d => d.status === 'In Transit' || d.status === 'Dispatched').length;
  const deliveredCount = deliveryPlans.filter(d => d.status === 'Delivered').length;
  const delayedCount = trackingRecords.filter(t => t.delayed).length;

  const totalInstallations = installations.length;
  const passedInstallations = installationCompletions.filter(c => c.overallResult === 'Pass').length;

  const onTimeRate = totalDeliveries > 0 ? Math.round(((totalDeliveries - delayedCount) / totalDeliveries) * 100) : 100;
  const installationPassRate = installationCompletions.length > 0 ? Math.round((passedInstallations / (installationCompletions.length || 1)) * 100) : 100;

  // Filtered Deliveries
  const filteredDeliveries = deliveryPlans.filter(d => {
    const matchMethod = selectedMethod === 'All' || d.deliveryMethod === selectedMethod;
    const matchStatus = selectedStatus === 'All' || d.status === selectedStatus;
    return matchMethod && matchStatus;
  });

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    const filename = `Cryo_Logistics_${activeReportTab}_Report_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'deliveries') {
      headers = ['Delivery No', 'SO Number', 'Customer', 'Product', 'Qty', 'Delivery Date', 'Method', 'Status'];
      rows = filteredDeliveries.map(d => [
        `"${d.deliveryNumber}"`,
        `"${d.soNumber || ''}"`,
        `"${d.customerName}"`,
        `"${d.productName}"`,
        d.plannedDeliveryQuantity || 1,
        `"${d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : ''}"`,
        `"${d.deliveryMethod}"`,
        `"${d.status}"`
      ]);
    } else if (activeReportTab === 'transit') {
      headers = ['Tracking No', 'Delivery No', 'Current Location', 'Status', 'Delayed', 'Reason', 'Reported At'];
      rows = trackingRecords.map(t => [
        `"${t.trackingNumber}"`,
        `"${t.deliveryNumber}"`,
        `"${t.currentLocation}"`,
        `"${t.status}"`,
        t.delayed ? 'Yes' : 'No',
        `"${t.delayReason || 'None'}"`,
        `"${new Date(t.timestamp).toLocaleString()}"`
      ]);
    } else if (activeReportTab === 'installations') {
      headers = ['Completion No', 'Installation No', 'Customer', 'Product', 'Technician', 'Checklist Score', 'Result', 'Status'];
      rows = installationCompletions.map(c => [
        `"${c.completionNumber}"`,
        `"${c.installationNumber}"`,
        `"${c.customerName}"`,
        `"${c.productName}"`,
        `"${c.technician}"`,
        `"${Object.values(c.checklist || {}).filter(v => v === 'Pass').length}/7"`,
        `"${c.overallResult}"`,
        `"${c.status}"`
      ]);
    }

    if (rows.length === 0) {
      showToast?.('No rows to export for current filter', 'info');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.(`Exported ${activeReportTab} report to CSV`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Delivery Table Columns
  const deliveryColumns = [
    {
      header: 'Delivery No',
      accessor: 'deliveryNumber',
      render: (r) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{r.deliveryNumber}</span>
    },
    {
      header: 'SO Ref',
      accessor: 'soNumber',
      render: (r) => <span className="font-mono" style={{ color: '#818CF8' }}>{r.soNumber || 'SO-001'}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (r) => <strong style={{ color: '#fff' }}>{r.customerName}</strong>
    },
    {
      header: 'Product & Qty',
      accessor: 'productName',
      render: (r) => (
        <span>
          {r.productName} <span className="code-badge" style={{ marginLeft: 6 }}>{r.plannedDeliveryQuantity} Units</span>
        </span>
      )
    },
    {
      header: 'Transport Method',
      accessor: 'deliveryMethod',
      render: (r) => (
        <span className="badge badge-info">
          {r.deliveryMethod}
        </span>
      )
    },
    {
      header: 'Delivery Date',
      accessor: 'deliveryDate',
      render: (r) => (r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : '-')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Tracking Table Columns
  const trackingColumns = [
    {
      header: 'Tracking No',
      accessor: 'trackingNumber',
      render: (r) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{r.trackingNumber}</span>
    },
    {
      header: 'Delivery Ref',
      accessor: 'deliveryNumber',
      render: (r) => <span className="font-mono" style={{ color: '#818CF8' }}>{r.deliveryNumber}</span>
    },
    {
      header: 'Current Location',
      accessor: 'currentLocation',
      render: (r) => <strong style={{ color: '#fff' }}>{r.currentLocation}</strong>
    },
    {
      header: 'Delay Status',
      accessor: 'delayed',
      render: (r) => (
        <span className={`badge ${r.delayed ? 'badge-danger' : 'badge-success'}`}>
          {r.delayed ? `Delayed: ${r.delayReason || 'Transit issue'}` : 'On Schedule'}
        </span>
      )
    },
    {
      header: 'Milestone Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Installation Columns
  const installationColumns = [
    {
      header: 'Completion No',
      accessor: 'completionNumber',
      render: (r) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{r.completionNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (r) => <strong style={{ color: '#fff' }}>{r.customerName}</strong>
    },
    {
      header: 'Equipment',
      accessor: 'productName',
      render: (r) => r.productName
    },
    {
      header: 'Service Engineer',
      accessor: 'technician',
      render: (r) => r.technician
    },
    {
      header: 'Quality Checklist',
      accessor: 'checklist',
      render: (r) => {
        const passed = Object.values(r.checklist || {}).filter(v => v === 'Pass').length;
        return (
          <span className={`badge ${passed === 7 ? 'badge-success' : 'badge-danger'}`}>
            {passed} / 7 Pass
          </span>
        );
      }
    },
    {
      header: 'Overall Result',
      accessor: 'overallResult',
      render: (r) => (
        <span className={`badge ${r.overallResult === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
          {r.overallResult === 'Pass' ? 'PASSED' : 'RETEST REQUIRED'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  return (
    <div className="module-container">
      {/* 5 Executive KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard
          title="Total Deliveries"
          value={totalDeliveries}
          subtext="All scheduled customer shipments"
          icon={Truck}
          color="#06B6D4"
        />
        <KpiCard
          title="Active In Transit"
          value={inTransitCount}
          subtext="Shipments on road or with carrier"
          icon={Navigation}
          color="#3B82F6"
        />
        <KpiCard
          title="Delivered (POD)"
          value={deliveredCount}
          subtext="Signed proof of delivery received"
          icon={PackageCheck}
          color="#10B981"
        />
        <KpiCard
          title="On-Time Rate"
          value={`${onTimeRate}%`}
          subtext={`${delayedCount} delayed shipments logged`}
          icon={Clock}
          color={onTimeRate >= 90 ? '#10B981' : '#F59E0B'}
        />
        <KpiCard
          title="Installation Pass Rate"
          value={`${installationPassRate}%`}
          subtext={`${passedInstallations} of ${installationCompletions.length || 0} passed on first test`}
          icon={Wrench}
          color={installationPassRate >= 90 ? '#10B981' : '#F59E0B'}
        />
      </div>

      {/* Sub-Reports Tab Switcher & Export Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeReportTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('deliveries')}
          >
            <Truck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Delivery Status Master
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('transit')}
          >
            <Navigation size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Transit & Delay Log
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'installations' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('installations')}
          >
            <Wrench size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Installation & QA Pass Rate
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeReportTab === 'deliveries' && (
        <div>
          {/* Method and Status Filters Bar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter By:</span>
            <select
              className="select-filter"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="All">All Transport Methods</option>
              <option value="Company Vehicle">Company Vehicle</option>
              <option value="Courier / Transport">Courier / Transport</option>
            </select>

            <select
              className="select-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <DataTable
            title="Customer Delivery Status Master"
            subtitle="Consolidated shipment manifest with transport method breakdown and delivery dates"
            columns={deliveryColumns}
            data={filteredDeliveries}
          />
        </div>
      )}

      {activeReportTab === 'transit' && (
        <DataTable
          title="Shipment Transit & Milestone Log"
          subtitle="Real-time waypoint records, toll checkpoints, and delay classification audit"
          columns={trackingColumns}
          data={trackingRecords}
        />
      )}

      {activeReportTab === 'installations' && (
        <DataTable
          title="On-Site Commissioning & Acceptance Reports"
          subtitle="7-point checklist verification results, technical telemetry, and customer sign-off ledger"
          columns={installationColumns}
          data={installationCompletions}
        />
      )}
    </div>
  );
}
