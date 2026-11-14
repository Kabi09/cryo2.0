import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  Layers,
  Search,
  Filter,
  DollarSign,
  Tag,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function ProductsModule({
  products = [],
  onSave,
  onUpdate,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'categories'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    modelNumber: '',
    category: 'Industrial Machinery',
    description: '',
    specifications: '',
    warranty: '12 Months',
    standardPrice: '',
    unit: 'Nos',
    status: 'Active'
  });

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }
    return list.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const nextCode = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    setFormData({
      productCode: nextCode,
      productName: '',
      modelNumber: '',
      category: 'Industrial Machinery',
      description: '',
      specifications: '',
      warranty: '12 Months',
      standardPrice: '',
      unit: 'Nos',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      productCode: prod.productCode || '',
      productName: prod.productName || '',
      modelNumber: prod.modelNumber || '',
      category: prod.category || 'Industrial Machinery',
      description: prod.description || '',
      specifications: prod.specifications || '',
      warranty: prod.warranty || '12 Months',
      standardPrice: prod.standardPrice || '',
      unit: prod.unit || 'Nos',
      status: prod.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (prod) => {
    try {
      const newStatus = prod.status === 'Active' ? 'Inactive' : 'Active';
      if (onUpdate) {
        await onUpdate(prod._id, { ...prod, status: newStatus });
        showToast?.(`Product marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.productCode || !formData.productName || !formData.standardPrice) {
        showToast?.('Please fill Product Code, Name, and Standard Price', 'error');
        return;
      }

      const payload = {
        ...formData,
        standardPrice: Number(formData.standardPrice)
      };

      if (editingProduct && onUpdate) {
        await onUpdate(editingProduct._id, payload);
        showToast?.('Product updated successfully', 'success');
      } else if (onSave) {
        await onSave(payload);
        showToast?.('Product created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast?.(err.message || 'Failed to save product', 'error');
    }
  };

  const columns = [
    {
      header: 'Product Code',
      accessor: 'productCode',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
          {row.productCode}
        </span>
      )
    },
    {
      header: 'Product Name',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.productName}</span>
          {row.description && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {row.description.length > 55 ? `${row.description.substring(0, 55)}...` : row.description}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Model / Variant',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          {row.modelNumber || 'Standard'}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span
          className="badge"
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            fontWeight: 600
          }}
        >
          {row.category}
        </span>
      )
    },
    {
      header: 'Base Price',
      accessor: 'standardPrice',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#16A36A' }}>
          ₹{Number(row.standardPrice || 0).toLocaleString('en-IN')}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
            / {row.unit || 'Nos'}
          </span>
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
          <button
            className="icon-btn"
            title="View Details"
            onClick={() => setSelectedProduct(row)}
          >
            <Eye size={15} />
          </button>
          <button
            className="icon-btn"
            title="Edit Product"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={15} />
          </button>
          <button
            className="icon-btn"
            title={row.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
            style={{ color: row.status === 'Active' ? '#EF4444' : '#16A36A' }}
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 'Active' ? <XCircle size={15} /> : <CheckCircle size={15} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* KPI Overview Metrics */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Products"
          value={products.length}
          subtext="Catalog Portfolio"
          icon={Package}
          color="var(--primary)"
        />
        <KpiCard
          title="Active Models"
          value={products.filter(p => p.status === 'Active').length}
          subtext="Available for Quotes"
          icon={CheckCircle}
          color="#16A36A"
        />
        <KpiCard
          title="Categories"
          value={categories.length || 1}
          subtext="Product Lines"
          icon={Layers}
          color="#7C3AED"
        />
        <KpiCard
          title="Avg Base Price"
          value={`₹${Math.round(products.reduce((acc, p) => acc + (p.standardPrice || 0), 0) / (products.length || 1)).toLocaleString('en-IN')}`}
          subtext="Catalog Average"
          icon={DollarSign}
          color="#D97706"
        />
      </div>

      {/* Subtabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('all')}
          >
            All Products ({products.length})
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('categories')}
          >
            Categories & Models ({categories.length})
          </button>
        </div>

        {/* Category filter dropdown when in All Products view */}
        {activeTab === 'all' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Category:
            </span>
            <select
              className="form-control"
              style={{ padding: '5px 10px', fontSize: '0.8rem', width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View: All Products Table */}
      {activeTab === 'all' ? (
        <DataTable
          columns={columns}
          data={filteredProducts}
          searchPlaceholder="Search product code, name, category, or model..."
          toolbarAction={
            <button
              className="btn btn-primary"
              onClick={handleOpenAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} /> Add Product
            </button>
          }
        />
      ) : (
        /* View: Category breakdown grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {categories.map(cat => {
            const catProds = products.filter(p => p.category === cat);
            return (
              <div
                key={cat}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 18,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cat}</h4>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {catProds.length} Products registered
                      </span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: '#EFF6FF', color: 'var(--primary)', fontWeight: 700 }}>
                    {catProds.length}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  {catProds.slice(0, 4).map(p => (
                    <div
                      key={p._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        fontSize: '0.8rem',
                        borderBottom: '1px dashed #F1F5F9'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.productName}</span>
                      <span style={{ color: '#16A36A', fontWeight: 600 }}>
                        ₹{Number(p.standardPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {catProds.length > 4 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                      + {catProds.length - 4} more products
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Master' : 'Add New Product to Catalog'}
        maxWidth="720px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Section 1: Basic Details */}
          <div>
            <h5 style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Tag size={14} /> Basic Particulars
            </h5>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Code *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder="e.g. PRD-001"
                />
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Cryogenic Storage Freezer 500L"
                />
              </div>

              <div className="form-group">
                <label>Model / Variant</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.modelNumber}
                  onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  placeholder="e.g. CSF-500X Pro"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Industrial Machinery, Lab Equipment"
                />
              </div>

              <div className="form-group col-span-2">
                <label>Product Overview & Description</label>
                <textarea
                  rows={2}
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of product features, use cases, and design specifications..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Details */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <h5 style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Cpu size={14} /> Technical & Warranty Specifications
            </h5>
            <div className="form-grid">
              <div className="form-group">
                <label>Unit of Measure</label>
                <select
                  className="form-control"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="Nos">Nos (Units)</option>
                  <option value="Sets">Sets</option>
                  <option value="Assemblies">Assemblies</option>
                  <option value="Systems">Systems</option>
                </select>
              </div>

              <div className="form-group">
                <label>Warranty Terms</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="e.g. 12 Months Standard, 24 Months Extended"
                />
              </div>

              <div className="form-group col-span-2">
                <label>Technical Specifications (Thermal, Voltage, Sensors)</label>
                <textarea
                  rows={2}
                  className="form-control"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="e.g. Operating Temp: -80°C to -196°C; Power: 415V 3-Phase; Microprocessor PID controller..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Commercial Details */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <h5 style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <DollarSign size={14} /> Commercials & Status
            </h5>
            <div className="form-grid">
              <div className="form-group">
                <label>Base Selling Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-control"
                  value={formData.standardPrice}
                  onChange={(e) => setFormData({ ...formData, standardPrice: e.target.value })}
                  placeholder="e.g. 250000"
                />
              </div>

              <div className="form-group">
                <label>Catalog Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active (In Catalog)</option>
                  <option value="Inactive">Inactive (Archived)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Register Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Details Drawer / Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Specifications: ${selectedProduct.productCode}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {selectedProduct.productName}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Model: {selectedProduct.modelNumber || 'Standard'} • Category: {selectedProduct.category}
                </span>
              </div>
              <StatusBadge status={selectedProduct.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Base Price</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16A36A' }}>
                  ₹{Number(selectedProduct.standardPrice || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                  / {selectedProduct.unit || 'Nos'}
                </span>
              </div>

              <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Warranty</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedProduct.warranty || '12 Months'}
                </span>
              </div>
            </div>

            {selectedProduct.description && (
              <div>
                <h5 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Description
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: '#F8FAFC', padding: 10, borderRadius: 6 }}>
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {selectedProduct.specifications && (
              <div>
                <h5 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Technical Specifications
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: '#F8FAFC', padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
                  {selectedProduct.specifications}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const prod = selectedProduct;
                  setSelectedProduct(null);
                  handleOpenEdit(prod);
                }}
              >
                Edit Product
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
