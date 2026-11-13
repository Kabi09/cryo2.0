import React, { useState } from 'react';
import {
  Boxes,
  Briefcase,
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
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />
        {/* Smooth curved branch leading into item */}
        <path
          d="M 3 0 V 13 C 3 18, 6 21, 11 21 H 17"
          stroke={isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.24)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="tree-branch-curve"
          fill="none"
        />
        {/* Right-pointing arrow tip */}
        <path
          d="M 13 18 L 17 21 L 13 24"
          stroke={isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.24)"}
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
  // Accordion state: both can be expanded or collapsed independently
  const [openDropdowns, setOpenDropdowns] = useState({
    scm: true,
    sales: true
  });

  const toggleDropdown = (key, defaultModule) => {
    setOpenDropdowns((prev) => {
      const willOpen = !prev[key];
      // If opening and not currently on this domain, optionally activate default module
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
            <p>Unified SCM & Sales</p>
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
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>20 TABS</span>
          </div>

          {/* ======================================================== */}
          {/* 1. SUPPLY CHAIN MANAGEMENT DROPDOWN GROUP                */}
          {/* ======================================================== */}
          <div className="tree-dropdown-group">
            {/* Parent Header */}
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

            {/* Tree Branch Child List */}
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
          <div className="tree-dropdown-group" style={{ marginTop: 12 }}>
            {/* Parent Header */}
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

            {/* Tree Branch Child List */}
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
