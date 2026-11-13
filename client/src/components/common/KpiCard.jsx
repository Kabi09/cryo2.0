import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, color = '#3B82F6' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-wrap" style={{ color }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {subtext && <div className="kpi-footer">{subtext}</div>}
    </div>
  );
}

