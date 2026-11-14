import React, { useState, useEffect } from 'react';
import { Plus, Eye, ShoppingBag, Factory, Printer, CheckCircle2, Clock } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function SalesOrdersModule({
  salesOrders = [],
  customers = [],
  customerPOs = [],
  quotations = [],
  proformaInvoices = [],
  products = [],
  finishedGoods = [],
  onSave,
  onSendToProduction,
  preSelectedPI,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Confirmed' | 'In Process' | 'Completed'
  const [stockCheckResult, setStockCheckResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    soNumber: '',
    soDate: new Date().toISOString().split('T')[0],
    customer: '',
    customerPOReference: '',
    quotationReference: '',
    piReference: '',
    expectedDeliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    orderAmount: 2000000,
    advanceReceived: 50000,
    balanceAmount: 1950000,
    paymentTerms: '50% Advance with PO, Balance Before Dispatch',
    shippingAddress: 'Plot 45, Ambattur Industrial Estate, Chennai',
    deliveryInstructions: 'Special crane required for heavy machinery positioning.',
    productionRemarks: 'Shopfloor engineering assembly clearance given.',
    status: 'Confirmed',
    items: []
  });

  // Pre-fill from Proforma Invoice if redirected
  useEffect(() => {
    if (preSelectedPI) {
      const custId = preSelectedPI.customer?._id || preSelectedPI.customer;
      const initialItems = preSelectedPI.quotation?.items?.map(it => ({
        product: it.product?._id || it.product || null,
        productName: it.productName || it.product?.productName || 'Cryo Equipment Specification',
        description: it.description || it.productName,
        quantity: it.quantity || 1,
        unit: it.unit || 'Nos',
        unitPrice: it.unitPrice || 100000,
        discount: it.discount || 0,
        gstPercent: it.gstPercent || 18,
        totalAmount: it.amount || 100000
      })) || [];

      setFormData({
        soNumber: '',
        soDate: new Date().toISOString().split('T')[0],
        customer: custId || '',
        customerPOReference: '',
        quotationReference: preSelectedPI.quotation?._id || '',
        piReference: preSelectedPI._id || '',
        expectedDeliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderAmount: preSelectedPI.grandTotal || 200000,
        advanceReceived: preSelectedPI.totalReceived || preSelectedPI.advanceAmount || 0,
        balanceAmount: (preSelectedPI.grandTotal || 200000) - (preSelectedPI.totalReceived || preSelectedPI.advanceAmount || 0),
        paymentTerms: preSelectedPI.paymentTerms || '50% Advance with PO, Balance Before Dispatch',
        shippingAddress: 'Client Plant Facility, India',
        deliveryInstructions: 'Pre-dispatch inspection and vacuum leak test required.',
        productionRemarks: 'Commercial advance received. Authorized for shopfloor engineering assembly.',
        status: 'Confirmed',
        items: initialItems
      });
      setIsAddOpen(true);
    }
  }, [preSelectedPI]);

  const handleOpenAdd = () => {
    const verifiedPO = customerPOs.find(p => p.status === 'Verified') || customerPOs[0];
    const cust = verifiedPO?.customer?._id || customers[0]?._id;
    const prd = products[0];

    const initialItems = prd ? [
      {
        product: prd._id,
        productName: prd.productName,
        description: prd.productName,
        quantity: 10,
        unit: prd.unit || 'Nos',
        unitPrice: prd.standardPrice || 200000,
        discount: 0,
        gstPercent: 18,
        totalAmount: (prd.standardPrice || 200000) * 10
      }
    ] : [];

    setFormData({
      soNumber: '',
      soDate: new Date().toISOString().split('T')[0],
      customer: cust || '',
      customerPOReference: verifiedPO?._id || '',
      quotationReference: verifiedPO?.quotationReference?._id || '',
      piReference: verifiedPO?.piReference?._id || '',
      expectedDeliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderAmount: verifiedPO?.poAmount || 2000000,
      advanceReceived: 50000,
      balanceAmount: (verifiedPO?.poAmount || 2000000) - 50000,
      paymentTerms: '50% Advance with PO, Balance Before Dispatch',
      shippingAddress: 'Plot 45, Ambattur Industrial Estate, Chennai',
      deliveryInstructions: 'Special crane required for heavy machinery positioning.',
      productionRemarks: 'Shopfloor engineering assembly clearance given.',
      status: 'Confirmed',
      items: initialItems
    });
    setIsAddOpen(true);
  };

  const handlePISelect = (piId) => {
    const selectedPI = proformaInvoices.find(p => p._id === piId);
    if (!selectedPI) {
      setFormData(prev => ({ ...prev, piReference: piId }));
      return;
    }
    const orderAmt = Number(selectedPI.grandTotal) || 0;
    const paid = Number(selectedPI.totalReceived || selectedPI.advanceReceived || (selectedPI.paymentStatus === 'Paid' ? orderAmt : (selectedPI.advanceAmount || 0))) || 0;
    const bal = selectedPI.balanceAmount !== undefined ? Number(selectedPI.balanceAmount) : Math.max(0, orderAmt - paid);
    const custId = selectedPI.customer?._id || selectedPI.customer || '';

    const piItems = (selectedPI.items && selectedPI.items.length > 0)
      ? selectedPI.items.map(it => ({
          product: it.product?._id || it.product || null,
          productName: it.productName || it.product?.productName || 'Cryo Unit',
          description: it.description || it.productName,
          quantity: it.quantity || 1,
          unit: it.unit || 'Nos',
          unitPrice: it.unitPrice || 0,
          discount: it.discount || 0,
          gstPercent: it.gstPercent || 18,
          totalAmount: it.amount || ((it.quantity || 1) * (it.unitPrice || 0))
        }))
      : [];

    setFormData(prev => ({
      ...prev,
      piReference: piId,
      customer: custId || prev.customer,
      quotationReference: selectedPI.quotation?._id || selectedPI.quotation || prev.quotationReference,
      orderAmount: orderAmt || prev.orderAmount,
      advanceReceived: paid,
      balanceAmount: bal,
      paymentTerms: selectedPI.paymentTerms || prev.paymentTerms,
      shippingAddress: selectedPI.billingAddress || selectedPI.customer?.billingAddress || prev.shippingAddress,
      items: piItems.length > 0 ? piItems : prev.items
    }));
  };

  const handleOrderAmountChange = (val) => {
    const total = Number(val) || 0;
    setFormData(prev => ({
      ...prev,
      orderAmount: total,
      balanceAmount: Math.max(0, total - (Number(prev.advanceReceived) || 0))
    }));
  };

  const handleAdvanceChange = (val) => {
    const adv = Number(val) || 0;
    setFormData(prev => ({
      ...prev,
      advanceReceived: adv,
      balanceAmount: Math.max(0, (Number(prev.orderAmount) || 0) - adv)
    }));
  };

  const handleSendToProductionClick = async (soId) => {
    try {
      await onSendToProduction(soId, {
        workOrderNumber: `WO-${Date.now().toString().slice(-4)}`,
        targetStartDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      showToast('Sales Order approved & handed over to Production Planning!', 'success');
      if (selectedSO) {
        setSelectedSO({ ...selectedSO, productionStatus: 'Sent to Production' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer) {
        showToast('Please select a customer for this Sales Order', 'error');
        return;
      }
      await onSave(formData);
      showToast('Confirmed Sales Order created successfully!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckStock = (so) => {
    const requiredQty = so.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;
    const availableStock = finishedGoods.filter(fg => fg.status === 'In Stock' || fg.status === 'Ready for Dispatch').length;
    setStockCheckResult({
      soNumber: so.soNumber,
      soId: so._id,
      requiredQty,
      availableStock,
      isAvailable: availableStock >= requiredQty
    });
  };

  const filteredOrders = salesOrders
    .filter(s => {
      if (activeTab === 'all') return true;
      if (activeTab === 'Confirmed') return s.status === 'Confirmed' && s.productionStatus !== 'Sent to Production';
      if (activeTab === 'In Process') return s.productionStatus === 'Sent to Production' || s.status === 'In Production';
      if (activeTab === 'Completed') return s.status === 'Completed' || s.status === 'Delivered';
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.soDate || 0) - new Date(a.createdAt || a.soDate || 0));

  const columns = [
    {
      header: 'SO Number',
      accessor: 'soNumber',
      render: (row) => (
        <span className="code-badge" onClick={() => setSelectedSO(row)}>
          {row.soNumber}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'soDate',
      render: (row) => new Date(row.soDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            PO Ref: {row.customerPOReference?.poNumber || 'Direct Order'}
          </div>
        </div>
      )
    },
    {
      header: 'Order Value',
      accessor: 'orderAmount',
      render: (row) => (
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#16A36A' }}>
            ₹{row.orderAmount?.toLocaleString('en-IN')}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Adv: ₹{row.advanceReceived?.toLocaleString('en-IN')}
          </div>
        </div>
      )
    },
    {
      header: 'Delivery Target',
      accessor: 'expectedDeliveryDate',
      render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Production Status',
      accessor: 'productionStatus',
      render: (row) => <StatusBadge status={row.productionStatus || 'Draft'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View Order Particulars" onClick={() => setSelectedSO(row)}>
            <Eye size={15} />
          </button>

          {/* Check Stock Action */}
          <button
            className="btn btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4, height: 26, borderRadius: 6 }}
            title="Check Finished Goods Stock"
            onClick={() => handleCheckStock(row)}
          >
            Check Stock
          </button>

          {/* Send to Production Handover */}
          {row.productionStatus !== 'Sent to Production' && (
            <button
              className="btn btn-primary"
              style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4, height: 26, borderRadius: 6 }}
              title="Dispatch to Production Planning"
              onClick={() => handleSendToProductionClick(row._id)}
            >
              <Factory size={12} /> Send to Prod ➔
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Sales Orders" value={salesOrders.length} subtext="Confirmed Contracts" icon={ShoppingBag} color="var(--primary)" />
        <KpiCard title="In Production Shopfloor" value={salesOrders.filter(s => s.productionStatus === 'Sent to Production').length} subtext="Fabrication / Assembly" icon={Factory} color="#F59E0B" />
        <KpiCard title="Delivered & Closed" value={salesOrders.filter(s => s.status === 'Completed').length} subtext="Fulfilled Deliveries" icon={CheckCircle2} color="#16A36A" />
      </div>

      {/* Sub-tabs Navigation */}
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
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'all', label: 'All Orders', count: salesOrders.length },
            {
              key: 'Confirmed',
              label: 'Confirmed',
              count: salesOrders.filter(s => s.status === 'Confirmed' && s.productionStatus !== 'Sent to Production').length
            },
            {
              key: 'In Process',
              label: 'In Process / Production',
              count: salesOrders.filter(s => s.productionStatus === 'Sent to Production' || s.status === 'In Production').length
            },
            {
              key: 'Completed',
              label: 'Completed',
              count: salesOrders.filter(s => s.status === 'Completed' || s.status === 'Delivered').length
            }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stock Check Notification / Modal */}
      {stockCheckResult && (
        <Modal
          isOpen={!!stockCheckResult}
          onClose={() => setStockCheckResult(null)}
          title={`Stock Check for Order: ${stockCheckResult.soNumber}`}
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              padding: '14px 16px',
              borderRadius: 8,
              background: stockCheckResult.isAvailable ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${stockCheckResult.isAvailable ? '#A7F3D0' : '#FDE68A'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: stockCheckResult.isAvailable ? '#16A36A' : '#D97706'
                }}>
                  {stockCheckResult.isAvailable ? '✓ Finished Goods Available in Warehouse' : '⚠ Insufficient Finished Goods in Stock'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                Required: <strong>{stockCheckResult.requiredQty} Units</strong> | Currently in Warehouse:{' '}
                <strong>{stockCheckResult.availableStock} Units</strong>
              </p>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              {stockCheckResult.isAvailable ? (
                <span>Units are in stock. You can reserve items from Finished Goods inventory and mark ready for Dispatch.</span>
              ) : (
                <span>Since stock is not available in warehouse, send this Sales Order to Production to trigger shopfloor assembly.</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStockCheckResult(null)}
              >
                Close
              </button>
              {!stockCheckResult.isAvailable && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const soId = stockCheckResult.soId;
                    setStockCheckResult(null);
                    handleSendToProductionClick(soId);
                  }}
                >
                  <Factory size={14} /> Send to Production ➔
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search sales order no, customer, PO ref..."
        toolbarAction={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Sales Order
          </button>
        }
      />

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Create & Release Sales Order (SO)"
        subtitle="Transform verified Customer Purchase Orders into executable factory production work orders"
      >
        <form onSubmit={handleSubmit}>
          {/* Section 1: Order Meta */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 12 }}>
            Section 1: Commercial Order & References
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Sales Order Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. SO-002)"
                value={formData.soNumber}
                onChange={(e) => setFormData({ ...formData, soNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                className="form-select"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                required
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.companyName} ({c.customerCode})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Purchase Order (PO) Ref</label>
              <select
                className="form-select"
                value={formData.customerPOReference}
                onChange={(e) => setFormData({ ...formData, customerPOReference: e.target.value })}
              >
                <option value="">No Customer PO / Direct Release</option>
                {customerPOs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.poNumber} - {p.customer?.companyName} (₹{p.poAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Proforma Invoice Ref</label>
              <select
                className="form-select"
                value={formData.piReference}
                onChange={(e) => handlePISelect(e.target.value)}
              >
                <option value="">Select PI Reference...</option>
                {proformaInvoices.map(pi => {
                  const total = Number(pi.grandTotal) || 0;
                  const paid = Number(pi.totalReceived || pi.advanceReceived || (pi.paymentStatus === 'Paid' ? total : 0)) || 0;
                  const bal = pi.balanceAmount !== undefined ? Number(pi.balanceAmount) : Math.max(0, total - paid);
                  const isFullyPaid = bal <= 0 || pi.paymentStatus === 'Paid';
                  const paymentTag = isFullyPaid
                    ? `[Fully Paid: ₹${total.toLocaleString('en-IN')}]`
                    : paid > 0
                      ? `[Paid: ₹${paid.toLocaleString('en-IN')} | Bal: ₹${bal.toLocaleString('en-IN')}]`
                      : `[Bal: ₹${bal.toLocaleString('en-IN')} | Adv Req: ₹${(pi.advanceAmount || Math.round(total * 0.5)).toLocaleString('en-IN')}]`;
                  return (
                    <option key={pi._id} value={pi._id}>
                      {pi.piNumber} - {pi.customer?.companyName || 'Customer'} {paymentTag}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Delivery Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Order Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.orderAmount}
                onChange={(e) => handleOrderAmountChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advance Received (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.advanceReceived}
                onChange={(e) => handleAdvanceChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Remaining Balance (₹)</label>
              <input
                type="number"
                className="form-input"
                readOnly
                style={{ background: 'var(--bg-surface-elevated)', fontWeight: 700 }}
                value={formData.balanceAmount}
              />
            </div>
          </div>

          {/* Payment Status Summary Card when PI is selected */}
          {formData.piReference && (
            <div style={{
              marginTop: 14,
              padding: '10px 14px',
              background: formData.balanceAmount <= 0 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(59, 130, 246, 0.08)',
              border: `1px solid ${formData.balanceAmount <= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: 8,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div>
                <strong>Payment Settlement Status:</strong>{' '}
                {formData.balanceAmount <= 0 ? (
                  <span style={{ color: '#16A36A', fontWeight: 700 }}>✓ Fully Paid & Cleared (₹{Number(formData.advanceReceived).toLocaleString('en-IN')})</span>
                ) : formData.advanceReceived > 0 ? (
                  <span style={{ color: '#2563EB', fontWeight: 600 }}>Partial Advance Paid: ₹{Number(formData.advanceReceived).toLocaleString('en-IN')} • Balance Due: ₹{Number(formData.balanceAmount).toLocaleString('en-IN')}</span>
                ) : (
                  <span style={{ color: '#D97706', fontWeight: 600 }}>⚠️ Advance Not Yet Received • Balance Due: ₹{Number(formData.balanceAmount).toLocaleString('en-IN')}</span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Order Total: <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{Number(formData.orderAmount).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}

          {/* Section 2: Shipping & Delivery Instructions */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8 }}>
              Section 2: Shipping & Delivery Particulars
            </div>

            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Shipping / Delivery Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Production Remarks & Engineering Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.productionRemarks}
                  onChange={(e) => setFormData({ ...formData, productionRemarks: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <ShoppingBag size={15} /> Confirm & Save Sales Order
            </button>
          </div>
        </form>
      </Modal>

      {/* View SO Details Modal */}
      <Modal
        isOpen={!!selectedSO}
        onClose={() => setSelectedSO(null)}
        size="lg"
        title={`Sales Order: ${selectedSO?.soNumber}`}
        subtitle={`Confirmed Order for ${selectedSO?.customer?.companyName}`}
      >
        {selectedSO && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">SO Number</div>
                <div className="detail-value">{selectedSO.soNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Production Status</div>
                <div className="detail-value"><StatusBadge status={selectedSO.productionStatus || 'Pending'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Name</div>
                <div className="detail-value">{selectedSO.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer PO Ref</div>
                <div className="detail-value">{selectedSO.customerPOReference?.poNumber || 'Direct Order'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Total Order Value</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                  ₹{selectedSO.orderAmount?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Advance Received</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  ₹{selectedSO.advanceReceived?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Remaining Balance</div>
                <div className="detail-value" style={{
                  fontFamily: 'var(--font-mono)',
                  color: (selectedSO.balanceAmount || 0) <= 0 ? 'var(--success)' : '#DC2626',
                  fontWeight: 700
                }}>
                  ₹{(selectedSO.balanceAmount !== undefined ? selectedSO.balanceAmount : Math.max(0, (selectedSO.orderAmount || 0) - (selectedSO.advanceReceived || 0))).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Commercial Settlement</div>
                <div className="detail-value">
                  {(selectedSO.balanceAmount || 0) <= 0 ? (
                    <span className="badge badge-success">✓ Fully Paid</span>
                  ) : (selectedSO.advanceReceived || 0) > 0 ? (
                    <span className="badge badge-info">Partial Advance Paid</span>
                  ) : (
                    <span className="badge badge-warning">Advance Pending</span>
                  )}
                </div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Shipping Destination</div>
                <div className="detail-value">{selectedSO.shippingAddress}</div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedSO.productionStatus !== 'Sent to Production' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSendToProductionClick(selectedSO._id)}
                >
                  <Factory size={15} /> Dispatch Work Order to Production ➔
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
