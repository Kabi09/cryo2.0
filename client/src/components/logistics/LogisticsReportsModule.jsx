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
  Navigation
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
  const retestInstallations = installationCompletions.filter(c => c.overallResult === 'Fail').length;

  const onTimeRate = totalDeliveries > 0 ? Math.round(((totalDeliveries - delayedCount) / totalDeliveries) * 100) : 100;
  const installationPassRate = installationCompletions.length > 0 ? Math.round((passedInstallations / installationCompletions.length) * 100) : 100;

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
      header: 'DELIVERY NO',
      accessor: 'deliveryNumber',
      render: (r) => <span className="font-mono text-cyan-400 font-bold text-xs">{r.deliveryNumber}</span>
    },
    {
      header: 'CUSTOMER',
      accessor: 'customerName',
      render: (r) => <span className="text-slate-200 text-xs font-semibold">{r.customerName}</span>
    },
    {
      header: 'PRODUCT & QTY',
      accessor: 'productName',
      render: (r) => (
        <span className="text-slate-300 text-xs">
          {r.productName} <span className="text-cyan-400 font-mono">(Qty: {r.plannedDeliveryQuantity})</span>
        </span>
      )
    },
    {
      header: 'METHOD',
      accessor: 'deliveryMethod',
      render: (r) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {r.deliveryMethod}
        </span>
      )
    },
    {
      header: 'DATE',
      accessor: 'deliveryDate',
      render: (r) => <span className="text-xs text-slate-400">{r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : 'N/A'}</span>
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Tracking Table Columns
  const trackingColumns = [
    {
      header: 'TRACKING NO',
      accessor: 'trackingNumber',
      render: (r) => <span className="font-mono text-cyan-400 font-bold text-xs">{r.trackingNumber}</span>
    },
    {
      header: 'DELIVERY REF',
      accessor: 'deliveryNumber',
      render: (r) => <span className="text-xs text-slate-300 font-mono">{r.deliveryNumber}</span>
    },
    {
      header: 'CURRENT LOCATION',
      accessor: 'currentLocation',
      render: (r) => <span className="text-xs text-slate-200">{r.currentLocation}</span>
    },
    {
      header: 'DELAY STATUS',
      accessor: 'delayed',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
          r.delayed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          {r.delayed ? `Delayed: ${r.delayReason || 'Transit issue'}` : 'On Schedule'}
        </span>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Installation Columns
  const installationColumns = [
    {
      header: 'COMPLETION NO',
      accessor: 'completionNumber',
      render: (r) => <span className="font-mono text-emerald-400 font-bold text-xs">{r.completionNumber}</span>
    },
    {
      header: 'CUSTOMER',
      accessor: 'customerName',
      render: (r) => <span className="text-xs text-slate-200 font-semibold">{r.customerName}</span>
    },
    {
      header: 'EQUIPMENT',
      accessor: 'productName',
      render: (r) => <span className="text-xs text-slate-300">{r.productName}</span>
    },
    {
      header: 'ENGINEER',
      accessor: 'technician',
      render: (r) => <span className="text-xs text-slate-400">{r.technician}</span>
    },
    {
      header: 'RESULT',
      accessor: 'overallResult',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          r.overallResult === 'Pass' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
        }`}>
          {r.overallResult}
        </span>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BarChart3 className="w-6 h-6" />
            </span>
            Logistics & Delivery Intelligence Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            End-to-end delivery metrics, transit delay analysis, carrier SLAs, and commissioning quality ratios
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard
          label="Total Deliveries"
          value={totalDeliveries}
          icon={Truck}
          color="cyan"
          subtitle="All scheduled orders"
        />
        <KpiCard
          label="Active In Transit"
          value={inTransitCount}
          icon={Navigation}
          color="blue"
          subtitle="On road / carrier"
        />
        <KpiCard
          label="Delivered (POD)"
          value={deliveredCount}
          icon={PackageCheck}
          color="emerald"
          subtitle="Signed and received"
        />
        <KpiCard
          label="On-Time Rate"
          value={`${onTimeRate}%`}
          icon={Clock}
          color={onTimeRate >= 90 ? 'emerald' : 'amber'}
          subtitle={`${delayedCount} delayed shipments`}
        />
        <KpiCard
          label="Install Pass Rate"
          value={`${installationPassRate}%`}
          icon={Wrench}
          color={installationPassRate >= 90 ? 'emerald' : 'amber'}
          subtitle={`${passedInstallations} of ${installationCompletions.length} verified`}
        />
      </div>

      {/* Report Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveReportTab('deliveries')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeReportTab === 'deliveries'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Truck className="w-4 h-4" />
          Delivery Status Master
        </button>

        <button
          onClick={() => setActiveReportTab('transit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeReportTab === 'transit'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Transit & Delay Log
        </button>

        <button
          onClick={() => setActiveReportTab('installations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeReportTab === 'installations'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Installation & QA Pass Rate
        </button>
      </div>

      {/* Dynamic Report View */}
      {activeReportTab === 'deliveries' && (
        <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Delivery Movement Breakdown
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-[#161D2E] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Methods</option>
                <option value="Company Vehicle">Company Vehicle</option>
                <option value="Courier / Transport">Courier / Transport</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#161D2E] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Planned">Planned</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={deliveryColumns}
            data={filteredDeliveries}
            searchPlaceholder="Filter delivery reports..."
          />
        </div>
      )}

      {activeReportTab === 'transit' && (
        <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Real-Time Tracking & Delay Exceptions
            </h2>
          </div>
          <DataTable
            columns={trackingColumns}
            data={trackingRecords}
            searchPlaceholder="Search tracking numbers, locations..."
          />
        </div>
      )}

      {activeReportTab === 'installations' && (
        <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              On-Site Commissioning & Acceptance Reports
            </h2>
          </div>
          <DataTable
            columns={installationColumns}
            data={installationCompletions}
            searchPlaceholder="Search installations, tech..."
          />
        </div>
      )}
    </div>
  );
}

