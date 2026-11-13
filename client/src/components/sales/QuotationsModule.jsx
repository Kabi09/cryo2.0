import React, { useState } from 'react';
import { Plus, Eye, FileSpreadsheet, Trash2, Send, GitBranch, Trophy, XCircle, FileText } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function QuotationsModule({ quotations, customers, leads, products, onSave, onRevise, onUpdateStatus, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    quotationNumber: '',
    version: 'V1',
    quotationDate: new Date().toISOString().split('T')[0],
    customer: '',
    leadReference: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTerms: 'Ex-Factory, 4 to 6 weeks from PO confirmation',
    paymentTerms: '50% Advance with PO, 50% Before Dispatch',
    warranty: '12 Months comprehensive manufacturer warranty',
    notes: 'Standard factory pricing including testing and pre-dispatch inspection.',
    status: 'Sent',
    items: []
  });

  const getInitialItem = (prodId) => {
    const prd = products.find(p => p._id === prodId) || products[0];
    const price = prd ? prd.standardPrice : 100000;
    const qty = 1;
    const tax = (price * 18) / 100;
    return {
      product: prd?._id || '',
      description: prd?.description || prd?.productName || '',
      quantity: qty,
      unit: prd?.unit || 'Nos',
      unitPrice: price,
      discount: 0,
      gstPercent: 18,
      amount: Math.round(price + tax)
    };
  };

  const handleOpenAdd = () => {
    const defaultCust = customers[0]?._id || '';
    const custLeads = leads.filter(l => (l.customer?._id || l.customer) === defaultCust);
    const initialItem = getInitialItem(products[0]?._id);

    setFormData({
      quotationNumber: '',
      version: 'V1',
      quotationDate: new Date().toISOString().split('T')[0],
      customer: defaultCust,
      leadReference: custLeads[0]?._id || '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTerms: 'Ex-Factory, 4 to 6 weeks from PO confirmation',
      paymentTerms: '50% Advance with PO, 50% Before Dispatch',
      warranty: '12 Months comprehensive manufacturer warranty',
      notes: 'Standard factory pricing including testing and pre-dispatch inspection.',
      status: 'Sent',
      items: initialItem ? [initialItem] : []
    });
    setIsAddOpen(true);
  };

  const handleOpenRevise = (quote) => {
    setSelectedQuote(quote);
    setFormData({
      ...quote,
      items: quote.items.map(i => ({
        product: i.product?._id || i.product,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        discount: i.discount || 0,
        gstPercent: i.gstPercent || 18,
        amount: i.amount
      }))
    });
    setIsReviseOpen(true);
  };

  const handleCustomerChange = (custId) => {
    const custLeads = leads.filter(l => (l.customer?._id || l.customer) === custId);
    setFormData({
      ...formData,
      customer: custId,
      leadReference: custLeads[0]?._id || ''
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'product') {
      const prd = products.find(p => p._id === value);
      item.product = value;
      item.description = prd?.description || prd?.productName || '';
      item.unit = prd?.unit || 'Nos';
      item.unitPrice = prd?.standardPrice || 100000;
    } else {
      item[field] = value;
    }

    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    const taxRate = Number(item.gstPercent) || 18;

    const base = qty * price;
    const discounted = Math.max(0, base - disc);
    const tax = (discounted * taxRate) / 100;
    item.amount = Math.round((discounted + tax) * 100) / 100;

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    const item = getInitialItem(products[0]?._id);
    if (item) {
      setFormData({ ...formData, items: [...formData.items, item] });
    }
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      showToast('Quotation must contain at least one line item', 'error');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // Calculations
  const subtotal = formData.items.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.unitPrice)), 0);
  const discountTotal = formData.items.reduce((acc, i) => acc + Number(i.discount || 0), 0);
  const gstTotal = formData.items.reduce((acc, i) => {
    const base = (Number(i.quantity) * Number(i.unitPrice)) - Number(i.discount || 0);
    return acc + ((Math.max(0, base) * (Number(i.gstPercent) || 18)) / 100);
  }, 0);
  const grandTotal = Math.round(subtotal - discountTotal + gstTotal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.items.length === 0) {
        showToast('Please add at least one product item', 'error');
        return;
      }
      await onSave({
        ...formData,
        subtotal,
        discountTotal,
        gstTotal,
        grandTotal
      });
      showToast('Quotation proposal generated and sent to customer!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviseSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRevise(selectedQuote._id, {
        items: formData.items,
        validUntil: formData.validUntil,
        deliveryTerms: formData.deliveryTerms,
        paymentTerms: formData.paymentTerms,
        warranty: formData.warranty,
        notes: formData.notes
      });
      showToast('New quotation version created for negotiation!', 'success');
      setIsReviseOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusUpdate = async (quoteId, status) => {
    try {
      await onUpdateStatus(quoteId, status);
      if (status === 'Accepted') {
        showToast('Quotation Accepted! Opportunity marked as WON.', 'success');
      } else if (status === 'Rejected') {
        showToast('Quotation Rejected. Opportunity marked as LOST.', 'info');
      } else {
        showToast(`Quotation status changed to ${status}`, 'success');
      }
      if (selectedQuote) {
        setSelectedQuote({ ...selectedQuote, status });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Quote No',
      accessor: 'quotationNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedQuote(row)}>
          {row.quotationNumber}
        </span>
      )
    },
    {
      header: 'Version',
      accessor: 'version',
      render: (row) => (
        <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
          {row.version}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'quotationDate',
      render: (row) => new Date(row.quotationDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customer?.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'Products',
      render: (row) => (
        <div>
          {row.items?.map((it, idx) => (
            <div key={idx} style={{ fontSize: '0.8rem', color: '#C7D2FE' }}>
              {it.product?.productName}: <strong>{it.quantity} {it.unit}</strong>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Total Value',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34D399' }}>
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
          <button className="icon-btn" title="View Proposal" onClick={() => setSelectedQuote(row)}>
            <Eye size={15} />
          </button>
          <button
            className="icon-btn"
            title="Revise to New Version (V+1)"
            style={{ color: '#F59E0B' }}
            onClick={() => handleOpenRevise(row)}
          >
            <GitBranch size={15} />
          </button>
          {row.status !== 'Accepted' && (
            <button
              className="icon-btn"
              title="Customer Accepted (Mark Won)"
              style={{ color: '#10B981' }}
              onClick={() => handleStatusUpdate(row._id, 'Accepted')}
            >
              <Trophy size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Quotes" value={quotations.length} subtext="Proposals Generated" icon={FileSpreadsheet} color="#6366F1" />
        <KpiCard title="Under Negotiation" value={quotations.filter(q => q.status === 'Negotiation' || q.status === 'Under Review').length} subtext="Revised Versions" icon={GitBranch} color="#F59E0B" />
        <KpiCard title="Accepted Quotes" value={quotations.filter(q => q.status === 'Accepted').length} subtext="Won for PI release" icon={Trophy} color="#10B981" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={quotations}
        searchPlaceholder="Search quotation number, customer, product..."
        actions={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Quotation
          </button>
        }
      />

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Create Product Quotation"
        subtitle="Prepare official commercial proposal with multi-line items, taxes, and validity terms"
      >
        <form onSubmit={handleSubmit}>
          {/* Section 1: Header */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8', marginBottom: 12 }}>
            Section 1: Basic Particulars
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quotation Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. QT-003)"
                value={formData.quotationNumber}
                onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Date <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.quotationDate}
                onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Account <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.customer}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valid Until <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
              Section 2: Product Line Items (Multi-row)
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Product</th>
                  <th style={{ width: '12%' }}>Qty</th>
                  <th style={{ width: '15%' }}>Unit Price</th>
                  <th style={{ width: '12%' }}>Discount (₹)</th>
                  <th style={{ width: '10%' }}>GST %</th>
                  <th style={{ width: '18%' }}>Line Total</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 8px' }}
                        value={item.product}
                        onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        required
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ padding: '6px 8px' }}
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 8px' }}
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
                      ₹{item.amount?.toLocaleString('en-IN')}
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

          {/* Section 3: Commercial Terms & Summary */}
          <div style={{ marginTop: 20 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8', display: 'block', marginBottom: 10 }}>
              Section 3: Commercial Terms & Totals
            </span>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Delivery Terms</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.deliveryTerms}
                  onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Warranty & Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div style={{
              marginTop: 16,
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Discount Total:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#F87171' }}>-₹{discountTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST Tax:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{Math.round(gstTotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#fff',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 8
              }}>
                <span>Grand Total:</span>
                <span style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
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
              onClick={() => setFormData({ ...formData, status: 'Sent' })}
            >
              <Send size={15} /> Send to Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Revise Quotation Modal */}
      <Modal
        isOpen={isReviseOpen}
        onClose={() => setIsReviseOpen(false)}
        size="lg"
        title={`Revise Quotation: ${selectedQuote?.quotationNumber}`}
        subtitle={`Negotiate terms and create Version V+1 (preserving previous versions)`}
      >
        <form onSubmit={handleReviseSubmit}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 12 }}>
            Adjust Prices, Discounts or Quantities for Revised Version:
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Discount (₹)</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description || 'Product Item'}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        style={{ padding: '4px 8px' }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ padding: '4px 8px' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ padding: '4px 8px' }}
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReviseOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <GitBranch size={15} /> Save Revised Version
            </button>
          </div>
        </form>
      </Modal>

      {/* View Quotation Details Modal */}
      <Modal
        isOpen={!!selectedQuote && !isReviseOpen}
        onClose={() => setSelectedQuote(null)}
        size="lg"
        title={`Quotation: ${selectedQuote?.quotationNumber} (${selectedQuote?.version})`}
        subtitle={`Issued to ${selectedQuote?.customer?.companyName}`}
      >
        {selectedQuote && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Quote Number</div>
                <div className="detail-value">{selectedQuote.quotationNumber} ({selectedQuote.version})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedQuote.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Client Account</div>
                <div className="detail-value">{selectedQuote.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Valid Until</div>
                <div className="detail-value">{new Date(selectedQuote.validUntil).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Payment Terms</div>
                <div className="detail-value">{selectedQuote.paymentTerms}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Delivery Terms</div>
                <div className="detail-value">{selectedQuote.deliveryTerms}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Itemized Commercial Schedule:</div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Discount</th>
                      <th>GST</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{it.product?.productName}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{it.description}</div>
                        </td>
                        <td>{it.quantity} {it.unit}</td>
                        <td>₹{it.unitPrice?.toLocaleString('en-IN')}</td>
                        <td>₹{it.discount?.toLocaleString('en-IN')}</td>
                        <td>{it.gstPercent}%</td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>₹{it.amount?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              marginTop: 18,
              padding: '12px 18px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grand Total (All Taxes Included): </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedQuote.grandTotal?.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {selectedQuote.status !== 'Accepted' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusUpdate(selectedQuote._id, 'Accepted')}
                  >
                    <Trophy size={14} /> Accept & Mark Won
                  </button>
                )}
                {selectedQuote.status !== 'Rejected' && selectedQuote.status !== 'Accepted' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleStatusUpdate(selectedQuote._id, 'Rejected')}
                  >
                    <XCircle size={14} /> Reject & Mark Lost
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

