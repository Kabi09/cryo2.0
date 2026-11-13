import React from 'react';
import { Menu, RefreshCw, Package, Briefcase } from 'lucide-react';
import { SCM_MODULES, SALES_MODULES } from './Sidebar';

export default function Header({
  activeDomain,
  onSelectDomain,
  activeModule,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing
}) {
  const allModules = [...SCM_MODULES, ...SALES_MODULES];
  const currentModule = allModules.find(m => m.id === activeModule) || allModules[0];

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMobileMenu} title="Open navigation">
          <Menu size={20} />
        </button>

        <div className="page-title-box">
          <span className="page-tag">
            {activeDomain === 'scm' ? 'Supply Chain' : 'Sales'} • {currentModule.num}
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
              padding: '5px 12px',
              fontSize: '0.76rem',
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
            <Package size={13} /> Supply Chain (10)
          </button>
          <button
            onClick={() => onSelectDomain('sales')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              fontSize: '0.76rem',
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
            <Briefcase size={13} /> Sales CRM (10)
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
