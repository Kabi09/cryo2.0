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
    <header className="top-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      background: '#FFFFFF',
      borderBottom: '1px solid #E5EAF1',
      padding: '0 24px',
      height: 70,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Left: Mobile Toggle + Brand Logo & Title from Reference 1 */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          title="Open navigation"
          style={{
            display: 'none',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            color: '#172033',
            cursor: 'pointer',
            padding: 7,
            borderRadius: 8
          }}
        >
          <Menu size={20} />
        </button>

        {/* Brand identity matching reference screenshot 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2451C5, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(36, 81, 197, 0.25)'
          }}>
            <Layers size={20} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em' }}>
                CryoWorks
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                background: '#2451C5',
                color: '#FFFFFF',
                padding: '1px 6px',
                borderRadius: 5,
                letterSpacing: '0.04em'
              }}>
                ADMIN
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
              Enterprise ERP System
            </span>
          </div>
        </div>

        {/* Breadcrumb separator & current module */}
        <div className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
          <ChevronRight size={14} style={{ color: '#94A3B8' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#2451C5',
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              padding: '2px 8px',
              borderRadius: 6
            }}>
              {getDomainLabel()}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#172033' }}>
              {currentModule.title}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Department Switcher Pills */}
      <div className="hide-sm" style={{
        display: 'flex',
        alignItems: 'center',
        background: '#F1F5F9',
        padding: 4,
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        gap: 3
      }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                transition: 'all 0.16s ease',
                background: isActive ? '#2451C5' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                boxShadow: isActive ? '0 2px 8px rgba(36, 81, 197, 0.25)' : 'none'
              }}
            >
              <Icon size={13} />
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Actions, DB Status & User Profile Pill (Reference 1) */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Sync / Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync live data"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
        </button>

        {/* Database Status Pill */}
        <div
          title={`MongoDB: ${dbHealth?.host || '127.0.0.1'}:${dbHealth?.port || 27017} (${dbHealth?.name || 'cryo_scm'})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: dbHealth?.connected !== false ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${dbHealth?.connected !== false ? '#A7F3D0' : '#FECACA'}`,
            color: dbHealth?.connected !== false ? '#16A36A' : '#EF4444',
            padding: '5px 11px',
            borderRadius: 99,
            fontSize: '0.73rem',
            fontWeight: 700
          }}
        >
          <Database size={12} />
          <span
            className="pulse-dot"
            style={{
              backgroundColor: dbHealth?.connected !== false ? '#16A36A' : '#EF4444'
            }}
          />
          <span>DB: {dbHealth?.status || 'Connected'}</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          title="Notifications"
          className="hide-sm"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#2451C5'
          }} />
        </button>

        {/* User Profile Pill matching Reference Screenshot 1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          padding: '4px 12px 4px 6px',
          borderRadius: 99,
          cursor: 'pointer'
        }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#2451C5',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: '0.02em'
          }}>
            {userInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#172033' }}>
              {userName}
            </span>
            <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 500 }}>
              {userCode} • {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
