import React from 'react';
import { Menu, RefreshCw, Package, Briefcase, Factory, Truck } from 'lucide-react';
import { SCM_MODULES, SALES_MODULES, PRODUCTION_MODULES, LOGISTICS_MODULES } from './Sidebar';

export default function Header({
  activeDomain,
  onSelectDomain,
  activeModule,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing
}) {
  const allModules = [...SCM_MODULES, ...SALES_MODULES, ...PRODUCTION_MODULES, ...LOGISTICS_MODULES];
  const currentModule = allModules.find(m => m.id === activeModule) || allModules[0];

  const getDomainLabel = () => {
    if (activeDomain === 'scm') return 'Supply Chain';
    if (activeDomain === 'sales') return 'Sales CRM';
    if (activeDomain === 'production') return 'Production';
    if (activeDomain === 'logistics') return 'Logistics & Delivery';
    return 'Enterprise';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMobileMenu} title="Open navigation">
          <Menu size={20} />
        </button>

        <div className="page-title-box">
          <span className="page-tag">
            {getDomainLabel()} • {currentModule.num}
          </span>
          <h1 className="page-title">{currentModule.title}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Header Domain Toggle for Desktop */}
        <div className="hide-sm" style={{
          display: 'flex',
          background: 'var(--bg-surface-elevated)',
          padding: 3,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginRight: 8,
          gap: 3
        }}>
          <button
            onClick={() => onSelectDomain('scm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              background: activeDomain === 'scm' ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : 'transparent',
              color: activeDomain === 'scm' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeDomain === 'scm' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Package size={13} /> SCM (10)
          </button>
          <button
            onClick={() => onSelectDomain('sales')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              background: activeDomain === 'sales' ? 'linear-gradient(135deg, #0284C7, #06B6D4)' : 'transparent',
              color: activeDomain === 'sales' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeDomain === 'sales' ? '0 2px 8px rgba(6, 182, 212, 0.4)' : 'none'
            }}
          >
            <Briefcase size={13} /> Sales (10)
          </button>
          <button
            onClick={() => onSelectDomain('production')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              background: activeDomain === 'production' ? 'linear-gradient(135deg, #059669, #10B981)' : 'transparent',
              color: activeDomain === 'production' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeDomain === 'production' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <Factory size={13} /> Production (12)
          </button>
          <button
            onClick={() => onSelectDomain('logistics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              background: activeDomain === 'logistics' ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'transparent',
              color: activeDomain === 'logistics' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeDomain === 'logistics' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
            }}
          >
            <Truck size={13} /> Logistics (9)
          </button>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync Data"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
          <span className="hide-sm">Sync</span>
        </button>

        <div className="system-badge">
          <span className="pulse-dot" />
          <span>Live ERP</span>
        </div>
      </div>
    </header>
  );
}
