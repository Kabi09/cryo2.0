import React from 'react';
import KpiCard from '../common/KpiCard';
import StatusBadge from '../common/StatusBadge';
import {
  Users,
  UserCheck,
  UserX,
  Building,
  Shield,
  Clock,
  ArrowRight,
  ShieldCheck,
  Key,
  Calendar
} from 'lucide-react';

export default function EmployeeDashboardModule({
  dashboardData,
  departments = [],
  roles = [],
  employees = [],
  onNavigateModule
}) {
  const kpis = dashboardData?.kpis || {
    totalEmployees: employees.length || 6,
    activeEmployees: employees.filter(e => e.status === 'Active').length || 6,
    inactiveEmployees: employees.filter(e => e.status !== 'Active').length || 0,
    departmentsCount: departments.length || 6,
    rolesCount: roles.length || 7
  };

  const recentEmployees = dashboardData?.recentEmployees || employees.slice(0, 5);
  const recentAuditLogs = dashboardData?.recentAuditLogs || [];

  return (
    <div className="module-container">
      {/* 5 Executive KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard
          title="Total Workforce"
          value={kpis.totalEmployees}
          subtext="Registered employee directory"
          icon={Users}
          color="#6366F1"
        />
        <KpiCard
          title="Active Personnel"
          value={kpis.activeEmployees}
          subtext="Active system credentials"
          icon={UserCheck}
          color="#10B981"
        />
        <KpiCard
          title="Deactivated Staff"
          value={kpis.inactiveEmployees}
          subtext="Suspended access profiles"
          icon={UserX}
          color="#EF4444"
        />
        <KpiCard
          title="Departments"
          value={kpis.departmentsCount}
          subtext="Corporate operational units"
          icon={Building}
          color="#06B6D4"
        />
        <KpiCard
          title="Configured Roles"
          value={kpis.rolesCount}
          subtext="13-Module RBAC matrices"
          icon={Shield}
          color="#F59E0B"
        />
      </div>

      {/* Two Column Layout: Departmental Staffing & Recent Staff */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Department Distribution Card */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>Departmental Headcount</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Workforce distribution across divisions</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateModule?.('departments')}
            >
              Manage <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {departments.map(d => (
              <div
                key={d._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{d.name}</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: {d.headOfDepartment}</div>
                </div>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  <Users size={11} /> {d.staffCount || 0} Staff
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Quick Link Card */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>Access Control Matrix</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role-based security configuration</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateModule?.('roles')}
            >
              Matrix <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roles.slice(0, 5).map(r => (
              <div
                key={r._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.84rem', color: r.isSuperAdmin ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {r.isSuperAdmin ? '👑 ' : ''}{r.name}
                    </strong>
                    <span className="badge badge-info" style={{ fontSize: '0.66rem' }}>{r.department}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.description}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="table-card" style={{ marginBottom: 24 }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Personnel Profiles</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active employee credentials in ERP</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigateModule?.('employees')}
          >
            All Employees <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp._id}>
                  <td><span className="code-badge">{emp.employeeId}</span></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{emp.name}</strong></td>
                  <td>{emp.departmentName || 'General'}</td>
                  <td>{emp.designation}</td>
                  <td><span className="badge badge-info">{emp.roleName || emp.role?.name}</span></td>
                  <td><StatusBadge status={emp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

