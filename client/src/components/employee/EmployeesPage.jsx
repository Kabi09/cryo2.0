import React, { useState } from 'react';
import EmployeesModule from './EmployeesModule';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function EmployeesPage({
  employees = [],
  roles = [],
  departments = [],
  currentUser,
  onSaveEmployee,
  onUpdateEmployee,
  onResetPassword,
  onToggleStatus,
  showToast,
  defaultTab = 'all'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const activeEmployees = employees.filter(e => e.status === 'Active');
  const inactiveEmployees = employees.filter(e => e.status !== 'Active');

  const displayedList = activeTab === 'active'
    ? activeEmployees
    : activeTab === 'inactive'
    ? inactiveEmployees
    : employees;

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Users size={14} style={{ marginRight: 6 }} />
            All Employees ({employees.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <UserCheck size={14} style={{ marginRight: 6 }} />
            Active ({activeEmployees.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveTab('inactive')}
          >
            <UserX size={14} style={{ marginRight: 6 }} />
            Inactive ({inactiveEmployees.length})
          </button>
        </div>
      </div>

      <EmployeesModule
        employees={displayedList}
        allEmployees={employees}
        roles={roles}
        departments={departments}
        onSaveEmployee={onSaveEmployee}
        onUpdateEmployee={onUpdateEmployee}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        showToast={showToast}
      />
    </div>
  );
}
