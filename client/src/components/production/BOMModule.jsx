import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Layers, Plus, Trash2, Box, Info } from 'lucide-react';

export default function BOMModule({
  boms = [],
  products = [],
  materials = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    version: 'V1',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    remarks: '',
    materials: [
      {
        material: '',
        materialCode: '',
        materialName: '',
        quantityPerUnit: 1,
        unit: 'Kg',
        wastagePercent: 0
      }
    ]
  });

  const handleOpenModal = () => {
    if (products.length > 0 && !formData.product) {
      setFormData(prev => ({ ...prev, product: products[0]._id }));
    }
    setIsModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    setFormData(prev => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          material: '',
          materialCode: '',
          materialName: '',
          quantityPerUnit: 1,
          unit: 'Nos',
          wastagePercent: 0
        }
      ]
    }));
  };

  const handleRemoveMaterialRow = (index) => {
    if (formData.materials.length === 1) {
      showToast('At least one raw material required for BOM', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index, materialId) => {
    const mat = materials.find(m => m._id === materialId);
    if (!mat) return;

    const updated = [...formData.materials];
    updated[index] = {
      ...updated[index],
      material: mat._id,
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      unit: mat.unit || 'Kg'
    };
    setFormData(prev => ({ ...prev, materials: updated }));
  };

  const handleRowFieldChange = (index, field, value) => {
    const updated = [...formData.materials];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, materials: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product) {
      showToast('Please select a target product', 'error');
      return;
    }
    if (formData.materials.some(m => !m.material || Number(m.quantityPerUnit) <= 0)) {
      showToast('Please fill all material rows with valid quantities', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      showToast('BOM created successfully! Multiplied by order quantity automatically.', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving BOM', 'error');
    }
  };

  const columns = [
    {
      header: 'BOM No',
      accessor: 'bomNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.bomNumber}</span>
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => row.product?.productName || 'Product'
    },
    {
      header: 'Materials Required',
      accessor: 'materials',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.materials ? `${row.materials.length} Items` : '0 Items'}
        </span>
      )
    },
    {
      header: 'Version',
      accessor: 'version',
      render: (row) => <span className="font-mono" style={{ color: '#818CF8' }}>{row.version || 'V1'}</span>
    },
    {
      header: 'Effective Date',
      accessor: 'effectiveDate',
      render: (row) => (row.effectiveDate ? new Date(row.effectiveDate).toLocaleDateString() : '-')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    }
  ];

  return (
    <div className="module-container">
      {/* BOM Logic Tip */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99, 102, 241, 0.05)' }}>
        <Info size={18} style={{ color: 'var(--cyan)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Formula:</strong> Total Material Required = <code>Order Quantity × Quantity per Unit + Wastage %</code>. Once BOM is selected for a work order, that version is locked to prevent silent alteration.
        </span>
      </div>

      <DataTable
        title="BOM – Bill of Materials"
        subtitle="Define exact raw materials and quantities required to manufacture one unit of product"
        columns={columns}
        data={boms}
        onAdd={handleOpenModal}
        addLabel="Create BOM"
      />

      {isModalOpen && (
        <Modal
          title="Create Bill of Materials (BOM)"
          subtitle="Formulate recipe and itemized material requirements for manufacturing one unit"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Target Product Specs */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} /> 1. Target Product & Version Metadata
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Target Manufactured Product <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      required
                    >
                      <option value="">Select Manufactured Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.productCode} — {p.productName} ({p.category || 'Finished Good'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">BOM Version Tag <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="e.g. V1.0, V2.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Effective Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Version Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active (Available for Production Orders)</option>
                      <option value="Draft">Draft (Engineering Review)</option>
                      <option value="Inactive">Inactive / Deprecated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Multi-Row Raw Materials Table */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} /> 2. Raw Materials Required (per 1 Finished Unit)
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddMaterialRow}
                  >
                    <Plus size={14} /> Add Raw Material
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '42%' }}>Raw Material</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Qty / Unit</th>
                        <th style={{ width: '14%', textAlign: 'center' }}>Unit</th>
                        <th style={{ width: '16%', textAlign: 'center' }}>Scrap / Wastage %</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.materials.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className="form-select"
                              value={row.material}
                              onChange={(e) => handleMaterialChange(index, e.target.value)}
                              required
                            >
                              <option value="">Select Raw Material</option>
                              {materials.map(m => (
                                <option key={m._id} value={m._id}>
                                  {m.materialCode} — {m.materialName} ({m.unit})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              step="0.01"
                              min="0.01"
                              value={row.quantityPerUnit}
                              onChange={(e) => handleRowFieldChange(index, 'quantityPerUnit', Number(e.target.value))}
                              style={{ textAlign: 'center', fontWeight: 700 }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={row.unit}
                              readOnly
                              style={{ textAlign: 'center', opacity: 0.8 }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              step="0.1"
                              min="0"
                              value={row.wastagePercent}
                              onChange={(e) => handleRowFieldChange(index, 'wastagePercent', Number(e.target.value))}
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="icon-btn"
                              style={{ color: 'var(--danger)', margin: '0 auto' }}
                              onClick={() => handleRemoveMaterialRow(index)}
                              title="Delete Row"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div className="form-group">
                  <label className="form-label">Engineering Specifications & Assembly Notes</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Tolerance levels, surface finish, assembly sequence, QA checkpoints..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Lock BOM Formulation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

