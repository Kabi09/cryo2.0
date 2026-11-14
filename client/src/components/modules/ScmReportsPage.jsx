import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import KpiCard from '../common/KpiCard';

export default function ScmReportsPage({
  reportsData = {},
  materials = [],
  suppliers = [],
  purchaseOrders = [],
  inventory = [],
  showToast
}) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const invRows = reportsData?.reports || inventory.map(i => ({
    materialCode: i.material?.materialCode || 'MAT',
    materialName: i.material?.materialName || 'Material',
    category: i.material?.category || 'General',
    unit: i.material?.unit || 'Kg',
    unitPrice: i.material?.standardPrice || 500,
    availableStock: i.availableStock || 0,
    minimumStock: i.minimumStock || 50,
    stockValue: (i.availableStock || 0) * (i.material?.standardPrice || 500),
    status: i.status || 'In Stock'
  }));

  // Filtered inventory rows
  const filteredInv = invRows.filter(r => {
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  // Shortage items
  const shortageRows = invRows.filter(r => (r.availableStock || 0) <= (r.minimumStock || 50));

  // Filtered POs
  const filteredPOs = purchaseOrders.filter(po => {
    if (statusFilter !== 'All' && po.status !== statusFilter) return false;
    if (supplierFilter !== 'All' && (po.supplier?._id || po.supplier) !== supplierFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    let headers = [];
    let csvData = [];
    let filename = '';

    if (activeTab === 'inventory') {
      headers = ['Material Code', 'Material Name', 'Category', 'Unit', 'Available Stock', 'Stock Valuation (INR)', 'Status'];
      csvData = filteredInv.map(r => [
        `"${r.materialCode}"`,
        `"${r.materialName.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.unit}"`,
        r.availableStock,
        r.stockValue,
        `"${r.status}"`
      ]);
      filename = `Cryo_SCM_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'purchasing') {
      headers = ['PO Number', 'Supplier', 'PO Date', 'Total Amount (INR)', 'Expected Date', 'Status'];
      csvData = filteredPOs.map(p => [
        `"${p.poNumber}"`,
        `"${p.supplier?.supplierName || ''}"`,
        `"${p.poDate ? new Date(p.poDate).toLocaleDateString() : ''}"`,
        p.totalAmount || 0,
        `"${p.expectedDeliveryDate ? new Date(p.expectedDeliveryDate).toLocaleDateString() : ''}"`,
        `"${p.status}"`
      ]);
      filename = `Cryo_SCM_Purchasing_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Material Code', 'Material Name', 'Current Stock', 'Reorder Level', 'Deficit Quantity', 'Status'];
      csvData = shortageRows.map(s => [
        `"${s.materialCode}"`,
        `"${s.materialName}"`,
        s.availableStock,
        s.minimumStock,
        Math.max(0, s.minimumStock - s.availableStock),
        `"${s.status}"`
      ]);
      filename = `Cryo_SCM_Shortages_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (csvData.length === 0) {
      showToast('No records available to export', 'error');
      return;
    }

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported successfully!', 'success');
  };

  return (
    <div className="module-container">
      {/* Top Header & Sub-Tabs */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={14} style={{ marginRight: 6 }} />
            Current Inventory ({filteredInv.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'purchasing' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchasing')}
          >
            <ShoppingCart size={14} style={{ marginRight: 6 }} />
            Purchasing Summary ({filteredPOs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'shortages' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortages')}
          >
            <AlertTriangle size={14} style={{ marginRight: 6, color: shortageRows.length > 0 ? 'var(--danger)' : 'inherit' }} />
            Stock Shortages ({shortageRows.length})
          </button>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Tab 1: Current Inventory Report */}
      {activeTab === 'inventory' && (
        <div className="table-card">
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Warehouse Inventory Balance & Valuation Ledger
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className="form-control"
                style={{ width: 140, height: 32, fontSize: '0.78rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical Shortage">Critical Shortage</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Available Stock</th>
                  <th>Valuation (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInv.map((r, idx) => (
                  <tr key={idx}>
                    <td><span className="code-badge">{r.materialCode}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{r.materialName}</strong></td>
                    <td>{r.category}</td>
                    <td>{r.unit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.availableStock}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>₹{Number(r.stockValue || 0).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {filteredInv.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No inventory records matching selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Purchasing Report */}
      {activeTab === 'purchasing' && (
        <div className="table-card">
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Purchase Order Commercial Tracking Summary
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className="form-control"
                style={{ width: 140, height: 32, fontSize: '0.78rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Issued">Issued</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>PO Date</th>
                  <th>Total Amount</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po, idx) => (
                  <tr key={po._id || idx}>
                    <td><span className="code-badge">{po.poNumber}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{po.supplier?.supplierName || '—'}</strong></td>
                    <td style={{ fontSize: '0.78rem' }}>{po.poDate ? new Date(po.poDate).toLocaleDateString('en-GB') : '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{Number(po.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.78rem' }}>{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-GB') : '—'}</td>
                    <td><StatusBadge status={po.status} /></td>
                  </tr>
                ))}
                {filteredPOs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No purchase orders matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Shortage Report */}
      {activeTab === 'shortages' && (
        <div className="table-card">
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Critical Raw Material Reorder Alerts
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Material Name</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Deficit Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shortageRows.map((s, idx) => {
                  const deficit = Math.max(0, (s.minimumStock || 50) - (s.availableStock || 0));
                  return (
                    <tr key={idx}>
                      <td><span className="code-badge">{s.materialCode}</span></td>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{s.materialName}</strong></td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontWeight: 700 }}>{s.availableStock}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.minimumStock || 50}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontWeight: 600 }}>-{deficit}</td>
                      <td><StatusBadge status={s.status} /></td>
                    </tr>
                  );
                })}
                {shortageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      All raw material inventory balances exceed minimum reorder safety levels.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
