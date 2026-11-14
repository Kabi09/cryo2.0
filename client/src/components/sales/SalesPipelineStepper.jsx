import React from 'react';
import { HelpCircle, FileText, Receipt, ShoppingBag, ChevronRight } from 'lucide-react';

const STAGES = [
  { id: 'sales-enquiries', num: '1', title: '1. Enquiry', desc: 'Requirements, Follow-up & Qualify', icon: HelpCircle },
  { id: 'sales-quotations', num: '2', title: '2. Quotation', desc: 'Proposals, V1/V2 & Acceptance', icon: FileText },
  { id: 'sales-proforma-invoices', num: '3', title: '3. Proforma Invoice', desc: 'Advance Commercials & Terms', icon: Receipt },
  { id: 'sales-orders', num: '4', title: '4. Sales Order', desc: 'Stock Check & Send to Production', icon: ShoppingBag }
];

export default function SalesPipelineStepper({ currentModule, onNavigate }) {
  const getStageIndex = (mod) => {
    if (mod === 'sales-enquiries' || mod === 'sales-enquiry' || mod === 'sales-customers-enquiries' || mod === 'sales-follow-ups' || mod === 'sales-leads') return 0;
    if (mod === 'sales-quotations' || mod === 'sales-quotation' || mod === 'sales-quotations-pi') return 1;
    if (mod === 'sales-proforma-invoices' || mod === 'sales-pi') return 2;
    if (mod === 'sales-orders' || mod === 'sales-so' || mod === 'sales-orders-payments' || mod === 'sales-customer-pos' || mod === 'sales-payments') return 3;
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
            Sales Workflow Pipeline
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            4 Transaction Stages: Enquiry (with follow-ups & qualify) ➔ Quotation ➔ Proforma Invoice ➔ Sales Order
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Stage {currentIndex >= 0 ? currentIndex + 1 : 1} of 4
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isActive = idx === currentIndex;
          const isPassed = currentIndex > idx;

          return (
            <React.Fragment key={stg.id}>
              <button
                type="button"
                onClick={() => onNavigate?.(stg.id)}
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
                  <div style={{ lineHeight: 1.2 }}>{stg.title}</div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 400
                  }}>
                    {stg.desc}
                  </div>
                </div>
              </button>

              {idx < STAGES.length - 1 && (
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
