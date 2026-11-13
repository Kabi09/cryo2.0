import React from 'react';

export default function KpiCard({
  title,
  label,
  value,
  subtext,
  subtitle,
  icon: Icon,
  color,
  accent = '#3B82F6'
}) {
  const displayTitle = title || label || '';
  const displaySubtext = subtext || subtitle || '';

  // Map semantic color names to obsidian neon hex palette
  let resolvedColor = color || accent || '#3B82F6';
  const colorMap = {
    primary: '#6366F1',
    indigo: '#818CF8',
    cyan: '#06B6D4',
    blue: '#3B82F6',
    emerald: '#10B981',
    success: '#10B981',
    teal: '#14B8A6',
    warning: '#F59E0B',
    amber: '#FBBF24',
    danger: '#EF4444',
    rose: '#F43F5E',
    red: '#EF4444'
  };

  if (colorMap[resolvedColor]) {
    resolvedColor = colorMap[resolvedColor];
  }

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{displayTitle}</span>
        {Icon && (
          <div className="kpi-icon-wrap" style={{ color: resolvedColor, backgroundColor: `${resolvedColor}1A` }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="kpi-value">{value !== undefined && value !== null ? value : 0}</div>
      {displaySubtext && <div className="kpi-footer">{displaySubtext}</div>}
    </div>
  );
}

