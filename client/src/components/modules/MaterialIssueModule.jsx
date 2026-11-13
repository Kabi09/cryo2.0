import React, { useState } from 'react';
import { Plus, Eye, Factory, AlertOctagon } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function MaterialIssueModule({ materialIssues, materials, inventory, onSave, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const getMaterialAvailableStock = (matId) => {
    const inv = inventory.find(i => (i.material?._id || i.material) === matId);
    return inv ? inv.availableStock : 0;
  };

  // Form State
  const [formData, setFormData] = useState({
    issueNumber: '',
    workOrder: '',
    department: 'Fabrication',
    issueDate: new Date().toISOString().split('T')[0],
    requestedBy: 'Dinesh (Production Supervisor)',
    issuedBy: 'Selvam (Store Officer)',
    remarks: '',
    items: []
  });

  const handleOpenAdd = () => {
    // Select first material with stock
    const inStockMat = materials.find(m => getMaterialAvailableStock(m._id) > 0) || materials[0];
    const avail = inStockMat ? getMaterialAvailableStock(inStockMat._id) : 0;

    setFormData({
      issueNumber: '',
      workOrder: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Fabrication',
      issueDate: new Date().toISOString().split('T')[0],
      requestedBy: 'Dinesh (Production Supervisor)',
      issuedBy: 'Selvam (Store Officer)',
      remarks: 'Issued for scheduled assembly shop floor shift',
      items: inStockMat ? [
        {
          material: inStockMat._id,
          materialName: inStockMat.materialName,
          unit: inStockMat.unit,
          availableStock: avail,
          requiredQuantity: Math.min(50, avail),
          issueQuantity: Math.min(50, avail),
          batchNumber: 'BAT-DEFAULT'
        }
      ] : []
    });
    setIsAddOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'material') {
      const mat = materials.find(m => m._id === value);
      const avail = getMaterialAvailableStock(value);
      item.material = value;
      item.materialName = mat?.materialName || '';
      item.unit = mat?.unit || 'Kg';
      item.availableStock = avail;
      item.issueQuantity = Math.min(avail, item.issueQuantity || 10);
    } else {
      item[field] = value;
    }

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    const mat = materials.find(m => getMaterialAvailableStock(m._id) > 0) || materials[0];
    if (!mat) return;
    const avail = getMaterialAvailableStock(mat._id);

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          material: mat._id,
          materialName: mat.materialName,
          unit: mat.unit,
          availableStock: avail,
          requiredQuantity: Math.min(20, avail),
          issueQuantity: Math.min(20, avail),
          batchNumber: 'BAT-DEFAULT'
        }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.items.length === 0) {
        showToast('Please add at least one material to issue', 'error');
        return;
      }

      // Check stock client-side validation
      for (const item of formData.items) {
        const currentAvail = getMaterialAvailableStock(item.material);
        if (Number(item.issueQuantity) > currentAvail) {
          showToast(
            `Issue blocked: Cannot issue ${item.issueQuantity} ${item.unit} for '${item.materialName}'. Available: only ${currentAvail} ${item.unit}!`,
            'error'
          );
          return;
        }
      }

      await onSave(formData);
      showToast('Materials issued to production successfully! Inventory deducted.', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Issue Slip No',
      accessor: 'issueNumber',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIssue(row);
          }}
        >
          {row.issueNumber}
        </span>
      )
    },
    {
      header: 'Work Order',
      accessor: 'workOrder',
      render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.workOrder}</strong>
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => <span className="nav-badge-pill">{row.department}</span>
    },
    {
      header: 'Materials Issued',
      render: (row) => (
        <div>
          {row.items?.map((it, idx) => (
            <div key={idx} style={{ fontSize: '0.8rem' }}>
              {it.material?.materialName}: <strong style={{ color: 'var(--primary)' }}>{it.issueQuantity} {it.unit}</strong>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      render: (row) => new Date(row.issueDate).toLocaleDateString('en-GB')
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
          <button className="icon-btn" title="View Issue Voucher" onClick={() => setSelectedIssue(row)}>
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Issue Notes" value={materialIssues.length} subtext="Requisitions Issued" icon={Factory} color="#3B82F6" />
        <KpiCard title="Fabrication Dept" value={materialIssues.filter(i => i.department === 'Fabrication').length} subtext="Chassis & Enclosure" icon={Factory} color="#10B981" />
        <KpiCard title="Assembly Runs" value={materialIssues.filter(i => i.department === 'Assembly').length} subtext="Finished Subsystems" icon={Factory} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={materialIssues}
        searchPlaceholder="Search issue slip, work order, or department..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Issue Material to Production
          </button>
        }
      />

      {/* Create Material Issue Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Issue Material to Production Department"
        subtitle="Validate against live available approved inventory and dispatch to production floor"
      >
        <form onSubmit={handleSubmit}>
          {/* Section A: Header */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA', marginBottom: 12 }}>
            Section A: Work Order & Authorization
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Issue Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. MI-2026-002)"
                value={formData.issueNumber}
                onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Production Work Order No <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. WO-2026-102"
                value={formData.workOrder}
                onChange={(e) => setFormData({ ...formData, workOrder: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receiving Department <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Fabrication">Fabrication</option>
                <option value="Machining">Machining</option>
                <option value="Assembly">Assembly</option>
                <option value="Finishing">Finishing</option>
                <option value="Packaging">Packaging</option>
                <option value="R&D">R&D</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requested By (Foreman)</label>
              <input
                type="text"
                className="form-input"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Issued By (Storekeeper)</label>
              <input
                type="text"
                className="form-input"
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              />
            </div>
          </div>

          {/* Section B: Materials */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>
              Section B: Materials to Issue (Checked against Live Stock)
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
              <Plus size={14} /> Add Material Row
            </button>
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Material Name</th>
                  <th style={{ width: '18%' }}>Available Stock</th>
                  <th style={{ width: '18%' }}>Issue Quantity</th>
                  <th style={{ width: '12%' }}>Unit</th>
                  <th style={{ width: '17%' }}>Batch Number</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => {
                  const avail = getMaterialAvailableStock(item.material);
                  const isOverLimit = Number(item.issueQuantity) > avail;

                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '6px 8px' }}
                          value={item.material}
                          onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                        >
                          {materials.map(m => {
                            const stk = getMaterialAvailableStock(m._id);
                            return (
                              <option key={m._id} value={m._id}>
                                {m.materialCode} - {m.materialName} ({stk} {m.unit} avail)
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: avail > 0 ? '#34D399' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                          {avail} {item.unit}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          required
                          className="form-input"
                          style={{
                            padding: '6px 8px',
                            borderColor: isOverLimit ? '#EF4444' : 'var(--border-subtle)',
                            color: isOverLimit ? '#F87171' : 'inherit'
                          }}
                          value={item.issueQuantity}
                          onChange={(e) => handleItemChange(idx, 'issueQuantity', e.target.value)}
                        />
                        {isOverLimit && (
                          <div style={{ fontSize: '0.68rem', color: '#EF4444', marginTop: 2 }}>
                            Exceeds stock!
                          </div>
                        )}
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 8px' }}
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Issue Notes / Shift Instructions</label>
              <textarea
                rows="2"
                className="form-textarea"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Issue Material
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title={`Material Issue Note: ${selectedIssue?.issueNumber}`}
        subtitle={`Target Work Order: ${selectedIssue?.workOrder}`}
      >
        {selectedIssue && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Issue Slip No</div>
                <div className="detail-value">{selectedIssue.issueNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedIssue.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Work Order</div>
                <div className="detail-value">{selectedIssue.workOrder}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Department</div>
                <div className="detail-value">{selectedIssue.department}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Requested By</div>
                <div className="detail-value">{selectedIssue.requestedBy}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Issued By</div>
                <div className="detail-value">{selectedIssue.issuedBy}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Dispatched Items:</div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Quantity Dispatched</th>
                      <th>Batch Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedIssue.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.material?.materialName}</td>
                        <td style={{ color: '#60A5FA', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {it.issueQuantity} {it.unit}
                        </td>
                        <td>{it.batchNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

