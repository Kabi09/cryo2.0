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
  onSave,
  onSendToProduction,
  preSelectedPI,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);

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
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--success)' }}>
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
          {row.productionStatus !== 'Sent to Production' && (
            <button
              className="btn btn-primary"
              style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4, height: 26, borderRadius: 6 }}
              title="Dispatch to Production Planning"
              onClick={() => handleSendToProductionClick(row._id)}
            >
              <Factory size={12} /> Dispatch to Prod ➔
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
        <KpiCard title="Total Sales Orders" value={salesOrders.length} subtext="Confirmed Contracts" icon={ShoppingBag} color="#6366F1" />
        <KpiCard title="In Production Shopfloor" value={salesOrders.filter(s => s.productionStatus === 'Sent to Production').length} subtext="Fabrication / Assembly" icon={Factory} color="var(--warning)" />
        <KpiCard title="Delivered & Closed" value={salesOrders.filter(s => s.status === 'Completed').length} subtext="Fulfilled Deliveries" icon={CheckCircle2} color="var(--success)" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={salesOrders}
        searchPlaceholder="Search sales order no, customer, PO ref..."
        actions={
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
                onChange={(e) => setFormData({ ...formData, piReference: e.target.value })}
              >
                <option value="">Select PI Reference...</option>
                {proformaInvoices.map(pi => (
                  <option key={pi._id} value={pi._id}>
                    {pi.piNumber} - {pi.customer?.companyName} (Adv: ₹{pi.advanceAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
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
                onChange={(e) => setFormData({ ...formData, orderAmount: Number(e.target.value) })}
              />
            </div>
          </div>

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
