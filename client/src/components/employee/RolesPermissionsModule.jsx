import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Check,
  X,
  Plus,
  Save,
  RotateCcw,
  Users,
  Building,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';

const ERP_MODULES = [
  { id: 'Dashboard', name: 'Dashboard', desc: 'Executive KPI cards & system overview' },
  { id: 'Marketing', name: 'Marketing', desc: 'Campaigns, lead sources & demand generation' },
  { id: 'Sales', name: 'Sales', desc: 'Enquiries, quotes, proforma invoices, sales orders' },
  { id: 'Purchase', name: 'Purchase', desc: 'Vendor orders, supplier links & PO approvals' },
  { id: 'Production', name: 'Production', desc: 'Work orders, BOMs, schedules & assembly runs' },
  { id: 'Supply Chain', name: 'Supply Chain', desc: 'Raw material masters, inward GRNs & store issues' },
  { id: 'Inventory', name: 'Inventory', desc: 'Raw material & finished goods stock ledgers' },
  { id: 'Quality Assurance', name: 'Quality Assurance', desc: 'QC tests, QA inspections & rework routing' },
  { id: 'Logistics', name: 'Logistics', desc: 'Delivery planning, vehicles, dispatches & tracking' },
  { id: 'Installation', name: 'Installation', desc: 'Field technician deployment & 7-point sign-off' },
  { id: 'Employee Management', name: 'Employee Management', desc: 'Staff directory, RBAC roles & access matrix' },
  { id: 'Reports', name: 'Reports', desc: 'Departmental analytics, SLAs & CSV data exports' },
  { id: 'Settings', name: 'Settings', desc: 'Company parameters, audit logs & system setup' }
];

const PERMISSION_COLUMNS = [
  { key: 'access', label: 'Access', tooltip: 'Open and navigate to module' },
  { key: 'view', label: 'View', tooltip: 'View records and reports' },
  { key: 'add', label: 'Add', tooltip: 'Create new records' },
  { key: 'edit', label: 'Edit', tooltip: 'Modify existing records' },
  { key: 'delete', label: 'Delete', tooltip: 'Remove or archive records' },
  { key: 'export', label: 'Export', tooltip: 'Download CSV / Excel reports' },
  { key: 'approve', label: 'Approve', tooltip: 'Authorize transactions & sign-offs' }
];

