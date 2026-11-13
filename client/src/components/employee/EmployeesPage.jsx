import React, { useState } from 'react';
import EmployeesModule from './EmployeesModule';
import EmployeeLoginModule from './EmployeeLoginModule';
import { Users, KeyRound } from 'lucide-react';

export default function EmployeesPage({
  employees,
  roles,
  departments,
  currentUser,
  onSaveEmployee,
  onUpdateEmployee,
  onResetPassword,
  onToggleStatus,
  onLogin,
  onLogout,
  showToast,
  defaultTab = 'directory'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Users size={14} style={{ marginRight: 6 }} />
            Staff Directory ({employees.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            <KeyRound size={14} style={{ marginRight: 6 }} />
            Employee Login & Role Simulation
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'directory' && (
        <EmployeesModule
          employees={employees}
          roles={roles}
          departments={departments}
          onSaveEmployee={onSaveEmployee}
          onUpdateEmployee={onUpdateEmployee}
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'auth' && (
        <EmployeeLoginModule
          currentUser={currentUser}
          onLogin={onLogin}
          onLogout={onLogout}
          showToast={showToast}
        />
      )}
    </div>
  );
}

