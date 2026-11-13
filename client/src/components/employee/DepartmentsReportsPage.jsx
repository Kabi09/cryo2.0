import React, { useState } from 'react';
import DepartmentsModule from './DepartmentsModule';
import EmployeeReportsModule from './EmployeeReportsModule';
import { Building2, FileSpreadsheet } from 'lucide-react';

export default function DepartmentsReportsPage({
  departments,
  employeeReportsData,
  employees,
  roles,
  onSaveDepartment,
  showToast,
  defaultTab = 'departments'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Building2 size={14} style={{ marginRight: 6 }} />
            Corporate Departments ({departments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileSpreadsheet size={14} style={{ marginRight: 6 }} />
            Personnel Reports & Audit Logs
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'departments' && (
        <DepartmentsModule
          departments={departments}
          onSaveDepartment={onSaveDepartment}
          showToast={showToast}
        />
      )}

      {activeTab === 'reports' && (
        <EmployeeReportsModule
          reportsData={employeeReportsData}
          employees={employees}
          departments={departments}
          roles={roles}
          showToast={showToast}
        />
      )}
    </div>
  );
}

