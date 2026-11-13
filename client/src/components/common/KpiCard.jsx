import React from 'react';

export default function KpiCard({
  title,
  label,
  value,
  subtext,
  subtitle,
  icon: Icon,
  color,
  accent = '#2451C5'
}) {
  const displayTitle = title || label || '';
  const displaySubtext = subtext || subtitle || '';

  // Enterprise light theme color palette
  let resolvedColor = color || accent || '#2451C5';
  const colorMap = {
    primary: '#2451C5',
    indigo: '#2451C5',
    blue: '#2451C5',
    cyan: '#0284C7',
    emerald: '#16A36A',
    success: '#16A36A',
    teal: '#0D9488',
    warning: '#D97706',
    amber: '#D97706',
    orange: '#EA580C',
    danger: '#EF4444',
    rose: '#E11D48',
    red: '#EF4444',
    purple: '#7C3AED'
  };

  if (colorMap[resolvedColor]) {
    resolvedColor = colorMap[resolvedColor];
  }

  // Soft pastel background mapping for icon squircle
  const bgMap = {
    '#2451C5': '#EFF6FF',
    '#0284C7': '#F0F9FF',
    '#16A36A': '#ECFDF5',
    '#0D9488': '#F0FDFA',
    '#D97706': '#FFFBEB',
    '#EA580C': '#FFF7ED',
    '#EF4444': '#FEF2F2',
    '#E11D48': '#FFF1F2',
    '#7C3AED': '#FAF5FF'
  };
  const iconBg = bgMap[resolvedColor] || '#EFF6FF';

  return (
    <div className="kpi-card" style={{
      background: '#FFFFFF',
      border: '1px solid #E5EAF1',
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.18s ease'
    }}>
      {Icon && (
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: iconBg,
          color: resolvedColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${resolvedColor}20`
        }}>
          <Icon size={20} />
        </div>
      )}

      <div>
        <div className="kpi-value" style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#172033',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.15
        }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
        <div className="kpi-title" style={{
          fontSize: '0.84rem',
          fontWeight: 500,
          color: '#64748B',
          marginTop: 4
        }}>
          {displayTitle}
        </div>
      </div>

      {displaySubtext && (
        <div className="kpi-footer" style={{
          fontSize: '0.74rem',
          color: '#94A3B8',
          fontWeight: 500,
          borderTop: '1px solid #F1F5F9',
          paddingTop: 8,
          marginTop: 'auto'
        }}>
          {displaySubtext}
        </div>
      )}
    </div>
  );
}
