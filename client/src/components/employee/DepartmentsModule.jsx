import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Building, Users, Shield, Plus, FileText } from 'lucide-react';

export default function DepartmentsModule({
  departments = [],
  onSaveDepartment,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast?.('Please enter department name', 'error');
      return;
    }

    try {
      await onSaveDepartment?.(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', headOfDepartment: '' });
      showToast?.(`Department '${formData.name}' created!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Error creating department', 'error');
    }
  };

  const columns = [
    {
      header: 'Dept Code',
      accessor: 'departmentCode',
      render: (row) => (
        <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>
          {row.departmentCode}
        </span>
      )
    },
    {
      header: 'Department Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff', fontSize: '0.86rem' }}>{row.name}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.description}</div>
        </div>
      )
    },
    {
      header: 'Head of Department',
      accessor: 'headOfDepartment',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          {row.headOfDepartment || 'Operations Lead'}
        </span>
      )
    },
    {
      header: 'Total Personnel',
      accessor: 'staffCount',
      render: (row) => (
        <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <Users size={12} /> {row.staffCount || 0} Staff
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Departments & Corporate Divisions"
        subtitle="Manage company operational units, division leadership, and personnel distribution"
        columns={columns}
        data={departments}
        onAdd={() => setIsModalOpen(true)}
        addLabel="Add Department"
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Department"
          subtitle="Define a corporate operational division with assigned leadership"
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Department Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Research & Thermal Physics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Head of Department (Lead Manager)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Meena Ramesh"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Functional Description / Mission</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Operational responsibilities, scope, and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Department
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

