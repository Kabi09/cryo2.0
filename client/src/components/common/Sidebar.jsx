import React, { useState } from 'react';
import {
  Boxes,
  Briefcase,
  Factory,
  Truck,
  Users,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  X
} from 'lucide-react';

export const SCM_MODULES = [
  { id: 'scm-materials', num: '01', title: 'Raw Material Master' },
  { id: 'scm-suppliers', num: '02', title: 'Suppliers' },
  { id: 'scm-supplier-links', num: '03', title: 'Supplier Material Link' },
  { id: 'scm-purchase-orders', num: '04', title: 'Purchase Orders (PO)' },
  { id: 'scm-grn', num: '05', title: 'GRN – Goods Receipt' },
  { id: 'scm-qc-tests', num: '06', title: 'QC Tests' },
  { id: 'scm-inventory', num: '07', title: 'Raw Material Inventory' },
  { id: 'scm-material-issues', num: '08', title: 'Material Issue to Production' },
  { id: 'scm-supplier-returns', num: '09', title: 'Returns to Supplier' },
  { id: 'scm-reports', num: '10', title: 'Inventory Report' }
];

export const SALES_MODULES = [
  { id: 'sales-dashboard', num: '01', title: 'Dashboard' },
  { id: 'sales-enquiries', num: '02', title: 'Customer Enquiries' },
  { id: 'sales-customers-leads', num: '03', title: 'Customers & Leads' },
  { id: 'sales-follow-ups', num: '04', title: 'Follow-ups' },
  { id: 'sales-quotations', num: '05', title: 'Quotations' },
  { id: 'sales-proforma-invoices', num: '06', title: 'Proforma Invoices (PI)' },
  { id: 'sales-customer-pos', num: '07', title: 'Customer Purchase Orders' },
  { id: 'sales-payments', num: '08', title: 'Payments' },
  { id: 'sales-sales-orders', num: '09', title: 'Sales Orders (SO)' },
  { id: 'sales-reports', num: '10', title: 'Sales Reports' }
];

export const PRODUCTION_MODULES = [
  { id: 'production-dashboard', num: '01', title: 'Dashboard' },
  { id: 'production-planning', num: '02', title: 'Production Planning' },
  { id: 'production-bom', num: '03', title: 'BOM – Bill of Materials' },
  { id: 'production-schedule', num: '04', title: 'Production Schedule' },
  { id: 'production-material-requests', num: '05', title: 'Material Requests' },
  { id: 'production-material-issue', num: '06', title: 'Material Issue' },
  { id: 'production-execution', num: '07', title: 'Production Execution' },
  { id: 'production-updates', num: '08', title: 'Production Updates' },
  { id: 'production-completion', num: '09', title: 'Production Completion' },
  { id: 'production-qa', num: '10', title: 'Quality Assurance (QA)' },
  { id: 'production-rework', num: '11', title: 'Rework / Rebuild' },
  { id: 'production-finished-goods', num: '12', title: 'Finished Goods' }
];

export const LOGISTICS_MODULES = [
  { id: 'logistics-dashboard', num: '01', title: 'Dashboard' },
  { id: 'logistics-planning', num: '02', title: 'Delivery Planning' },
  { id: 'logistics-vehicles-couriers', num: '03', title: 'Vehicle & Courier' },
  { id: 'logistics-dispatch', num: '04', title: 'Dispatch' },
  { id: 'logistics-tracking', num: '05', title: 'Delivery Tracking' },
  { id: 'logistics-confirmation', num: '06', title: 'Delivery Confirmation' },
  { id: 'logistics-installation', num: '07', title: 'Installation' },
  { id: 'logistics-installation-completion', num: '08', title: 'Installation Completion' },
  { id: 'logistics-reports', num: '09', title: 'Logistics Reports' }
];

export const EMPLOYEE_MODULES = [
  { id: 'employee-dashboard', num: '01', title: 'Dashboard' },
  { id: 'employee-directory', num: '02', title: 'Employees' },
  { id: 'employee-roles-permissions', num: '03', title: 'Roles & Permissions' },
  { id: 'employee-departments', num: '04', title: 'Departments' },
  { id: 'employee-login', num: '05', title: 'Employee Login' },
  { id: 'employee-reports', num: '06', title: 'Employee Reports' }
];

/**
 * Pixel-perfect SVG tree branch connector with curved drop and directional arrow
 * Matches the exact tree structure from user reference screenshot
 */
