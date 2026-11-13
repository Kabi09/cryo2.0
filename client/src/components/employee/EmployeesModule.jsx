import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Building,
  Shield,
  Key,
  Calendar,
  UserCheck,
  UserX,
  Lock,
  Edit2,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function EmployeesModule({
  employees = [],
  roles = [],
  departments = [],
  onSaveEmployee,
  onUpdateEmployee,
  onResetPassword,
  onToggleStatus,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [resetPassEmp, setResetPassEmp] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    department: '',
    designation: '',
    role: '',
    reportingManager: 'Alexander Vance',
    username: '',
    password: '',
    joiningDate: new Date().toISOString().split('T')[0],
    profileImage: ''
  });

  const handleOpenAdd = () => {
    const defaultRole = roles.find(r => r.name === 'Employee')?._id || roles[0]?._id || '';
    const defaultDep = departments[0]?._id || '';

    setFormData({
      name: '',
      email: '',
      mobile: '',
      department: defaultDep,
      designation: '',
      role: defaultRole,
      reportingManager: 'Alexander Vance',
      username: '',
      password: '',
      joiningDate: new Date().toISOString().split('T')[0],
      profileImage: ''
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.role) {
      showToast?.('Please fill all required employee credentials', 'error');
      return;
    }

    try {
      await onSaveEmployee?.(formData);
      setIsAddOpen(false);
      showToast?.(`Employee ${formData.name} added successfully!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Error saving employee', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      await onUpdateEmployee?.(editingEmployee._id, editingEmployee);
      setEditingEmployee(null);
      showToast?.('Employee record updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Error updating employee', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast?.('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      await onResetPassword?.(resetPassEmp._id, newPassword);
      setResetPassEmp(null);
      setNewPassword('');
      showToast?.(`Password reset successfully for ${resetPassEmp.name}`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Error resetting password', 'error');
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => (
        <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>
          {row.employeeId}
        </span>
      )
    },
    {
      header: 'Employee Profile',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={row.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name)}`}
            alt={row.name}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
          />
          <div>
            <strong style={{ color: '#fff', fontSize: '0.84rem' }}>{row.name}</strong>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{row.username}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'departmentName',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {row.departmentName || 'General'}
        </span>
      )
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
          {row.designation}
        </span>
      )
    },
    {
      header: 'Assigned Role',
      accessor: 'roleName',
      render: (row) => (
        <span className={`badge ${row.role?.isSuperAdmin || row.roleName === 'Super Admin' ? 'badge-primary' : 'badge-info'}`}>
          <Shield size={11} /> {row.roleName}
        </span>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{row.email}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.mobile}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setSelectedEmployee(row)}
            className="icon-btn"
            title="View Profile"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditingEmployee({ ...row })}
            className="icon-btn"
            title="Edit Details"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => { setResetPassEmp(row); setNewPassword(''); }}
            className="icon-btn"
            title="Reset Password"
          >
            <Key size={14} />
          </button>
          {!(row.role?.isSuperAdmin || row.username === 'superadmin') && (
            <button
              onClick={() => onToggleStatus?.(row._id)}
              className="icon-btn"
              style={{ color: row.status === 'Active' ? 'var(--danger)' : '#10B981' }}
              title={row.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
            >
              {row.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Employees Directory & Access Control"
        subtitle="Manage company personnel, departmental roles, secure credentials, and active permissions"
        columns={columns}
        data={employees}
        onAdd={handleOpenAdd}
        addLabel="Add New Employee"
      />

      {/* Add Employee Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Onboard New Employee"
          subtitle="Assign credentials, initial department, designation and role permissions"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Personal Information */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} /> 1. Personal & Contact Particulars
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Employee Name <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Anandhan Sundaram"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Official Email <span className="req">*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="anandhan@cryo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Department & Role Assignment */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building size={16} /> 2. Department & RBAC Role Assignment
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Department <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation / Title <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Calibration Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">RBAC Role <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="">Select RBAC Role</option>
                      {roles.map(r => (
                        <option key={r._id} value={r._id}>
                          {r.isSuperAdmin ? '👑 ' : ''}{r.name} ({r.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reporting Manager</label>
                    <select
                      className="form-select"
                      value={formData.reportingManager}
                      onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    >
                      <option value="Alexander Vance">Alexander Vance (Chief Executive)</option>
                      <option value="Kavitha Sundaram">Kavitha Sundaram (Operations Director)</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp.name}>{emp.name} ({emp.designation})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials Setup */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} /> 3. Secure Portal Login Credentials
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Login Username <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. anandhan.s"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Password <span className="req">*</span></label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Onboard Employee
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <Modal
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          title={`Edit Employee: ${editingEmployee.name}`}
          subtitle={`Employee ID: ${editingEmployee.employeeId}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.mobile}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.designation}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">RBAC Role</label>
                <select
                  className="form-select"
                  value={editingEmployee.role?._id || editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                >
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingEmployee(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Update Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetPassEmp && (
        <Modal
          isOpen={!!resetPassEmp}
          onClose={() => setResetPassEmp(null)}
          title={`Reset Password for ${resetPassEmp.name}`}
          subtitle={`Employee ID: ${resetPassEmp.employeeId} • Username: ${resetPassEmp.username}`}
          size="sm"
        >
          <form onSubmit={handleResetPasswordSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">New Password <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Upon resetting, the employee must use this new password to sign into the ERP portal.
              </p>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setResetPassEmp(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save New Password
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Detail Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`Employee File: ${selectedEmployee.name}`}
          subtitle={`ID: ${selectedEmployee.employeeId} • Role: ${selectedEmployee.roleName}`}
          size="md"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <img
                src={selectedEmployee.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedEmployee.name)}`}
                alt={selectedEmployee.name}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedEmployee.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{selectedEmployee.designation}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <StatusBadge status={selectedEmployee.status} />
                  <span className="badge badge-info">{selectedEmployee.roleName}</span>
                </div>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Username</div>
                <div className="detail-value font-mono">@{selectedEmployee.username}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Department</div>
                <div className="detail-value">{selectedEmployee.departmentName || 'General'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Official Email</div>
                <div className="detail-value">{selectedEmployee.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mobile Number</div>
                <div className="detail-value">{selectedEmployee.mobile}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Reporting Manager</div>
                <div className="detail-value">{selectedEmployee.reportingManager}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Joining Date</div>
                <div className="detail-value">
                  {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

