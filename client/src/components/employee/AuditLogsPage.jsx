import React, { useState } from 'react';
import EmployeeReportsModule from './EmployeeReportsModule';
import { ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function AuditLogsPage({
  reportsData = {},
  employees = [],
  departments = [],
  roles = [],
  showToast,
  defaultTab = 'audit'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            Activity History & Audit Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            <FileSpreadsheet size={14} style={{ marginRight: 6 }} />
            Workforce Personnel Reports
          </button>
        </div>
      </div>

      <EmployeeReportsModule
        reportsData={reportsData}
        employees={employees}
        departments={departments}
        roles={roles}
        showToast={showToast}
        initialTab={activeTab}
      />
    </div>
  );
}
