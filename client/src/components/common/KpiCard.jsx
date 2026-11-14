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
    <div className="kpi-card">
      {Icon && (
        <div
          className="kpi-icon-wrap"
          style={{
            background: iconBg,
            color: resolvedColor,
            border: `1px solid ${resolvedColor}25`
          }}
        >
          <Icon size={18} />
        </div>
      )}

      <div>
        <div className="kpi-value">
          {value !== undefined && value !== null ? value : 0}
        </div>
        <div className="kpi-title">
          {displayTitle}
        </div>
      </div>

      {displaySubtext && (
        <div className="kpi-footer">
          {displaySubtext}
        </div>
      )}
    </div>
  );
}
