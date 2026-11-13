import React, { useState } from 'react';
import { Plus, Eye, ShoppingBag, Factory, Printer, CheckCircle2, Clock } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function SalesOrdersModule({ salesOrders, customers, customerPOs, quotations, proformaInvoices, products, onSave, onSendToProduction, showToast }) {
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

  const handleOpenAdd = () => {
    const verifiedPO = customerPOs.find(p => p.status === 'Verified') || customerPOs[0];
    const cust = verifiedPO?.customer?._id || customers[0]?._id;
    const prd = products[0];

    const initialItems = prd ? [
      {
        product: prd._id,
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
      deliveryInstructions: 'Special crane required for machine shopfloor uncrating.',
      productionRemarks: 'Raw Material requisition raised. Structural fabrication in progress.',
      status: 'Confirmed',
      items: initialItems
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer) {
        showToast('Please select a customer', 'error');
        return;
      }
      await onSave(formData);
      showToast('Sales Order created and confirmed!', 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDispatchProduction = async (soId) => {
    try {
      await onSendToProduction(soId, { productionRemarks: 'Commercial order released to Shopfloor Production department.' });
      showToast('Sales Order successfully dispatched to Production!', 'success');
      if (selectedSO) {
        setSelectedSO({ ...selectedSO, productionStatus: 'Sent to Production', status: 'In Production' });
      }
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
      header: 'Customer PO Ref',
      render: (row) => row.customerPOReference?.customerPONumber || 'PO-Direct'
    },
    {
      header: 'Equipment Summary',
      render: (row) => (
        <div>
          {row.items?.map((it, idx) => (
            <div key={idx} style={{ fontSize: '0.8rem', color: '#C7D2FE' }}>
              {it.product?.productName || 'Machine'}: <strong>{it.quantity} {it.unit}</strong>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Order Value',
      accessor: 'orderAmount',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34D399' }}>
          ₹{row.orderAmount?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Delivery Target',
      accessor: 'expectedDeliveryDate',
      render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Shopfloor Status',
      accessor: 'productionStatus',
      render: (row) => {
        let bClass = 'badge-neutral';
        if (row.productionStatus === 'Sent to Production' || row.productionStatus === 'In Fabrication') bClass = 'badge-warning';
        if (row.productionStatus === 'Completed') bClass = 'badge-success';
        return <span className={`badge ${bClass}`}>{row.productionStatus}</span>;
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
          <button className="icon-btn" title="View SO Details" onClick={() => setSelectedSO(row)}>
            <Eye size={15} />
          </button>
          {row.productionStatus === 'Not Started' && (
            <button
              className="icon-btn"
              title="Send to Production Shopfloor"
              style={{ color: '#06B6D4' }}
              onClick={() => handleDispatchProduction(row._id)}
            >
              <Factory size={15} />
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
        <KpiCard title="In Production Shopfloor" value={salesOrders.filter(s => s.productionStatus === 'Sent to Production').length} subtext="Fabrication / Assembly" icon={Factory} color="#F59E0B" />
        <KpiCard title="Delivered & Closed" value={salesOrders.filter(s => s.status === 'Completed').length} subtext="Fulfilled Deliveries" icon={CheckCircle2} color="#10B981" />
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
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818CF8', marginBottom: 12 }}>
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
              <label className="form-label">Customer Account <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              >
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Verified Customer PO Reference</label>
              <select
                className="form-select"
                value={formData.customerPOReference}
                onChange={(e) => setFormData({ ...formData, customerPOReference: e.target.value })}
              >
                <option value="">Select Customer PO</option>
                {customerPOs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.customerPONumber} ({p.internalPOId}) — {p.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Committed Delivery Target <span className="req">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Contract Value (₹) <span className="req">*</span></label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={formData.orderAmount}
                onChange={(e) => setFormData({ ...formData, orderAmount: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advance Remitted (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.advanceReceived}
                onChange={(e) => setFormData({ ...formData, advanceReceived: Number(e.target.value) })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Plant Shipping Destination</label>
              <input
                type="text"
                className="form-input"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Delivery & Unloading Instructions</label>
              <input
                type="text"
                className="form-input"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Shopfloor Production Instructions</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Routing to machine bay, sub-assembly milestones..."
                value={formData.productionRemarks}
                onChange={(e) => setFormData({ ...formData, productionRemarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Confirm Sales Order
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedSO}
        onClose={() => setSelectedSO(null)}
        size="lg"
        title={`Sales Order: ${selectedSO?.soNumber}`}
        subtitle={`Issued for ${selectedSO?.customer?.companyName}`}
      >
        {selectedSO && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Sales Order No</div>
                <div className="detail-value">{selectedSO.soNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Commercial Status</div>
                <div className="detail-value"><StatusBadge status={selectedSO.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Company</div>
                <div className="detail-value">{selectedSO.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Production Status</div>
                <div className="detail-value" style={{ color: '#06B6D4' }}>{selectedSO.productionStatus}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Order Total Value</div>
                <div className="detail-value" style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedSO.orderAmount?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Advance Received</div>
                <div className="detail-value" style={{ color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedSO.advanceReceived?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="detail-item col-span-2">
                <div className="detail-label">Delivery Destination & Instructions</div>
                <div className="detail-value" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  {selectedSO.shippingAddress} • {selectedSO.deliveryInstructions}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print SO Sheet
              </button>
              {selectedSO.productionStatus === 'Not Started' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleDispatchProduction(selectedSO._id)}
                >
                  <Factory size={15} /> Dispatch Work Order to Production
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

