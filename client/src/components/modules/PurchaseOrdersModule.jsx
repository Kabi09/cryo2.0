import React, { useState } from 'react';
import { Plus, Eye, ShoppingCart, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function PurchaseOrdersModule({ purchaseOrders, suppliers, materials, supplierLinks, onSave, onUpdateStatus, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    supplier: '',
    expectedDeliveryDate: '',
    deliveryAddress: 'Cryo Factory, Phase 2, Industrial Estate, Chennai - 600058',
    paymentTerms: 'Net 30 Days',
    freightCharges: 0,
    notes: '',
    status: 'Approved',
    items: []
  });

  const handleOpenAdd = () => {
    const defaultSupplier = suppliers[0]?._id || '';
    const initialItem = getInitialLineItem(defaultSupplier);

    setFormData({
      poNumber: '',
      poDate: new Date().toISOString().split('T')[0],
      supplier: defaultSupplier,
      expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryAddress: 'Cryo Factory, Phase 2, Industrial Estate, Chennai - 600058',
      paymentTerms: 'Net 30 Days',
      freightCharges: 0,
      notes: '',
      status: 'Approved',
      items: initialItem ? [initialItem] : []
    });
    setIsAddOpen(true);
  };

  const getInitialLineItem = (supId) => {
    // Find first material linked to this supplier
    const link = supplierLinks.find(l => (l.supplier?._id || l.supplier) === supId);
    if (link && link.material) {
      const mat = link.material;
      return {
        material: mat._id,
        materialName: mat.materialName,
        unit: mat.unit,
        quantity: link.minOrderQty || 100,
        unitPrice: link.unitPrice,
        taxPercent: 18,
        lineTotal: Math.round(((link.minOrderQty || 100) * link.unitPrice * 1.18) * 100) / 100
      };
    }
    // Fallback to first material
    const fallbackMat = materials[0];
    if (fallbackMat) {
      return {
        material: fallbackMat._id,
        materialName: fallbackMat.materialName,
        unit: fallbackMat.unit,
        quantity: 100,
        unitPrice: 80,
        taxPercent: 18,
        lineTotal: Math.round((100 * 80 * 1.18) * 100) / 100
      };
    }
    return null;
  };

  const handleSupplierChange = (supId) => {
    const sup = suppliers.find(s => s._id === supId);
    const initialItem = getInitialLineItem(supId);
    setFormData({
      ...formData,
      supplier: supId,
      paymentTerms: sup?.paymentTerms || 'Net 30 Days',
      items: initialItem ? [initialItem] : []
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'material') {
      const mat = materials.find(m => m._id === value);
      const link = supplierLinks.find(l => 
        (l.supplier?._id || l.supplier) === formData.supplier && 
        (l.material?._id || l.material) === value
      );

      item.material = value;
      item.materialName = mat?.materialName || '';
      item.unit = mat?.unit || 'Kg';
      item.unitPrice = link ? link.unitPrice : 50;
      item.quantity = link ? link.minOrderQty : 100;
    } else {
      item[field] = value;
    }

    // Recalculate line total
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const tax = Number(item.taxPercent) || 0;
    item.lineTotal = Math.round((qty * price * (1 + tax / 100)) * 100) / 100;

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    const item = getInitialLineItem(formData.supplier);
    if (item) {
      setFormData({ ...formData, items: [...formData.items, item] });
    }
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      showToast('PO must have at least one line item', 'error');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // Calculations
  const subtotal = formData.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const gstTotal = formData.items.reduce((acc, item) => acc + ((Number(item.quantity) * Number(item.unitPrice) * (Number(item.taxPercent) || 18)) / 100), 0);
  const grandTotal = subtotal + gstTotal + Number(formData.freightCharges || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.items.length === 0) {
        showToast('Please add at least one material line item', 'error');
        return;
      }
      await onSave({
        ...formData,
        subtotal: Math.round(subtotal * 100) / 100,
        gstTotal: Math.round(gstTotal * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100
      });
      showToast('Purchase Order created successfully', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (poId, newStatus) => {
    try {
      await onUpdateStatus(poId, newStatus);
      showToast(`PO status changed to ${newStatus}`, 'success');
      if (selectedPO) {
        setSelectedPO({ ...selectedPO, status: newStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPO(row);
          }}
        >
          {row.poNumber}
        </span>
      )
    },
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
      header: 'Order Date',
      accessor: 'poDate',
      render: (row) => new Date(row.poDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Expected Delivery',
      accessor: 'expectedDeliveryDate',
      render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Items',
      render: (row) => `${row.items?.length || 0} Materials`
    },
    {
      header: 'Grand Total',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
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
          <button className="icon-btn" title="View Full PO" onClick={() => setSelectedPO(row)}>
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
        <KpiCard title="Total POs" value={purchaseOrders.length} subtext="Procurement Orders" icon={ShoppingCart} color="#3B82F6" />
        <KpiCard title="Approved / Active" value={purchaseOrders.filter(p => p.status === 'Approved').length} subtext="Awaiting Delivery" icon={ShoppingCart} color="#10B981" />
        <KpiCard title="Completed Inward" value={purchaseOrders.filter(p => p.status === 'Completed').length} subtext="GRN Fulfilled" icon={ShoppingCart} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchPlaceholder="Search PO number or supplier..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Purchase Order
          </button>
        }
      />

      {/* Create PO Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Create Purchase Order (PO)"
        subtitle="Order raw materials from registered suppliers with automated tax and total calculation"
      >
        <form onSubmit={handleSubmit}>
          {/* Section A: Header Details */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA', marginBottom: 12 }}>
            Section A: Order & Supplier Header
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">PO Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. PO-2026-003)"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PO Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.supplier}
                onChange={(e) => handleSupplierChange(e.target.value)}
              >
                {suppliers.filter(s => s.status === 'Active').map(s => (
                  <option key={s._id} value={s._id}>
                    {s.supplierCode} - {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Delivery Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Delivery Destination</label>
              <input
                type="text"
                className="form-input"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              />
            </div>
          </div>

          {/* Section B: Line Items */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>
              Section B: Material Details (Multi-row)
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Material</th>
                  <th style={{ width: '15%' }}>Quantity</th>
                  <th style={{ width: '12%' }}>Unit</th>
                  <th style={{ width: '15%' }}>Unit Price (₹)</th>
                  <th style={{ width: '10%' }}>GST %</th>
                  <th style={{ width: '15%' }}>Line Total</th>
                  <th style={{ width: '3%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 8px' }}
                        value={item.material}
                        onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                      >
                        {materials.filter(m => m.status === 'Active').map(m => (
                          <option key={m._id} value={m._id}>
                            {m.materialCode} - {m.materialName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        readOnly
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.unit}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 8px' }}
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(idx, 'taxPercent', e.target.value)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ₹{item.lineTotal?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ color: '#EF4444' }}
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section C: Summary & Commercial */}
          <div style={{ marginTop: 20 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA', display: 'block', marginBottom: 10 }}>
              Section C: Summary & Commercial Terms
            </span>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Freight Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.freightCharges}
                  onChange={(e) => setFormData({ ...formData, freightCharges: Number(e.target.value) })}
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Order Notes / Terms</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Packing instructions, unloading shift notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div style={{
              marginTop: 16,
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Material Subtotal:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total GST Tax:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{Math.round(gstTotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Freight:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{formData.freightCharges}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 8,
                marginTop: 4
              }}>
                <span>Grand Total:</span>
                <span style={{ color: '#16A36A', fontFamily: 'var(--font-mono)' }}>
                  ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-outline"
              onClick={() => setFormData({ ...formData, status: 'Draft' })}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => setFormData({ ...formData, status: 'Approved' })}
            >
              Confirm & Approve PO
            </button>
          </div>
        </form>
      </Modal>

      {/* View PO Details Modal */}
      <Modal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        size="lg"
        title={`Purchase Order: ${selectedPO?.poNumber}`}
        subtitle={`Issued to ${selectedPO?.supplier?.supplierName}`}
      >
        {selectedPO && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">PO Number</div>
                <div className="detail-value">{selectedPO.poNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedPO.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Supplier</div>
                <div className="detail-value">{selectedPO.supplier?.supplierName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">PO Date</div>
                <div className="detail-value">{new Date(selectedPO.poDate).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Expected Delivery</div>
                <div className="detail-value">{new Date(selectedPO.expectedDeliveryDate).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Payment Terms</div>
                <div className="detail-value">{selectedPO.paymentTerms}</div>
              </div>
            </div>

            {/* Line items table */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Ordered Materials:</div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Unit Price</th>
                      <th>Tax</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{it.material?.materialName}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#60A5FA' }}>{it.material?.materialCode}</div>
                        </td>
                        <td>{it.quantity} {it.unit}</td>
                        <td style={{ color: it.receivedQuantity >= it.quantity ? '#34D399' : '#FBBF24', fontWeight: 600 }}>
                          {it.receivedQuantity || 0} {it.unit}
                        </td>
                        <td>₹{it.unitPrice}</td>
                        <td>{it.taxPercent}%</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{it.lineTotal?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total banner & Actions */}
            <div style={{
              marginTop: 18,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grand Total (Incl. GST): </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedPO.grandTotal?.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {selectedPO.status === 'Draft' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(selectedPO._id, 'Approved')}>
                    <CheckCircle2 size={14} /> Approve PO
                  </button>
                )}
                {selectedPO.status !== 'Cancelled' && selectedPO.status !== 'Completed' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selectedPO._id, 'Cancelled')}>
                    <XCircle size={14} /> Cancel PO
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

