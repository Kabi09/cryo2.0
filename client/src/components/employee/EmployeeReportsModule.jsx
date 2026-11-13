import React, { useState } from 'react';
import {
  Users,
  Shield,
  Download,
  Printer,
  Building,
  Key,
  Calendar,
  Lock,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import KpiCard from '../common/KpiCard';

export default function EmployeeReportsModule({
  reportsData = {},
  employees = [],
  departments = [],
  roles = [],
  showToast
}) {
  const [activeReportTab, setActiveReportTab] = useState('roster');

  const totalStaff = employees.length || 6;
  const activeStaff = employees.filter(e => e.status === 'Active').length || 6;
  const deactStaff = employees.filter(e => e.status !== 'Active').length || 0;
  const auditLogs = reportsData?.auditLogs || [];

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    const filename = `Cryo_Workforce_${activeReportTab}_Report_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'roster') {
      headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Role', 'Email', 'Mobile', 'Joining Date', 'Status'];
      rows = employees.map(e => [
        `"${e.employeeId}"`,
        `"${e.name}"`,
        `"${e.departmentName || ''}"`,
        `"${e.designation}"`,
        `"${e.roleName || e.role?.name || ''}"`,
        `"${e.email}"`,
        `"${e.mobile}"`,
        `"${e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : ''}"`,
        `"${e.status}"`
      ]);
    } else if (activeReportTab === 'audit') {
      headers = ['Action', 'Performed By', 'Role', 'Target', 'IP Address', 'Timestamp'];
      rows = auditLogs.map(l => [
        `"${l.action}"`,
        `"${l.performedBy}"`,
        `"${l.performedByRole}"`,
        `"${l.target || ''}"`,
        `"${l.ipAddress || '127.0.0.1'}"`,
        `"${new Date(l.timestamp).toLocaleString()}"`
      ]);
    } else if (activeReportTab === 'departments') {
      headers = ['Department Code', 'Department Name', 'Head of Department', 'Total Staff', 'Status'];
      rows = departments.map(d => [
        `"${d.departmentCode}"`,
        `"${d.name}"`,
        `"${d.headOfDepartment}"`,
        d.staffCount || 0,
        `"${d.status}"`
      ]);
    }

    if (rows.length === 0) {
      showToast?.('No rows to export for current tab', 'info');
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

  // Columns for Employee Roster
  const rosterColumns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (r) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{r.employeeId}</span>
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (r) => <strong style={{ color: '#fff' }}>{r.name}</strong>
    },
    {
      header: 'Department',
      accessor: 'departmentName',
      render: (r) => r.departmentName || 'General'
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (r) => r.designation
    },
    {
      header: 'Role',
      accessor: 'roleName',
      render: (r) => <span className="badge badge-info">{r.roleName || r.role?.name}</span>
    },
    {
      header: 'Email & Contact',
      accessor: 'email',
      render: (r) => `${r.email} • ${r.mobile}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Columns for Audit Log
  const auditColumns = [
    {
      header: 'Action',
      accessor: 'action',
      render: (r) => <span className="code-badge">{r.action}</span>
    },
    {
      header: 'Actor (User)',
      accessor: 'performedBy',
      render: (r) => <strong style={{ color: '#fff' }}>@{r.performedBy}</strong>
    },
    {
      header: 'Actor Role',
      accessor: 'performedByRole',
      render: (r) => <span className="badge badge-info">{r.performedByRole}</span>
    },
    {
      header: 'Target Entity',
      accessor: 'target',
      render: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.target || '-'}</span>
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (r) => r.ipAddress || '127.0.0.1'
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (r) => (
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {new Date(r.timestamp).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* 5 Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard
          title="Total Headcount"
          value={totalStaff}
          subtext="Corporate roster size"
          icon={Users}
          color="#6366F1"
        />
        <KpiCard
          title="Active Credentials"
          value={activeStaff}
          subtext="Enabled for ERP access"
          icon={CheckCircle2}
          color="#10B981"
        />
        <KpiCard
          title="Suspended Staff"
          value={deactStaff}
          subtext="Deactivated access profiles"
          icon={AlertCircle}
          color="#EF4444"
        />
        <KpiCard
          title="Operating Divisions"
          value={departments.length}
          subtext="Configured company departments"
          icon={Building}
          color="#06B6D4"
        />
        <KpiCard
          title="Security Roles"
          value={roles.length}
          subtext="13-Module permission templates"
          icon={Shield}
          color="#F59E0B"
        />
      </div>

      {/* Tab Switcher & Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeReportTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('roster')}
          >
            <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Workforce Roster
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('audit')}
          >
            <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Security Audit Trail
          </button>
          <button
            className={`tab-btn ${activeReportTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('departments')}
          >
            <Building size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Division Allocation
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
      {activeReportTab === 'roster' && (
        <DataTable
          title="Corporate Workforce Roster"
          subtitle="Comprehensive employee register with role assignments, contact channels, and status"
          columns={rosterColumns}
          data={employees}
        />
      )}

      {activeReportTab === 'audit' && (
        <DataTable
          title="Security & Authorization Audit Ledger"
          subtitle="Chronological register of login occurrences, role modifications, and privilege adjustments"
          columns={auditColumns}
          data={auditLogs}
        />
      )}

      {activeReportTab === 'departments' && (
        <div className="table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>Departmental Headcount Breakdown</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Staffing capacity and management oversight per corporate unit</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dept Code</th>
                  <th>Department Name</th>
                  <th>Division Head</th>
                  <th>Staff Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d._id}>
                    <td><span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{d.departmentCode}</span></td>
                    <td><strong style={{ color: '#fff' }}>{d.name}</strong></td>
                    <td>{d.headOfDepartment}</td>
                    <td><span className="badge badge-info">{d.staffCount || 0} Members</span></td>
                    <td><StatusBadge status={d.status || 'Active'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

