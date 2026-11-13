import React, { useState } from 'react';
import { Plus, Eye, Edit3, Boxes } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function MaterialMasterModule({ materials, onSave, onUpdate, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    category: 'Metals',
    unit: 'Kg',
    minimumStock: 100,
    reorderLevel: 150,
    storageLocation: 'Main Warehouse',
    hsnCode: '',
    description: '',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setFormData({
      materialCode: '',
      materialName: '',
      category: 'Metals',
      unit: 'Kg',
      minimumStock: 100,
      reorderLevel: 150,
      storageLocation: 'Main Warehouse',
      hsnCode: '',
      description: '',
      status: 'Active'
    });
    setIsEditMode(false);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (material) => {
    setFormData({
      materialCode: material.materialCode,
      materialName: material.materialName,
      category: material.category,
      unit: material.unit,
      minimumStock: material.minimumStock,
      reorderLevel: material.reorderLevel,
      storageLocation: material.storageLocation || 'Main Warehouse',
      hsnCode: material.hsnCode || '',
      description: material.description || '',
      status: material.status || 'Active'
    });
    setSelectedMaterial(material);
    setIsEditMode(true);
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedMaterial) {
        await onUpdate(selectedMaterial._id, formData);
        showToast('Material updated successfully', 'success');
      } else {
        await onSave(formData);
        showToast('Material registered successfully', 'success');
      }
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KPIs
  const totalCount = materials.length;
  const activeCount = materials.filter(m => m.status === 'Active').length;
  const lowStockCount = materials.filter(m => (m.currentStock || 0) <= m.minimumStock).length;

  const columns = [
    {
      header: 'Material Code',
      accessor: 'materialCode',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMaterial(row);
          }}
        >
          {row.materialCode}
        </span>
      )
    },
    {
      header: 'Material Name',
      accessor: 'materialName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.materialName}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{row.storageLocation}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="nav-badge-pill">{row.category}</span>
    },
    {
      header: 'Unit',
      accessor: 'unit',
      render: (row) => <strong>{row.unit}</strong>
    },
    {
      header: 'Min Stock',
      accessor: 'minimumStock',
      render: (row) => `${row.minimumStock} ${row.unit}`
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      render: (row) => {
        const isLow = (row.currentStock || 0) <= row.minimumStock;
        return (
          <span style={{ 
            fontWeight: 700, 
            color: isLow ? '#F87171' : '#34D399',
            fontFamily: 'var(--font-mono)' 
          }}>
            {row.currentStock || 0} {row.unit}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button 
            className="icon-btn" 
            title="View Details"
            onClick={() => setSelectedMaterial(row)}
          >
            <Eye size={15} />
          </button>
          <button 
            className="icon-btn" 
            title="Edit Material"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit3 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Materials" value={totalCount} subtext="Registered SKUs" icon={Boxes} color="#3B82F6" />
        <KpiCard title="Active Materials" value={activeCount} subtext="Ready for PO" icon={Boxes} color="#10B981" />
        <KpiCard title="Low Stock Warnings" value={lowStockCount} subtext="At or below minimum" icon={Boxes} color="#EF4444" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={materials}
        searchPlaceholder="Search material code or name..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Material
          </button>
        }
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEditMode ? 'Edit Raw Material' : 'Add New Raw Material'}
        subtitle="Catalog factory raw materials with unit of measure and stock thresholds"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Material Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. RM-001)"
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                disabled={isEditMode}
              />
              <span className="form-helper">Leave blank for auto-numbering</span>
            </div>

            <div className="form-group">
              <label className="form-label">Material Name <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Steel Sheet 2mm (CRCA Grade)"
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category <span className="req">*</span></label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Metals">Metals</option>
                <option value="Plastics">Plastics</option>
                <option value="Rubber">Rubber</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Packaging">Packaging</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Electronics">Electronics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure (UOM) <span className="req">*</span></label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
                <option value="Litre">Litre</option>
                <option value="Nos">Nos</option>
                <option value="Sheet">Sheet</option>
                <option value="Roll">Roll</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Stock <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
              />
              <span className="form-helper">Alert triggers when stock drops below this</span>
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rack A-01, Warehouse 1"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">HSN / SAC Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 7209"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Description / Specifications</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Material specifications, grade, manufacturer notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Material' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedMaterial && !isAddOpen}
        onClose={() => setSelectedMaterial(null)}
        title={`Material: ${selectedMaterial?.materialCode}`}
        subtitle={selectedMaterial?.materialName}
      >
        {selectedMaterial && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Material Code</div>
              <div className="detail-value">{selectedMaterial.materialCode}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={selectedMaterial.status} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Category</div>
              <div className="detail-value">{selectedMaterial.category}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Unit of Measure</div>
              <div className="detail-value">{selectedMaterial.unit}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Current Available Stock</div>
              <div className="detail-value" style={{ color: '#34D399' }}>
                {selectedMaterial.currentStock || 0} {selectedMaterial.unit}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Minimum Safety Stock</div>
              <div className="detail-value">{selectedMaterial.minimumStock} {selectedMaterial.unit}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Reorder Level</div>
              <div className="detail-value">{selectedMaterial.reorderLevel} {selectedMaterial.unit}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Storage Bay</div>
              <div className="detail-value">{selectedMaterial.storageLocation || 'Warehouse Main'}</div>
            </div>
            <div className="detail-item col-span-2">
              <div className="detail-label">Description / Specifications</div>
              <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                {selectedMaterial.description || 'No description provided.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

