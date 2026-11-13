import React, { useState } from 'react';
import { BarChart3, Download, Printer, TrendingUp, AlertTriangle, Layers, DollarSign, Clock } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import KpiCard from '../common/KpiCard';

export default function InventoryReportModule({ reportsData, showToast }) {
  const kpis = reportsData?.kpis || {
    totalMaterials: 0,
    totalSuppliers: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    pendingQC: 0,
    pendingPOs: 0
  };

  const rows = reportsData?.reports || [];

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRows = rows.filter(r => {
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const headers = ['Material Code', 'Material Name', 'Category', 'Unit', 'Contract Rate (INR)', 'Received', 'Issued', 'Available Stock', 'Stock Valuation (INR)', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map(r => [
        `"${r.materialCode}"`,
        `"${r.materialName.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.unit}"`,
        r.unitPrice,
        r.totalReceived,
        r.totalIssued,
        r.availableStock,
        r.stockValue,
        `"${r.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cryo_SCM_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Inventory Report CSV downloaded successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Material Code',
      accessor: 'materialCode',
      render: (row) => <span className="code-badge">{row.materialCode}</span>
    },
    {
      header: 'Material Description',
      accessor: 'materialName',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.materialName}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.category}</div>
        </div>
      )
    },
    {
      header: 'UOM',
      render: (row) => row.unit
    },
    {
      header: 'Avg Rate',
      accessor: 'unitPrice',
      render: (row) => row.unitPrice > 0 ? `₹${row.unitPrice}` : '—'
    },
    {
      header: 'Total QC Inward',
      accessor: 'totalReceived',
      render: (row) => `${row.totalReceived} ${row.unit}`
    },
    {
      header: 'Total Issued',
      accessor: 'totalIssued',
      render: (row) => `${row.totalIssued} ${row.unit}`
    },
    {
      header: 'Available Stock',
      accessor: 'availableStock',
      render: (row) => {
        const isLow = row.availableStock <= row.minimumStock;
        return (
          <span style={{
            fontWeight: 800,
            fontSize: '0.95rem',
            color: isLow ? '#F87171' : '#34D399',
            fontFamily: 'var(--font-mono)'
          }}>
            {row.availableStock} {row.unit}
          </span>
        );
      }
    },
    {
      header: 'Stock Valuation',
      accessor: 'stockValue',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
          ₹{row.stockValue?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Stock Health',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      {/* 6 Executive KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KpiCard
          title="Total Stock Value"
          value={`₹${(kpis.totalStockValue || 0).toLocaleString('en-IN')}`}
          subtext="Net Factory Valuation"
          icon={DollarSign}
          color="#34D399"
        />
        <KpiCard
          title="Active Materials"
          value={kpis.totalMaterials}
          subtext="Cataloged SKUs"
          icon={Layers}
          color="#3B82F6"
        />
        <KpiCard
          title="Low Stock Alerts"
          value={kpis.lowStockCount}
          subtext="Below Safety Threshold"
          icon={AlertTriangle}
          color="#EF4444"
        />
        <KpiCard
          title="Pending QC Inward"
          value={kpis.pendingQC}
          subtext="In Quarantine Bay"
          icon={Clock}
          color="#F59E0B"
        />
        <KpiCard
          title="Open Purchase Orders"
          value={kpis.pendingPOs}
          subtext="Awaiting Delivery"
          icon={TrendingUp}
          color="#60A5FA"
        />
        <KpiCard
          title="Active Suppliers"
          value={kpis.totalSuppliers}
          subtext="Approved Vendor Base"
          icon={BarChart3}
          color="#A78BFA"
        />
      </div>

      {/* Main Table with Filters & Export */}
      <DataTable
        columns={columns}
        data={filteredRows}
        searchPlaceholder="Filter reports by material..."
        filters={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Metals">Metals</option>
              <option value="Plastics">Plastics</option>
              <option value="Rubber">Rubber</option>
              <option value="Fasteners">Fasteners</option>
              <option value="Packaging">Packaging</option>
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock (Healthy)</option>
              <option value="Low Stock">Low Stock (Alert)</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        }
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={15} /> Export CSV
            </button>
            <button className="btn btn-outline" onClick={handlePrint}>
              <Printer size={15} /> Print Report
            </button>
          </div>
        }
      />
    </div>
  );
}

