import React from 'react';
import { HelpCircle, PhoneCall, CheckCircle, FileText, Receipt, ShoppingBag, ChevronRight } from 'lucide-react';

const STAGES = [
  { id: 'sales-enquiries', num: '1', title: 'Enquiry', desc: 'Customer & Product Specs', icon: HelpCircle },
  { id: 'sales-follow-ups', num: '2', title: 'Follow-up', desc: 'Calls & Touchpoints', icon: PhoneCall },
  { id: 'sales-leads', num: '3', title: 'Qualified / Not Qualified Lead', desc: 'Opportunity & Value', icon: CheckCircle },
  { id: 'sales-quotations', num: '4', title: 'Quotation', desc: 'Proposals & V1/V2 Rev', icon: FileText },
  { id: 'sales-proforma-invoices', num: '5', title: 'Proforma Invoice (PI)', desc: 'Commercial Advance Bill', icon: Receipt },
  { id: 'sales-orders', num: '6', title: 'Sales Order (SO)', desc: 'Production Handover', icon: ShoppingBag }
];

export default function SalesPipelineStepper({ currentModule, onNavigate }) {
  const getStageIndex = (mod) => {
    if (mod === 'sales-enquiries' || mod === 'sales-enquiry' || mod === 'sales-customers-enquiries') return 0;
    if (mod === 'sales-follow-ups' || mod === 'sales-followup') return 1;
    if (mod === 'sales-leads' || mod === 'sales-customers-leads') return 2;
    if (mod === 'sales-quotations' || mod === 'sales-quotation' || mod === 'sales-quotations-pi') return 3;
    if (mod === 'sales-proforma-invoices' || mod === 'sales-pi') return 4;
    if (mod === 'sales-orders' || mod === 'sales-so' || mod === 'sales-orders-payments' || mod === 'sales-customer-pos' || mod === 'sales-payments') return 5;
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
            Follow the 6 stages: Enquiry ➔ Follow-up ➔ Qualified Lead / Not Qualified ➔ Follow-up ➔ Quotation ➔ PI ➔ SO
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Stage {currentIndex >= 0 ? currentIndex + 1 : 1} of 6
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
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isActive
                    ? 'var(--primary)'
                    : isPassed
                    ? 'var(--success)'
                    : 'var(--border-subtle)',
                  color: isActive || isPassed ? '#FFFFFF' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {stg.num}
                </div>
                <Icon size={14} />
                <span>{stg.title}</span>
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
