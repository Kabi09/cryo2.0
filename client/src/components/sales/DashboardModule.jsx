import React from 'react';
import {
  MessageSquarePlus,
  FileSpreadsheet,
  PhoneCall,
  ShoppingBag,
  Trophy,
  XCircle,
  ArrowRight,
  Clock,
  Building,
  DollarSign
} from 'lucide-react';
import KpiCard from '../common/KpiCard';
import StatusBadge from '../common/StatusBadge';

export default function DashboardModule({ dashboardData, onNavigateModule }) {
  const kpis = dashboardData?.kpis || {
    totalEnquiries: 24,
    pendingQuotes: 12,
    todaysFollowUps: 8,
    activeSalesOrders: 15,
    wonDeals: 6,
    lostDeals: 3,
    totalOrderValue: 2700000,
    pendingPayments: 950000
  };

  const recentEnquiries = dashboardData?.recentEnquiries || [];
  const upcomingFollowUps = dashboardData?.upcomingFollowUps || [];

  return (
    <div>
      {/* 6 Executive Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KpiCard
          title="Total Enquiries"
          value={kpis.totalEnquiries}
          subtext="Prospect Inquiries"
          icon={MessageSquarePlus}
          color="#6366F1"
        />
        <KpiCard
          title="Pending Quotations"
          value={kpis.pendingQuotes}
          subtext="Under Review / Sent"
          icon={FileSpreadsheet}
          color="#F59E0B"
        />
        <KpiCard
          title="Today's Follow-ups"
          value={kpis.todaysFollowUps}
          subtext="Scheduled Calls & Meets"
          icon={PhoneCall}
          color="#06B6D4"
        />
        <KpiCard
          title="Active Sales Orders"
          value={kpis.activeSalesOrders}
          subtext="In Fulfillment Pipeline"
          icon={ShoppingBag}
          color="#3B82F6"
        />
        <KpiCard
          title="Won Deals"
          value={kpis.wonDeals}
          subtext="Successfully Closed"
          icon={Trophy}
          color="#10B981"
        />
        <KpiCard
          title="Lost Deals"
          value={kpis.lostDeals}
          subtext="Archived / Dropped"
          icon={XCircle}
          color="#EF4444"
        />
      </div>

      {/* Two Column Section: Recent Enquiries & Upcoming Follow-ups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        
        {/* Recent Enquiries Card */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Customer Enquiries</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Latest incoming product requirements</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateModule('enquiries')}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.length > 0 ? (
                  recentEnquiries.map((enq) => (
                    <tr
                      key={enq._id}
                      onClick={() => onNavigateModule('enquiries')}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{enq.companyName}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {enq.contactPerson} • {enq.enquiryNumber}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {enq.product?.productName || 'Machine Part'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Qty: {enq.quantity} {enq.unit}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={enq.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No recent enquiries recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Follow-ups Feed */}
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming Follow-ups</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Scheduled interactions & discussions</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateModule('follow-ups')}
            >
              Manage <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingFollowUps.length > 0 ? (
              upcomingFollowUps.map((fu) => {
                const dateObj = new Date(fu.nextFollowUpDate);
                const isToday = new Date().toDateString() === dateObj.toDateString();

                return (
                  <div
                    key={fu._id}
                    onClick={() => onNavigateModule('follow-ups')}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {fu.customer?.companyName || 'Valued Client'}
                        </strong>
                        <span className="badge badge-info" style={{ fontSize: '0.66rem' }}>
                          {fu.contactMethod}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                        {fu.nextAction || 'Follow-up discussion'} • {fu.customer?.contactPerson}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${isToday ? 'badge-warning' : 'badge-neutral'}`}>
                        <Clock size={11} /> {isToday ? 'Today' : dateObj.toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                No pending follow-ups scheduled.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Financial Summary Highlight Banner */}
      <div style={{
        marginTop: 20,
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sales Order Pipeline Value
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              ₹{(kpis.totalOrderValue || 2700000).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginRight: 10 }}>Pending Collections:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#D97706', fontFamily: 'var(--font-mono)' }}>
            ₹{(kpis.pendingPayments || 950000).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}

