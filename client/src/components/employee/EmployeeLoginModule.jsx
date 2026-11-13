import React, { useState } from 'react';
import {
  Key,
  Lock,
  User,
  Shield,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Calendar,
  Building,
  ArrowRight,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function EmployeeLoginModule({
  currentUser,
  onLogin,
  onLogout,
  showToast
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Switch Preset Accounts
  const demoAccounts = [
    {
      title: 'Super Admin',
      username: 'superadmin',
      pass: 'SuperAdmin@123',
      role: 'Super Admin',
      dept: 'Executive',
      color: '#818CF8',
      desc: 'Universal unrestricted authorization across all 13 modules & security settings.'
    },
    {
      title: 'Admin (Operations)',
      username: 'admin.operations',
      pass: 'Admin@123',
      role: 'Admin',
      dept: 'Executive',
      color: '#06B6D4',
      desc: 'Multi-department operational control with approvals & reports.'
    },
    {
      title: 'Sales Executive',
      username: 'sales.rajesh',
      pass: 'Sales@123',
      role: 'Sales Executive',
      dept: 'Sales & Marketing',
      color: '#3B82F6',
      desc: 'Restricted to Sales CRM, Customer Enquiries, Quotes & Orders.'
    },
    {
      title: 'Production Supervisor',
      username: 'prod.suresh',
      pass: 'Prod@123',
      role: 'Production Supervisor',
      dept: 'Production & Assembly',
      color: '#10B981',
      desc: 'Shopfloor execution, BOM validation, and assembly runs.'
    },
    {
      title: 'Field Service Engineer',
      username: 'log.dinesh',
      pass: 'Logistics@123',
      role: 'Lead Field Engineer',
      dept: 'Logistics & Field Service',
      color: '#F59E0B',
      desc: 'Vehicle dispatches, GPS tracking, POD & 7-point QA commissioning.'
    }
  ];

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast?.('Please enter both username and password', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await onLogin?.({ username, password });
      setUsername('');
      setPassword('');
    } catch (err) {
      showToast?.(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    try {
      setIsLoading(true);
      await onLogin?.({ username: acc.username, password: acc.pass });
    } catch (err) {
      showToast?.(err.message || 'Error switching account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="module-container">
      {/* Top Header matching reference screenshot */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '18px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan)'
            }}>
              <Key size={18} />
            </span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Employee Login Management
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Calendar size={13} />
            <span>{todayStr}</span>
          </div>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                {currentUser.role?.name || currentUser.roleName || 'Employee'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <div className="system-badge">
            <span className="pulse-dot" /> Offline (Session Inactive)
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Left Column: Quick Role Switcher Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="table-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Instant Role Switcher (RBAC Simulation)
              </h3>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Click any profile below to instantly log in with that specific role. The ERP interface, navigation tree, and action buttons will dynamically restrict or grant access according to the Role Permission Matrix.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map(acc => {
                const isCurrent = currentUser?.username === acc.username;

                return (
                  <div
                    key={acc.username}
                    onClick={() => handleQuickLogin(acc)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isCurrent ? 'var(--primary-light)' : '#FFFFFF',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.86rem', color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {acc.title}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '0.68rem', background: `${acc.color}20`, color: acc.color, border: `1px solid ${acc.color}40` }}>
                          {acc.role}
                        </span>
                        {isCurrent && (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                            <CheckCircle2 size={10} /> Active Session
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                        {acc.desc}
                      </p>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        User: <span style={{ color: 'var(--text-secondary)' }}>{acc.username}</span> • Dept: {acc.dept}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ shrink: 0, padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      {isCurrent ? 'Active' : 'Switch'} <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Session Profile & Manual Login Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Session Card */}
          {currentUser && (
            <div className="table-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ShieldCheck size={18} style={{ color: '#10B981' }} />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Current Active Identity
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <img
                  src={currentUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`}
                  alt={currentUser.name}
                  style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</h4>
                  <div style={{ fontSize: '0.76rem', color: 'var(--primary)', marginTop: 2 }}>
                    {currentUser.designation || 'Staff'} • {currentUser.departmentName || currentUser.department || 'General'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    @{currentUser.username} • ID: {currentUser.employeeId || 'EMP-001'}
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Assigned Role</div>
                  <div className="detail-value">
                    <span className="badge badge-info">
                      {currentUser.role?.name || currentUser.roleName || 'Employee'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Super Admin Rights</div>
                  <div className="detail-value">
                    <span className={`badge ${currentUser.role?.isSuperAdmin ? 'badge-success' : 'badge-neutral'}`}>
                      {currentUser.role?.isSuperAdmin ? 'Universal (Full)' : 'Restricted (RBAC)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Login Form */}
          <div className="table-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Secure Custom Sign In
              </h3>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Enter any employee username and password to authenticate with encrypted JWT token.
            </p>

            <form onSubmit={handleCustomLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. superadmin, sales.rajesh"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Key size={14} /> {isLoading ? 'Authenticating...' : 'Sign In with Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

