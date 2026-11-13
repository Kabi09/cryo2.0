import React, { useState } from 'react';
import { Plus, Link2, Star, Edit3 } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function SupplierMaterialLinkModule({ links, suppliers, materials, onSave, onUpdate, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  const [formData, setFormData] = useState({
    supplier: '',
    material: '',
    supplierMaterialCode: '',
    unitPrice: '',
    minOrderQty: 100,
    leadTimeDays: 5,
    preferredSupplier: false,
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setFormData({
      supplier: suppliers[0]?._id || '',
      material: materials[0]?._id || '',
      supplierMaterialCode: '',
      unitPrice: '',
      minOrderQty: 100,
      leadTimeDays: 5,
      preferredSupplier: false,
      status: 'Active'
    });
    setIsEditMode(false);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (link) => {
    setFormData({
      supplier: link.supplier?._id || link.supplier,
      material: link.material?._id || link.material,
      supplierMaterialCode: link.supplierMaterialCode || '',
      unitPrice: link.unitPrice,
      minOrderQty: link.minOrderQty,
      leadTimeDays: link.leadTimeDays,
      preferredSupplier: !!link.preferredSupplier,
      status: link.status || 'Active'
    });
    setSelectedLink(link);
    setIsEditMode(true);
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.supplier || !formData.material) {
        showToast('Please select both a supplier and a material', 'error');
        return;
      }
      if (isEditMode && selectedLink) {
        await onUpdate(selectedLink._id, formData);
        showToast('Link contract updated successfully', 'success');
      } else {
        await onSave(formData);
        showToast('Supplier-Material link created successfully', 'success');
      }
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.supplier?.supplierName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.supplier?.supplierCode}</div>
        </div>
      )
    },
    {
      header: 'Material',
      accessor: 'material',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{row.material?.materialName || '—'}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{row.material?.materialCode}</div>
        </div>
      )
    },
    {
      header: 'Supplier Part Code',
      accessor: 'supplierMaterialCode',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.supplierMaterialCode || '—'}</span>
    },
    {
      header: 'Contract Rate',
      accessor: 'unitPrice',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FBBF24' }}>
          ₹{row.unitPrice} / {row.material?.unit || 'Unit'}
        </span>
      )
    },
    {
      header: 'MOQ',
      accessor: 'minOrderQty',
      render: (row) => `${row.minOrderQty} ${row.material?.unit || ''}`
    },
    {
      header: 'Lead Time',
      accessor: 'leadTimeDays',
      render: (row) => `${row.leadTimeDays} Days`
    },
    {
      header: 'Preferred',
      accessor: 'preferredSupplier',
      render: (row) => row.preferredSupplier ? (
        <span className="badge badge-warning" style={{ gap: 4 }}>
          <Star size={12} fill="#F59E0B" /> Primary
        </span>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Standard</span>
      )
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
          <button className="icon-btn" title="Edit Rate & Terms" onClick={() => handleOpenEdit(row)}>
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
        <KpiCard title="Total Price Contracts" value={links.length} subtext="Active Mappings" icon={Link2} color="#3B82F6" />
        <KpiCard title="Preferred Vendors" value={links.filter(l => l.preferredSupplier).length} subtext="Priority Source" icon={Star} color="#F59E0B" />
        <KpiCard title="Average Lead Time" value="4.2 Days" subtext="Factory Inward Avg" icon={Link2} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={links}
        searchPlaceholder="Search supplier or material in links..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Link Supplier to Material
          </button>
        }
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEditMode ? 'Edit Contract Terms' : 'Link Supplier with Material'}
        subtitle="Map a supplier to a specific material with negotiated rate, MOQ, and lead time"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier <span className="req">*</span></label>
              <select
                className="form-select"
                required
                disabled={isEditMode}
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.filter(s => s.status === 'Active').map(s => (
                  <option key={s._id} value={s._id}>
                    {s.supplierCode} - {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Material Master <span className="req">*</span></label>
              <select
                className="form-select"
                required
                disabled={isEditMode}
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              >
                <option value="">Select Material</option>
                {materials.filter(m => m.status === 'Active').map(m => (
                  <option key={m._id} value={m._id}>
                    {m.materialCode} - {m.materialName} ({m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Material Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ABC-CRCA-2MM"
                value={formData.supplierMaterialCode}
                onChange={(e) => setFormData({ ...formData, supplierMaterialCode: e.target.value })}
              />
              <span className="form-helper">Vendor's catalog or SKU code</span>
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹) <span className="req">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                placeholder="e.g. 80.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
              <span className="form-helper">Base rate before tax</span>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Order Qty (MOQ) <span className="req">*</span></label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={formData.minOrderQty}
                onChange={(e) => setFormData({ ...formData, minOrderQty: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Time (Days) <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
              />
            </div>

            <div className="form-group col-span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <input
                type="checkbox"
                id="prefSupplier"
                checked={formData.preferredSupplier}
                onChange={(e) => setFormData({ ...formData, preferredSupplier: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="prefSupplier" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                <strong>Preferred Supplier</strong> (Auto-selected as default vendor for this material in PO creation)
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Contract' : 'Save Mapping'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

