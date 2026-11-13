import React from 'react';
import {
  Menu,
  RefreshCw,
  Package,
  Briefcase,
  Factory,
  Truck,
  Users,
  Database,
  Bell,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SCM_MODULES, SALES_MODULES, PRODUCTION_MODULES, LOGISTICS_MODULES, EMPLOYEE_MODULES } from './Sidebar';

export default function Header({
  activeDomain,
  onSelectDomain,
  activeModule,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing,
  currentUser,
  dbHealth
}) {
  const allModules = [...SCM_MODULES, ...SALES_MODULES, ...PRODUCTION_MODULES, ...LOGISTICS_MODULES, ...EMPLOYEE_MODULES];
  const currentModule = allModules.find(m => m.id === activeModule) || allModules[0];

  const getDomainLabel = () => {
    if (activeDomain === 'scm') return 'Supply Chain';
    if (activeDomain === 'sales') return 'Sales CRM';
    if (activeDomain === 'production') return 'Production';
    if (activeDomain === 'logistics') return 'Logistics & Delivery';
    if (activeDomain === 'employee') return 'Employee & RBAC';
    return 'Enterprise';
  };

  const userName = currentUser?.name || 'Alexander Vance';
  const userRole = currentUser?.role?.name || currentUser?.role?.roleName || 'Developer Admin';
  const userCode = currentUser?.employeeId || 'DEV001';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="top-header">
      {/* Left: Mobile Menu Toggle + Brand Logo & Title */}
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          title="Open navigation"
          type="button"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Brand identity matching reference screenshot 1 */}
        <div className="header-brand-block">
          <div className="header-brand-logo">
            <Layers size={20} />
          </div>

          <div className="header-brand-info">
            <div className="header-brand-row">
              <span className="header-brand-title">
                CryoWorks
              </span>
              <span className="header-brand-badge">
                ADMIN
              </span>
            </div>
            <span className="header-brand-subtitle">
              Enterprise ERP System
            </span>
          </div>
        </div>

        {/* Breadcrumb separator & current module */}
        <div className="header-breadcrumb">
          <ChevronRight size={14} style={{ color: '#94A3B8' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="header-breadcrumb-tag">
              {getDomainLabel()}
            </span>
            <span className="header-breadcrumb-module">
              {currentModule.title}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Department Switcher Pills (Desktop only) */}
      <div className="header-dept-pills">
        {[
          { key: 'scm', label: 'SCM (10)', icon: Package },
          { key: 'sales', label: 'Sales (10)', icon: Briefcase },
          { key: 'production', label: 'Production (12)', icon: Factory },
          { key: 'logistics', label: 'Logistics (9)', icon: Truck },
          { key: 'employee', label: 'HR & RBAC (6)', icon: Users }
        ].map(dept => {
          const Icon = dept.icon;
          const isActive = activeDomain === dept.key;
          return (
            <button
              key={dept.key}
              onClick={() => onSelectDomain(dept.key)}
              type="button"
              className={`header-dept-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={13} />
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Actions, DB Status & User Profile Pill */}
      <div className="header-right">
        {/* Sync / Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync live data"
          type="button"
          className="header-icon-btn"
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
        </button>

        {/* Database Status Pill */}
        <div
          className={`header-db-pill ${dbHealth?.connected !== false ? 'connected' : 'disconnected'}`}
          title={`MongoDB: ${dbHealth?.host || '127.0.0.1'}:${dbHealth?.port || 27017} (${dbHealth?.name || 'cryo_scm'})`}
        >
          <Database size={12} />
          <span
            className="pulse-dot"
            style={{
              backgroundColor: dbHealth?.connected !== false ? '#16A36A' : '#EF4444'
            }}
          />
          <span className="header-db-text">DB: {dbHealth?.status || 'Connected'}</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          title="Notifications"
          type="button"
          className="header-icon-btn hide-on-mobile"
        >
          <Bell size={16} />
          <span className="header-bell-dot" />
        </button>

        {/* User Profile Pill matching Reference Screenshot 1 */}
        <div className="header-user-pill">
          <div className="header-user-avatar">
            {userInitials}
          </div>
          <div className="header-user-text">
            <span className="header-user-name">
              {userName}
            </span>
            <span className="header-user-role">
              {userCode} • {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