export default function RolesPermissionsModule({
  roles = [],
  departments = [],
  onSaveRole,
  onUpdateRolePermissions,
  showToast
}) {
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?._id || '');
  const [currentPermissions, setCurrentPermissions] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Role Form State
  const [newRoleData, setNewRoleData] = useState({
    name: '',
    description: '',
    department: 'General',
    templateRole: ''
  });

  // Selected Role Document
  const selectedRole = roles.find(r => r._id === selectedRoleId) || roles[0];

  useEffect(() => {
    if (selectedRole) {
      setSelectedRoleId(selectedRole._id);
      // Deep clone permissions
      const perms = {};
      ERP_MODULES.forEach(m => {
        const existing = selectedRole.permissions?.[m.id] || {};
        perms[m.id] = {
          access: Boolean(existing.access),
          view: Boolean(existing.view),
          add: Boolean(existing.add),
          edit: Boolean(existing.edit),
          delete: Boolean(existing.delete),
          export: Boolean(existing.export),
          approve: Boolean(existing.approve)
        };
      });
      setCurrentPermissions(perms);
      setIsModified(false);
    }
  }, [selectedRoleId, roles]);

  // Handle single checkbox toggle
  const handleTogglePermission = (moduleId, permKey) => {
    if (selectedRole?.isSuperAdmin) {
      showToast?.('Super Admin permissions are permanent and cannot be modified', 'warning');
      return;
    }

    setCurrentPermissions(prev => {
      const modulePerms = { ...prev[moduleId] };
      const newValue = !modulePerms[permKey];
      modulePerms[permKey] = newValue;

      // Business Rule: If 'access' is turned OFF, turn off all child actions
      if (permKey === 'access' && !newValue) {
        modulePerms.view = false;
        modulePerms.add = false;
        modulePerms.edit = false;
        modulePerms.delete = false;
        modulePerms.export = false;
        modulePerms.approve = false;
      }

      // Business Rule: If any action is turned ON, 'access' and 'view' must turn ON automatically
      if (permKey !== 'access' && newValue) {
        modulePerms.access = true;
        modulePerms.view = true;
      }

      setIsModified(true);
      return {
        ...prev,
        [moduleId]: modulePerms
      };
    });
  };

  // Toggle all permissions for an entire row
  const handleToggleRow = (moduleId) => {
    if (selectedRole?.isSuperAdmin) return;
    const current = currentPermissions[moduleId] || {};
    const hasAny = Object.values(current).some(v => v);
    const targetVal = !hasAny;

    setCurrentPermissions(prev => ({
      ...prev,
      [moduleId]: {
        access: targetVal,
        view: targetVal,
        add: targetVal,
        edit: targetVal,
        delete: targetVal,
        export: targetVal,
        approve: targetVal
      }
    }));
    setIsModified(true);
  };

  // Select All Permissions across all modules
  const handleSelectAll = () => {
    if (selectedRole?.isSuperAdmin) return;
    const updated = {};
    ERP_MODULES.forEach(m => {
      updated[m.id] = {
        access: true,
        view: true,
        add: true,
        edit: true,
        delete: true,
        export: true,
        approve: true
      };
    });
    setCurrentPermissions(updated);
    setIsModified(true);
    showToast?.('All permissions selected for ' + selectedRole.name, 'info');
  };

  // Clear All Permissions across all modules
  const handleClearAll = () => {
    if (selectedRole?.isSuperAdmin) {
      showToast?.('Cannot clear Super Admin privileges', 'error');
      return;
    }
    const updated = {};
    ERP_MODULES.forEach(m => {
      updated[m.id] = {
        access: false,
        view: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        approve: false
      };
    });
    setCurrentPermissions(updated);
    setIsModified(true);
    showToast?.('All permissions cleared for ' + selectedRole.name, 'info');
  };

  // Reset to original saved state
  const handleReset = () => {
    if (selectedRole) {
      const perms = {};
      ERP_MODULES.forEach(m => {
        const existing = selectedRole.permissions?.[m.id] || {};
        perms[m.id] = {
          access: Boolean(existing.access),
          view: Boolean(existing.view),
          add: Boolean(existing.add),
          edit: Boolean(existing.edit),
          delete: Boolean(existing.delete),
          export: Boolean(existing.export),
          approve: Boolean(existing.approve)
        };
      });
      setCurrentPermissions(perms);
      setIsModified(false);
      showToast?.('Permissions reset to last saved state', 'info');
    }
  };

  // Save Permissions to Backend
  const handleSave = async () => {
    if (selectedRole?.isSuperAdmin) {
      showToast?.('Super Admin permissions are permanent', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateRolePermissions?.(selectedRole._id, {
        permissions: currentPermissions
      });
      setIsModified(false);
      showToast?.(`Permissions successfully saved for ${selectedRole.name}!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Error saving permissions', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Create Custom Role Handler
  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    if (!newRoleData.name) {
      showToast?.('Role name is required', 'error');
      return;
    }

    try {
      // If template selected, copy permissions
      let initialPerms = {};
      if (newRoleData.templateRole) {
        const template = roles.find(r => r._id === newRoleData.templateRole);
        if (template) {
          initialPerms = template.permissions || {};
        }
      }

      await onSaveRole?.({
        name: newRoleData.name,
        description: newRoleData.description,
        department: newRoleData.department,
        permissions: initialPerms
      });

      setIsAddRoleOpen(false);
      setNewRoleData({ name: '', description: '', department: 'General', templateRole: '' });
      showToast?.(`Custom role '${newRoleData.name}' created!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Error creating custom role', 'error');
    }
  };

  return (
    <div className="module-container">
      {/* Top Controls Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          {/* Role Selector & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: selectedRole?.isSuperAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
              border: `1px solid ${selectedRole?.isSuperAdmin ? 'rgba(99, 102, 241, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedRole?.isSuperAdmin ? '#818CF8' : 'var(--cyan)'
            }}>
              {selectedRole?.isSuperAdmin ? <ShieldCheck size={22} /> : <Shield size={22} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Select RBAC Role:
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: 220, fontWeight: 700, fontSize: '0.9rem' }}
                >
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.isSuperAdmin ? '👑 ' : ''}{r.name} ({r.department || 'General'})
                    </option>
                  ))}
                </select>
                <StatusBadge status={selectedRole?.status || 'Active'} />
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {selectedRole?.description || 'Configure department module access and transactional permissions'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsAddRoleOpen(true)}
            >
              <Plus size={14} /> Create Custom Role
            </button>

            {!selectedRole?.isSuperAdmin && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSelectAll}
                  title="Check all permissions"
                >
                  <CheckSquare size={14} /> Select All
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearAll}
                  title="Clear all permissions"
                >
                  <Square size={14} /> Clear All
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                  disabled={!isModified}
                  title="Revert unsaved changes"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={!isModified || isSaving}
                  style={{ minWidth: 120 }}
                >
                  <Save size={14} /> {isSaving ? 'Saving...' : 'Save Matrix'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Super Admin Notice */}
        {selectedRole?.isSuperAdmin && (
          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.78rem',
            color: '#C7D2FE'
          }}>
            <Lock size={15} style={{ color: '#818CF8', shrink: 0 }} />
            <span>
              <strong>Super Admin Policy:</strong> This role possesses immutable universal authorization across all current and future ERP modules. Privileges cannot be restricted.
            </span>
          </div>
        )}

        {isModified && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 6,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.74rem',
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>You have unsaved permission modifications for <strong>{selectedRole?.name}</strong>.</span>
            <span style={{ fontWeight: 700 }}>Click 'Save Matrix' to apply.</span>
          </div>
        )}
      </div>

      {/* Responsive & Sticky Permission Matrix Table */}
      <div className="table-card">
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
              Permission Matrix: {selectedRole?.name}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Horizontally scrollable table with sticky left Module column. All 7 authorization vectors.
            </p>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            13 Modules • 91 Permission Points
          </div>
        </div>

        {/* Responsive Table Container with Sticky Left Column */}
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}>
          <table style={{
            width: '100%',
            minWidth: 800,
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{
                background: 'var(--bg-surface-elevated)',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                {/* Sticky Left Column for Module */}
                <th style={{
                  padding: '14px 18px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  position: 'sticky',
                  left: 0,
                  background: 'var(--bg-surface-elevated)',
                  zIndex: 2,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.3)',
                  minWidth: 200
                }}>
                  Module Name
                </th>

                {PERMISSION_COLUMNS.map(col => (
                  <th
                    key={col.key}
                    style={{
                      padding: '14px 16px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      textAlign: 'center',
                      minWidth: 90
                    }}
                    title={col.tooltip}
                  >
                    {col.label}
                  </th>
                ))}

                <th style={{
                  padding: '14px 16px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  minWidth: 90
                }}>
                  Row Toggle
                </th>
              </tr>
            </thead>

            <tbody>
              {ERP_MODULES.map((mod, idx) => {
                const perms = currentPermissions[mod.id] || {};
                const hasAccess = Boolean(perms.access);
                const isSuper = Boolean(selectedRole?.isSuperAdmin);

                return (
                  <tr
                    key={mod.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Sticky Module Column */}
                    <td style={{
                      padding: '12px 18px',
                      position: 'sticky',
                      left: 0,
                      background: 'var(--bg-surface)',
                      zIndex: 1,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.84rem', color: hasAccess || isSuper ? '#fff' : 'var(--text-muted)' }}>
                          {mod.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {mod.desc}
                        </span>
                      </div>
                    </td>

                    {/* Permission Checkbox Cells */}
                    {PERMISSION_COLUMNS.map(col => {
                      const isChecked = isSuper ? true : Boolean(perms[col.key]);
                      const isDisabled = isSuper || (col.key !== 'access' && !hasAccess);

                      return (
                        <td
                          key={col.key}
                          style={{
                            padding: '10px 16px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          <label style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            userSelect: 'none'
                          }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={() => handleTogglePermission(mod.id, col.key)}
                              style={{ display: 'none' }}
                            />
                            <div style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              border: `1.5px solid ${
                                isChecked
                                  ? (col.key === 'access' ? 'var(--cyan)' : '#10B981')
                                  : 'rgba(255, 255, 255, 0.2)'
                              }`,
                              background: isChecked
                                ? (col.key === 'access' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(16, 185, 129, 0.25)')
                                : 'var(--bg-surface-elevated)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isChecked ? (col.key === 'access' ? 'var(--cyan)' : '#34D399') : 'transparent',
                              opacity: isDisabled && !isSuper ? 0.35 : 1,
                              transition: 'all 0.15s ease'
                            }}>
                              <Check size={14} strokeWidth={3} />
                            </div>
                          </label>
                        </td>
                      );
                    })}

                    {/* Row Quick Toggle */}
                    <td style={{ textAlign: 'center', padding: '10px 16px' }}>
                      <button
                        type="button"
                        disabled={isSuper}
                        onClick={() => handleToggleRow(mod.id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          opacity: isSuper ? 0.4 : 1
                        }}
                      >
                        {Object.values(perms).some(v => v) ? 'Clear' : 'All'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isAddRoleOpen && (
        <Modal
          isOpen={isAddRoleOpen}
          onClose={() => setIsAddRoleOpen(false)}
          title="Create Custom Enterprise Role"
          subtitle="Configure a tailored designation with specific department authorization"
          size="md"
        >
          <form onSubmit={handleCreateCustomRole}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Role Title / Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Production Manager, Sales Executive, QA Inspector"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Assignment</label>
                <select
                  className="form-select"
                  value={newRoleData.department}
                  onChange={(e) => setNewRoleData({ ...newRoleData, department: e.target.value })}
                >
                  <option value="General">General / Cross-Departmental</option>
                  {departments.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clone Permissions From Template Role</label>
                <select
                  className="form-select"
                  value={newRoleData.templateRole}
                  onChange={(e) => setNewRoleData({ ...newRoleData, templateRole: e.target.value })}
                >
                  <option value="">Start with blank permissions</option>
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role Description / Scope</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Outline responsibilities, authorization level, and reporting line..."
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddRoleOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Role
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

