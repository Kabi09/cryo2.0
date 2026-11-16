import React from 'react';
import {
  Factory,
  ArrowDownLeft,
  Wrench,
  ShieldCheck,
  PackageCheck,
  ChevronRight
} from 'lucide-react';

const PRODUCTION_STAGES = [
  {
    id: 'production-orders',
    alias: 'orders',
    num: '1',
    title: '1. Work Orders',
    desc: 'Planning, BOM Recipes & Schedule',
    icon: Factory,
    countKey: 'workOrders'
  },
  {
    id: 'production-materials',
    alias: 'materials',
    num: '2',
    title: '2. Material Requests',
    desc: 'Requisition & Warehouse Issues',
    icon: ArrowDownLeft,
    countKey: 'materialRequests'
  },
  {
    id: 'production-manufacturing',
    alias: 'manufacturing',
    num: '3',
    title: '3. Shopfloor Assembly',
    desc: 'Station Routing & Shift Progress',
    icon: Wrench,
    countKey: 'executions'
  },
  {
    id: 'production-quality',
    alias: 'quality',
    num: '4',
    title: '4. Quality & Rework',
    desc: 'QA Testing & Rework Orders',
    icon: ShieldCheck,
    countKey: 'qaTests'
  },
  {
    id: 'production-finished-goods',
    alias: 'finished-goods',
    num: '5',
    title: '5. Finished Goods',
    desc: 'Warehouse Storage & Logistics',
    icon: PackageCheck,
    countKey: 'finishedGoods'
  }
];

export default function ProductionPipelineStepper({
  currentModule,
  onNavigate,
  counts = {}
}) {
  const getStageIndex = (mod) => {
    if (!mod) return -1;
    if (mod === 'production-orders' || mod === 'production-planning' || mod === 'production-bom' || mod === 'production-schedule' || mod === 'orders') return 0;
    if (mod === 'production-materials' || mod === 'production-material-requests' || mod === 'production-material-issue' || mod === 'materials') return 1;
    if (mod === 'production-manufacturing' || mod === 'production-tracking' || mod === 'production-execution' || mod === 'production-updates' || mod === 'production-completion' || mod === 'manufacturing') return 2;
    if (mod === 'production-quality' || mod === 'production-quality-rework' || mod === 'production-qa' || mod === 'production-rework' || mod === 'quality') return 3;
    if (mod === 'production-finished-goods' || mod === 'finished-goods') return 4;
    return -1;
  };

  const currentIndex = getStageIndex(currentModule);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      marginBottom: 20,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid var(--primary-border)'
          }}>
            Manufacturing Production Pipeline
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            5 Sequential Stages: Work Orders (BOM) ➔ Material Requisition & Store Issue ➔ Assembly Line ➔ Quality Assurance ➔ Finished Goods Warehouse
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {currentIndex >= 0 ? `Stage ${currentIndex + 1} of 5` : 'Production Overview'}
        </span>
      </div>

      {/* Interactive Stage Pipeline Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {PRODUCTION_STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isActive = idx === currentIndex;
          const isPassed = currentIndex >= 0 && currentIndex > idx;
          const countVal = counts[stg.countKey];

          return (
            <React.Fragment key={stg.id}>
              <button
                type="button"
                onClick={() => onNavigate?.(stg.id)}
                title={`Navigate to ${stg.title}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: isActive
                    ? '1.5px solid var(--primary)'
                    : isPassed
                    ? '1px solid var(--success-border)'
                    : '1px solid var(--border-subtle)',
                  background: isActive
                    ? 'var(--primary-light)'
                    : isPassed
                    ? 'var(--success-light)'
                    : 'var(--bg-surface-elevated)',
                  color: isActive
                    ? 'var(--primary)'
                    : isPassed
                    ? 'var(--success)'
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive
                    ? 'var(--primary)'
                    : isPassed
                    ? 'var(--success)'
                    : 'var(--border-subtle)',
                  color: isActive || isPassed ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {stg.num}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.2 }}>
                    <span>{stg.title}</span>
                    {countVal !== undefined && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 10,
                        background: isActive ? 'var(--primary)' : isPassed ? 'var(--success)' : 'var(--border-strong)',
                        color: '#FFFFFF'
                      }}>
                        {countVal}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 400
                  }}>
                    {stg.desc}
                  </div>
                </div>
              </button>

              {idx < PRODUCTION_STAGES.length - 1 && (
                <ChevronRight
                  size={14}
                  style={{
                    color: isPassed ? 'var(--success)' : 'var(--border-strong)',
                    flexShrink: 0
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
