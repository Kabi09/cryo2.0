import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  DollarSign,
  Trophy,
  XCircle,
  ShoppingBag,
  FileSpreadsheet,
  MessageSquarePlus,
  Users
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import KpiCard from '../common/KpiCard';

export default function SalesReportsModule({ reportsData, showToast }) {
  const [activeReportTab, setActiveReportTab] = useState('enquiries');

  const kpis = reportsData?.kpis || {
    totalEnquiries: 24,
    totalQuotations: 12,
    wonDeals: 6,
    lostDeals: 3,
    totalSalesOrders: 15,
    totalOrderValue: 2700000,
    pendingPayments: 950000
  };

  const reports = reportsData?.reports || {
    enquiries: [],
    leads: [],
    quotations: [],
    salesOrders: [],
    customers: [],
    payments: []
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Cryo_Sales_Report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'enquiries') {
      headers = ['Enquiry No', 'Date', 'Customer', 'Product', 'Quantity', 'Source', 'Status'];
      rows = (reports.enquiries || []).map(r => [
        `"${r.enquiryNumber}"`,
        `"${new Date(r.enquiryDate).toLocaleDateString('en-GB')}"`,
        `"${r.companyName}"`,
        `"${r.product?.productName || ''}"`,
        r.quantity,
        `"${r.enquirySource}"`,
        `"${r.status}"`
      ]);
    } else if (activeReportTab === 'leads') {
      headers = ['Lead No', 'Customer', 'Product', 'Expected Quantity', 'Expected Value (INR)', 'Status', 'Owner'];
      rows = (reports.leads || []).map(r => [
        `"${r.leadNumber}"`,
        `"${r.customer?.companyName || ''}"`,
        `"${r.interestedProduct?.productName || ''}"`,
        r.expectedQuantity,
        r.expectedOrderValue,
        `"${r.leadStatus}"`,
        `"${r.leadOwner}"`
      ]);
    } else if (activeReportTab === 'quotations') {
      headers = ['Quotation No', 'Version', 'Customer', 'Date', 'Total Amount (INR)', 'Status'];
      rows = (reports.quotations || []).map(r => [
        `"${r.quotationNumber}"`,
        `"${r.version}"`,
        `"${r.customer?.companyName || ''}"`,
        `"${new Date(r.quotationDate).toLocaleDateString('en-GB')}"`,
        r.grandTotal,
        `"${r.status}"`
      ]);
    } else if (activeReportTab === 'salesOrders') {
      headers = ['SO No', 'Date', 'Customer', 'Order Amount (INR)', 'Advance Received', 'Delivery Target', 'Status'];
      rows = (reports.salesOrders || []).map(r => [
        `"${r.soNumber}"`,
        `"${new Date(r.soDate).toLocaleDateString('en-GB')}"`,
        `"${r.customer?.companyName || ''}"`,
        r.orderAmount,
        r.advanceReceived,
        `"${new Date(r.expectedDeliveryDate).toLocaleDateString('en-GB')}"`,
        `"${r.status}"`
      ]);
    } else if (activeReportTab === 'customers') {
      headers = ['Customer Code', 'Company Name', 'Contact Person', 'Phone', 'City', 'Payment Terms'];
      rows = (reports.customers || []).map(r => [
        `"${r.customerCode}"`,
        `"${r.companyName}"`,
        `"${r.contactPerson}"`,
        `"${r.mobileNumber}"`,
        `"${r.city}"`,
        `"${r.paymentTerms}"`
      ]);
    } else {
      headers = ['Payment No', 'Customer', 'PI Ref', 'Amount (INR)', 'Method', 'Date', 'Status'];
      rows = (reports.payments || []).map(r => [
        `"${r.paymentNumber}"`,
        `"${r.customer?.companyName || ''}"`,
        `"${r.piReference?.piNumber || ''}"`,
        r.amountReceived,
        `"${r.paymentMethod}"`,
        `"${new Date(r.paymentDate).toLocaleDateString('en-GB')}"`,
        `"${r.status}"`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report CSV successfully generated & downloaded', 'success');
  };

  // Columns for each tab
  const enquiryCols = [
    { header: 'Enquiry No', accessor: 'enquiryNumber', render: (r) => <span className="code-badge">{r.enquiryNumber}</span> },
    { header: 'Customer', accessor: 'companyName', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.companyName}</strong> },
    { header: 'Product', render: (r) => r.product?.productName },
    { header: 'Quantity', accessor: 'quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { header: 'Source', accessor: 'enquirySource', render: (r) => <span className="nav-badge-pill">{r.enquirySource}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  const leadCols = [
    { header: 'Lead No', accessor: 'leadNumber', render: (r) => <span className="code-badge">{r.leadNumber}</span> },
    { header: 'Customer', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.customer?.companyName}</strong> },
    { header: 'Interested Product', render: (r) => r.interestedProduct?.productName },
    { header: 'Expected Value', accessor: 'expectedOrderValue', render: (r) => `₹${r.expectedOrderValue?.toLocaleString('en-IN')}` },
    { header: 'Lead Status', accessor: 'leadStatus', render: (r) => <StatusBadge status={r.leadStatus} /> },
    { header: 'Owner', accessor: 'leadOwner', render: (r) => r.leadOwner }
  ];

  const quotationCols = [
    { header: 'Quote No', accessor: 'quotationNumber', render: (r) => <span className="code-badge">{r.quotationNumber}</span> },
    { header: 'Version', accessor: 'version', render: (r) => <span className="badge badge-info">{r.version}</span> },
    { header: 'Customer', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.customer?.companyName}</strong> },
    { header: 'Date', render: (r) => new Date(r.quotationDate).toLocaleDateString('en-GB') },
    { header: 'Grand Total', accessor: 'grandTotal', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', color: '#16A36A', fontWeight: 700 }}>₹{r.grandTotal?.toLocaleString('en-IN')}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  const soCols = [
    { header: 'SO No', accessor: 'soNumber', render: (r) => <span className="code-badge">{r.soNumber}</span> },
    { header: 'Customer', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.customer?.companyName}</strong> },
    { header: 'Total Value', accessor: 'orderAmount', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', color: '#16A36A', fontWeight: 700 }}>₹{r.orderAmount?.toLocaleString('en-IN')}</span> },
    { header: 'Advance Recv', accessor: 'advanceReceived', render: (r) => `₹${r.advanceReceived?.toLocaleString('en-IN')}` },
    { header: 'Target Delivery', render: (r) => new Date(r.expectedDeliveryDate).toLocaleDateString('en-GB') },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  const customerCols = [
    { header: 'Code', accessor: 'customerCode', render: (r) => <span className="code-badge">{r.customerCode}</span> },
    { header: 'Company Name', accessor: 'companyName', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.companyName}</strong> },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Mobile', accessor: 'mobileNumber' },
    { header: 'City', accessor: 'city' },
    { header: 'Payment Terms', accessor: 'paymentTerms', render: (r) => <span className="nav-badge-pill">{r.paymentTerms}</span> }
  ];

  const paymentCols = [
    { header: 'Payment No', accessor: 'paymentNumber', render: (r) => <span className="code-badge">{r.paymentNumber}</span> },
    { header: 'Customer', render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.customer?.companyName}</strong> },
    { header: 'PI Ref', render: (r) => r.piReference?.piNumber },
    { header: 'Amount Received', accessor: 'amountReceived', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', color: '#16A36A', fontWeight: 700 }}>₹{r.amountReceived?.toLocaleString('en-IN')}</span> },
    { header: 'Channel', accessor: 'paymentMethod' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div>
      {/* 7 Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KpiCard title="Total Enquiries" value={kpis.totalEnquiries} subtext="Inward Prospect Demand" icon={MessageSquarePlus} color="#6366F1" />
        <KpiCard title="Total Quotations" value={kpis.totalQuotations} subtext="Proposals Generated" icon={FileSpreadsheet} color="#06B6D4" />
        <KpiCard title="Won Deals" value={kpis.wonDeals} subtext="Converted Orders" icon={Trophy} color="#10B981" />
        <KpiCard title="Lost Deals" value={kpis.lostDeals} subtext="Dropped Accounts" icon={XCircle} color="#EF4444" />
        <KpiCard title="Total Sales Orders" value={kpis.totalSalesOrders} subtext="Committed Orders" icon={ShoppingBag} color="#3B82F6" />
        <KpiCard title="Total Order Value" value={`₹${kpis.totalOrderValue?.toLocaleString('en-IN')}`} subtext="Total Booked Value" icon={DollarSign} color="#34D399" />
        <KpiCard title="Pending Payments" value={`₹${kpis.pendingPayments?.toLocaleString('en-IN')}`} subtext="Receivables to Collect" icon={DollarSign} color="#F59E0B" />
      </div>

      {/* Sub-Reports Tab Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeReportTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('enquiries')}
          >
            Enquiry Report
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('leads')}
          >
            Lead Report
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'quotations' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('quotations')}
          >
            Quotation Report
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'salesOrders' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('salesOrders')}
          >
            Sales Order Report
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('customers')}
          >
            Customer Report
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('payments')}
          >
            Payment Report
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV / Excel
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Active Tab Table */}
      {activeReportTab === 'enquiries' && (
        <DataTable columns={enquiryCols} data={reports.enquiries} searchPlaceholder="Filter enquiry report..." />
      )}
      {activeReportTab === 'leads' && (
        <DataTable columns={leadCols} data={reports.leads} searchPlaceholder="Filter lead pipeline report..." />
      )}
      {activeReportTab === 'quotations' && (
        <DataTable columns={quotationCols} data={reports.quotations} searchPlaceholder="Filter quotation report..." />
      )}
      {activeReportTab === 'salesOrders' && (
        <DataTable columns={soCols} data={reports.salesOrders} searchPlaceholder="Filter sales order report..." />
      )}
      {activeReportTab === 'customers' && (
        <DataTable columns={customerCols} data={reports.customers} searchPlaceholder="Filter customer directory report..." />
      )}
      {activeReportTab === 'payments' && (
        <DataTable columns={paymentCols} data={reports.payments} searchPlaceholder="Filter collections report..." />
      )}
    </div>
  );
}