function TreeBranchArrow({ isLast, isActive }) {
  return (
    <div className="tree-branch-box" aria-hidden="true">
      <svg
        width="22"
        height="36"
        viewBox="0 0 22 36"
        fill="none"
        className="tree-branch-svg"
      >
        {/* Vertical trunk line */}
        <path
          d={isLast ? "M 3 0 V 15" : "M 3 0 V 36"}
          stroke="rgba(0, 0, 0, 0.12)"
          strokeWidth="1.5"
        />
        {/* Smooth curved branch leading into item */}
        <path
          d="M 3 0 V 13 C 3 18, 6 21, 11 21 H 17"
          stroke={isActive ? "#2451C5" : "rgba(0, 0, 0, 0.22)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="tree-branch-curve"
          fill="none"
        />
        {/* Right-pointing arrow tip */}
        <path
          d="M 13 18 L 17 21 L 13 24"
          stroke={isActive ? "#2451C5" : "rgba(0, 0, 0, 0.22)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tree-branch-arrow"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function Sidebar({
  activeDomain,
  onSelectDomain,
  activeModule,
  onSelectModule,
  isOpen,
  onClose
}) {
  // Accordion state: SCM, Sales, Production, Logistics, and Employee can be expanded/collapsed independently
  const [openDropdowns, setOpenDropdowns] = useState({
    scm: true,
    sales: true,
    production: true,
    logistics: true,
    employee: true
  });

  const toggleDropdown = (key, defaultModule) => {
    setOpenDropdowns((prev) => {
      const willOpen = !prev[key];
      if (willOpen && activeDomain !== key && defaultModule) {
        onSelectDomain(key);
        onSelectModule(defaultModule, key);
      }
      return {
        ...prev,
        [key]: willOpen
      };
    });
  };

  const handleModuleClick = (moduleId, domain) => {
    if (activeDomain !== domain) {
      onSelectDomain(domain);
    }
    onSelectModule(moduleId, domain);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">C</div>
          <div className="sidebar-brand">
            <h2>Cryo Enterprise</h2>
            <p>SCM • Sales • Prod • Log • HR</p>
          </div>
          <button 
            className="mobile-menu-btn" 
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tree Accordion Navigation */}
        <div className="sidebar-nav">
          <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Enterprise Modules</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>47 TABS</span>
          </div>

          {/* ======================================================== */}
          {/* 1. SUPPLY CHAIN MANAGEMENT DROPDOWN GROUP                */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group">
            <div
              className={`tree-parent-header ${activeDomain === 'scm' ? 'active-parent' : ''}`}
              onClick={() => toggleDropdown('scm', 'scm-materials')}
            >
              <div className="tree-parent-left">
                <div className="tree-parent-icon scm-icon-box">
                  <Boxes size={18} />
                </div>
                <div className="tree-parent-text">
                  <span className="tree-parent-title">Supply Chain</span>
                  <span className="tree-parent-subtitle">10 Modules</span>
                </div>
              </div>
              <div className="tree-parent-right">
                <span className="tree-badge">10</span>
                {openDropdowns.scm ? (
                  <ChevronUp size={16} className="tree-chevron open" />
                ) : (
                  <ChevronDown size={16} className="tree-chevron" />
                )}
              </div>
            </div>

            {openDropdowns.scm && (
              <div className="tree-child-container">
                {SCM_MODULES.map((mod, index) => {
                  const isActive = activeModule === mod.id;
                  const isLast = index === SCM_MODULES.length - 1;

                  return (
                    <div
                      key={mod.id}
                      className={`tree-child-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(mod.id, 'scm')}
                    >
                      <TreeBranchArrow isLast={isLast} isActive={isActive} />
                      <div className="tree-child-label-box">
                        <span className="tree-child-text">{mod.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. SALES MANAGEMENT DROPDOWN GROUP                       */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group" style={{ marginTop: 10 }}>
            <div
              className={`tree-parent-header ${activeDomain === 'sales' ? 'active-parent' : ''}`}
              onClick={() => toggleDropdown('sales', 'sales-dashboard')}
            >
              <div className="tree-parent-left">
                <div className="tree-parent-icon sales-icon-box">
                  <Briefcase size={18} />
                </div>
                <div className="tree-parent-text">
                  <span className="tree-parent-title">Sales Management</span>
                  <span className="tree-parent-subtitle">10 Modules</span>
                </div>
              </div>
              <div className="tree-parent-right">
                <span className="tree-badge">10</span>
                {openDropdowns.sales ? (
                  <ChevronUp size={16} className="tree-chevron open" />
                ) : (
                  <ChevronDown size={16} className="tree-chevron" />
                )}
              </div>
            </div>

            {openDropdowns.sales && (
              <div className="tree-child-container">
                {SALES_MODULES.map((mod, index) => {
                  const isActive = activeModule === mod.id;
                  const isLast = index === SALES_MODULES.length - 1;

                  return (
                    <div
                      key={mod.id}
                      className={`tree-child-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(mod.id, 'sales')}
                    >
                      <TreeBranchArrow isLast={isLast} isActive={isActive} />
                      <div className="tree-child-label-box">
                        <span className="tree-child-text">{mod.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. PRODUCTION MANAGEMENT DROPDOWN GROUP                  */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group" style={{ marginTop: 10 }}>
            <div
              className={`tree-parent-header ${activeDomain === 'production' ? 'active-parent' : ''}`}
              onClick={() => toggleDropdown('production', 'production-dashboard')}
            >
              <div className="tree-parent-left">
                <div className="tree-parent-icon production-icon-box">
                  <Factory size={18} />
                </div>
                <div className="tree-parent-text">
                  <span className="tree-parent-title">Production</span>
                  <span className="tree-parent-subtitle">12 Modules</span>
                </div>
              </div>
              <div className="tree-parent-right">
                <span className="tree-badge">12</span>
                {openDropdowns.production ? (
                  <ChevronUp size={16} className="tree-chevron open" />
                ) : (
                  <ChevronDown size={16} className="tree-chevron" />
                )}
              </div>
            </div>

            {openDropdowns.production && (
              <div className="tree-child-container">
                {PRODUCTION_MODULES.map((mod, index) => {
                  const isActive = activeModule === mod.id;
                  const isLast = index === PRODUCTION_MODULES.length - 1;

                  return (
                    <div
                      key={mod.id}
                      className={`tree-child-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(mod.id, 'production')}
                    >
                      <TreeBranchArrow isLast={isLast} isActive={isActive} />
                      <div className="tree-child-label-box">
                        <span className="tree-child-text">{mod.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 4. LOGISTICS & DELIVERY DROPDOWN GROUP                   */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group" style={{ marginTop: 10 }}>
            <div
              className={`tree-parent-header ${activeDomain === 'logistics' ? 'active-parent' : ''}`}
              onClick={() => toggleDropdown('logistics', 'logistics-dashboard')}
            >
              <div className="tree-parent-left">
                <div className="tree-parent-icon logistics-icon-box">
                  <Truck size={18} />
                </div>
                <div className="tree-parent-text">
                  <span className="tree-parent-title">Logistics & Delivery</span>
                  <span className="tree-parent-subtitle">9 Modules</span>
                </div>
              </div>
              <div className="tree-parent-right">
                <span className="tree-badge">9</span>
                {openDropdowns.logistics ? (
                  <ChevronUp size={16} className="tree-chevron open" />
                ) : (
                  <ChevronDown size={16} className="tree-chevron" />
                )}
              </div>
            </div>

            {openDropdowns.logistics && (
              <div className="tree-child-container">
                {LOGISTICS_MODULES.map((mod, index) => {
                  const isActive = activeModule === mod.id;
                  const isLast = index === LOGISTICS_MODULES.length - 1;

                  return (
                    <div
                      key={mod.id}
                      className={`tree-child-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(mod.id, 'logistics')}
                    >
                      <TreeBranchArrow isLast={isLast} isActive={isActive} />
                      <div className="tree-child-label-box">
                        <span className="tree-child-text">{mod.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 5. EMPLOYEE MANAGEMENT & RBAC DROPDOWN GROUP             */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group" style={{ marginTop: 10 }}>
            <div
              className={`tree-parent-header ${activeDomain === 'employee' ? 'active-parent' : ''}`}
              onClick={() => toggleDropdown('employee', 'employee-dashboard')}
            >
              <div className="tree-parent-left">
                <div className="tree-parent-icon employee-icon-box">
                  <Users size={18} />
                </div>
                <div className="tree-parent-text">
                  <span className="tree-parent-title">Employee Management</span>
                  <span className="tree-parent-subtitle">6 Modules • RBAC</span>
                </div>
              </div>
              <div className="tree-parent-right">
                <span className="tree-badge">6</span>
                {openDropdowns.employee ? (
                  <ChevronUp size={16} className="tree-chevron open" />
                ) : (
                  <ChevronDown size={16} className="tree-chevron" />
                )}
              </div>
            </div>

            {openDropdowns.employee && (
              <div className="tree-child-container">
                {EMPLOYEE_MODULES.map((mod, index) => {
                  const isActive = activeModule === mod.id;
                  const isLast = index === EMPLOYEE_MODULES.length - 1;

                  return (
                    <div
                      key={mod.id}
                      className={`tree-child-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleModuleClick(mod.id, 'employee')}
                    >
                      <TreeBranchArrow isLast={isLast} isActive={isActive} />
                      <div className="tree-child-label-box">
                        <span className="tree-child-text">{mod.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} style={{ color: 'var(--cyan)' }} />
            <span>Cryo Core ERP</span>
          </div>
          <span className="system-badge" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
            <span className="pulse-dot" /> Online
          </span>
        </div>
      </aside>
    </>
  );
}
