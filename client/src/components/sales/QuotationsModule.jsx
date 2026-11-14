import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  FileSpreadsheet,
  Trash2,
  Send,
  GitBranch,
  Trophy,
  XCircle,
  FileText,
  Receipt,
  PhoneCall,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function QuotationsModule({
  quotations = [],
  customers = [],
  leads = [],
  products = [],
  followUps = [],
  proformaInvoices = [],
  onSave,
  onRevise,
  onUpdateStatus,
  onNavigateToPI,
  onViewPI,
  onSaveFollowUp,
  preSelectedLead,
  onClearPreSelectedLead,
  showToast
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quickFollowUpQuote, setQuickFollowUpQuote] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Draft' | 'Sent' | 'Accepted' | 'Rejected'

  const getQuoteFollowUps = (quoteId, quoteNumber) => {
    return followUps.filter(f =>
      f.relatedQuotation?._id === quoteId ||
      f.relatedQuotation === quoteId ||
      f.quotationReference?._id === quoteId ||
      f.quotationReference === quoteId ||
      (quoteNumber && f.discussionNotes && f.discussionNotes.includes(quoteNumber))
    );
  };

  const getExistingPI = (quoteId) => {
    return proformaInvoices.find(pi => (pi.quotation?._id || pi.quotation) === quoteId);
  };

  // Quick Follow-up Form State
  const [followUpData, setFollowUpData] = useState({
    contactType: 'Phone Call',
    responseStatus: 'Negotiation',
    discussionNotes: '',
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Rejection & Revision State
  const [rejectModalQuote, setRejectModalQuote] = useState(null);
  const [rejectReason, setRejectReason] = useState('Price too high / Commercial negotiation');
  const [rejectNotes, setRejectNotes] = useState('');
  const [revisionReasonText, setRevisionReasonText] = useState('');

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

  // Pre-fill from Lead or Enquiry if redirected
  useEffect(() => {
    if (preSelectedLead) {
      const custId = preSelectedLead.customer?._id || preSelectedLead.customer;
      const qty = Number(preSelectedLead.quantity) || Number(preSelectedLead.expectedQuantity) || 1;
      const unitPrice = preSelectedLead.unitPrice !== undefined && Number(preSelectedLead.unitPrice) > 0
        ? Number(preSelectedLead.unitPrice)
        : (preSelectedLead.expectedOrderValue ? Math.round(Number(preSelectedLead.expectedOrderValue) / qty) : 100000);
      const discount = 0;
      const gstRate = 18;
      const base = (qty * unitPrice) - discount;
      const tax = (base * gstRate) / 100;
      const totalAmount = Math.round(base + tax);

      const initialItem = {
        product: preSelectedLead.interestedProduct?._id || preSelectedLead.product || null,
        productName: preSelectedLead.productName || preSelectedLead.interestedProduct?.productName || 'Cryogenic Equipment Specification',
        description: preSelectedLead.description || preSelectedLead.productDescription || preSelectedLead.productName || 'Custom Specification requirement from Opportunity',
        quantity: qty,
        unit: preSelectedLead.unit || 'Nos',
        unitPrice: unitPrice,
        discount: 0,
        gstPercent: gstRate,
        amount: totalAmount
      };

      setFormData({
        quotationNumber: '',
        version: 'V1',
        quotationDate: new Date().toISOString().split('T')[0],
        customer: custId || '',
        leadReference: preSelectedLead._id && !preSelectedLead.enquiryReference ? preSelectedLead._id : '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryTerms: 'Ex-Factory, 4 to 6 weeks from PO confirmation',
        paymentTerms: '50% Advance with PO, 50% Before Dispatch',
        warranty: '12 Months comprehensive manufacturer warranty',
        notes: preSelectedLead.enquiryNumber
          ? `Quotation generated for Enquiry ${preSelectedLead.enquiryNumber} (${preSelectedLead.companyName || ''}). Standard testing and pre-dispatch inspection included.`
          : `Proposal generated for Lead ${preSelectedLead.leadNumber || ''}. Standard testing and pre-dispatch inspection included.`,
        status: 'Sent',
        items: [initialItem]
      });
      setIsAddOpen(true);
    }
  }, [preSelectedLead]);

  const getInitialItem = (prodId) => {
    const prd = products.find(p => p._id === prodId) || products[0];
    const price = prd ? prd.standardPrice : 100000;
    const qty = 1;
    const tax = (price * 18) / 100;
    return {
      product: prd?._id || null,
      productName: prd?.productName || 'Cryo Vessel / Equipment Spec',
      description: prd?.description || prd?.productName || 'Standard equipment specification',
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
    setRevisionReasonText(quote.status === 'Rejected' && quote.rejectReason ? `Counter-offer addressing: ${quote.rejectReason}` : '');
    setFormData({
      ...quote,
      items: quote.items.map(i => ({
        product: i.product?._id || i.product,
        productName: i.productName || i.product?.productName || i.description || 'Cryo Equipment',
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

  const handleAddItem = () => {
    const initialItem = getInitialItem(products[0]?._id);
    if (initialItem) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, initialItem]
      }));
    }
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      showToast('Quotation must contain at least one line item', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const itm = { ...newItems[index], [field]: value };

    if (field === 'product') {
      const selectedPrd = products.find(p => p._id === value);
      if (selectedPrd) {
        itm.unitPrice = selectedPrd.standardPrice;
        itm.unit = selectedPrd.unit || 'Nos';
        itm.description = selectedPrd.description || selectedPrd.productName;
        itm.productName = selectedPrd.productName;
      }
    }

    if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'gstPercent') {
      const qty = Number(itm.quantity) || 0;
      const price = Number(itm.unitPrice) || 0;
      const disc = Number(itm.discount) || 0;
      const taxRate = Number(itm.gstPercent) || 18;

      const base = qty * price;
      const discountedBase = Math.max(0, base - disc);
      const tax = (discountedBase * taxRate) / 100;
      itm.amount = Math.round(discountedBase + tax);
    }

    newItems[index] = itm;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const subtotal = formData.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);
  const discountTotal = formData.items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const taxableBase = Math.max(0, subtotal - discountTotal);
  const gstTotal = formData.items.reduce((sum, item) => {
    const base = ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)) - (Number(item.discount) || 0);
    return sum + (Math.max(0, base) * (Number(item.gstPercent) || 18)) / 100;
  }, 0);
  const grandTotal = Math.round(taxableBase + gstTotal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer) {
        showToast('Please select a customer for this quotation', 'error');
        return;
      }
      if (formData.items.length === 0) {
        showToast('Please add at least one line item', 'error');
        return;
      }

      await onSave(formData);
      showToast('Quotation proposal issued successfully!', 'success');
      setIsAddOpen(false);
      onClearPreSelectedLead?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviseSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentVerNum = parseInt(selectedQuote.version?.replace('V', '') || '1', 10);
      const nextVersion = `V${currentVerNum + 1}`;

      await onRevise(selectedQuote._id, {
        ...formData,
        version: nextVersion,
        status: 'Sent',
        previousVersion: selectedQuote.version || 'V1',
        previousGrandTotal: selectedQuote.grandTotal || 0,
        revisionReason: revisionReasonText || 'Revised commercial / technical offer'
      });
      showToast(`Quotation revised successfully to version ${nextVersion}!`, 'success');
      setIsReviseOpen(false);
      setSelectedQuote(null);
      setRevisionReasonText('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusUpdate = async (quoteId, statusOrData) => {
    try {
      await onUpdateStatus(quoteId, statusOrData);
      const newStatus = typeof statusOrData === 'object' ? statusOrData.status : statusOrData;
      if (newStatus === 'Accepted') {
        showToast('Quotation Accepted! Opportunity marked as WON.', 'success');
      } else if (newStatus === 'Rejected') {
        showToast('Quotation Rejected. Opportunity marked as LOST.', 'info');
      } else if (newStatus === 'Sent') {
        showToast('Quotation Reopened & Active for Negotiation!', 'success');
      } else {
        showToast(`Quotation status changed to ${newStatus}`, 'success');
      }
      if (selectedQuote) {
        setSelectedQuote(prev => ({
          ...prev,
          status: newStatus,
          rejectReason: typeof statusOrData === 'object' && statusOrData.rejectReason !== undefined ? statusOrData.rejectReason : (newStatus === 'Sent' ? '' : prev?.rejectReason)
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenReject = (quote) => {
    setRejectModalQuote(quote);
    setRejectReason('Price too high / Commercial negotiation');
    setRejectNotes('');
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!rejectModalQuote) return;
    const finalReason = rejectNotes.trim() ? `${rejectReason} — ${rejectNotes.trim()}` : rejectReason;
    await handleStatusUpdate(rejectModalQuote._id, { status: 'Rejected', rejectReason: finalReason });
    setRejectModalQuote(null);
    setRejectNotes('');
  };

  const handleReopenQuote = async (quoteId) => {
    await handleStatusUpdate(quoteId, { status: 'Sent', rejectReason: '' });
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
          <strong style={{ color: 'var(--text-primary)' }}>{row.customer?.companyName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.customer?.contactPerson}</div>
        </div>
      )
    },
    {
      header: 'Products',
      render: (row) => (
        <div>
          {row.items?.map((it, idx) => (
            <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              {it.productName || it.product?.productName || it.description || 'Equipment Item'}: <strong>{it.quantity} {it.unit}</strong>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Total Value',
      accessor: 'grandTotal',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--success)' }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Touchpoints',
      render: (row) => {
        const count = getQuoteFollowUps(row._id, row.quotationNumber).length;
        return (
          <span
            className="badge"
            style={{
              background: count > 0 ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
              color: count > 0 ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${count > 0 ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {count} {count === 1 ? 'Touchpoint' : 'Touchpoints'}
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
      render: (row) => {
        const isAccepted = row.status === 'Accepted';
        const isRejected = row.status === 'Rejected';
        return (
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

            {/* If Rejected: DO NOT show Accept! Show Reopen / Reverse button */}
            {isRejected ? (
              <button
                className="icon-btn"
                title="Reverse / Reopen Quotation for Negotiation"
                style={{ color: '#2563EB' }}
                onClick={() => handleReopenQuote(row._id)}
              >
                <RotateCcw size={15} />
              </button>
            ) : isAccepted ? (
              (() => {
                const existingPI = getExistingPI(row._id);
                if (existingPI) {
                  return (
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        gap: 4,
                        height: 26,
                        borderRadius: 6,
                        borderColor: 'var(--success-border)',
                        color: 'var(--success)'
                      }}
                      title={`View Linked Proforma Invoice (${existingPI.piNumber})`}
                      onClick={() => onViewPI ? onViewPI(existingPI) : onNavigateToPI?.(row)}
                    >
                      <Receipt size={12} /> View PI ({existingPI.piNumber}) ➔
                    </button>
                  );
                }
                return (
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      gap: 4,
                      height: 26,
                      borderRadius: 6
                    }}
                    title="Generate Proforma Invoice (PI)"
                    onClick={() => onNavigateToPI?.(row)}
                  >
                    <Receipt size={12} /> Generate PI ➔
                  </button>
                );
              })()
            ) : (
              <>
                <button
                  className="icon-btn"
                  title="Customer Accepted (Mark Won)"
                  style={{ color: '#10B981' }}
                  onClick={() => handleStatusUpdate(row._id, 'Accepted')}
                >
                  <Trophy size={15} />
                </button>
                <button
                  className="icon-btn"
                  title="Reject Quotation"
                  style={{ color: '#EF4444' }}
                  onClick={() => handleOpenReject(row)}
                >
                  <XCircle size={15} />
                </button>
              </>
            )}

            {/* Follow-up logger */}
            <button
              className="icon-btn"
              title="Log Follow-up / Discussion Note"
              style={{ color: 'var(--primary)' }}
              onClick={() => {
                setQuickFollowUpQuote(row);
                setFollowUpData({
                  contactType: 'Phone Call',
                  responseStatus: 'Negotiation',
                  discussionNotes: '',
                  nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
              }}
            >
              <PhoneCall size={14} />
            </button>
          </div>
        );
      }
    }
  ];

  const filteredQuotations = quotations
    .filter(q => {
      if (activeTab === 'all') return true;
      if (activeTab === 'Draft') return q.status === 'Draft';
      if (activeTab === 'Sent') return q.status === 'Sent' || q.status === 'Under Review' || q.status === 'Negotiation';
      if (activeTab === 'Accepted') return q.status === 'Accepted';
      if (activeTab === 'Rejected') return q.status === 'Rejected';
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.quotationDate || 0) - new Date(a.createdAt || a.quotationDate || 0));

  return (
    <div className="module-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total Quotes" value={quotations.length} subtext="Proposals Generated" icon={FileSpreadsheet} color="var(--primary)" />
        <KpiCard title="Under Negotiation" value={quotations.filter(q => q.status === 'Negotiation' || q.status === 'Under Review').length} subtext="Revised Versions" icon={GitBranch} color="#F59E0B" />
        <KpiCard title="Accepted Quotes" value={quotations.filter(q => q.status === 'Accepted').length} subtext="Won for PI release" icon={Trophy} color="#16A36A" />
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
            { key: 'all', label: 'All Quotations', count: quotations.length },
            { key: 'Draft', label: 'Draft', count: quotations.filter(q => q.status === 'Draft').length },
            { key: 'Sent', label: 'Sent / Review', count: quotations.filter(q => q.status === 'Sent' || q.status === 'Under Review' || q.status === 'Negotiation').length },
            { key: 'Accepted', label: 'Accepted', count: quotations.filter(q => q.status === 'Accepted').length },
            { key: 'Rejected', label: 'Rejected', count: quotations.filter(q => q.status === 'Rejected').length }
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

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredQuotations}
        searchPlaceholder="Search quotation number, customer, product..."
        toolbarAction={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Quotation
          </button>
        }
      />

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          onClearPreSelectedLead?.();
        }}
        size="lg"
        title="Create Product Quotation"
        subtitle="Prepare official commercial proposal with multi-line items, taxes, and validity terms"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 12 }}>
            Section 1: Basic Particulars
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quotation Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. QT-001)"
                value={formData.quotationNumber}
                onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Company *</label>
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
              <label className="form-label">Lead Reference</label>
              <select
                className="form-select"
                value={formData.leadReference}
                onChange={(e) => setFormData({ ...formData, leadReference: e.target.value })}
              >
                <option value="">No Lead / Direct Quote</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.leadNumber} - {l.customer?.companyName || 'Lead'} (₹{l.expectedOrderValue?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.quotationDate}
                onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                className="form-input"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                Section 2: Commercial Equipment & Line Items
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="subtable-box">
              <datalist id="quotation-product-suggestions">
                {products.map(p => (
                  <option key={p._id} value={p.productName}>
                    {p.productCode} - Standard: ₹{p.standardPrice?.toLocaleString('en-IN')}
                  </option>
                ))}
              </datalist>

              <table className="subtable">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Product / Specification</th>
                    <th style={{ width: '12%' }}>Quantity</th>
                    <th style={{ width: '10%' }}>Unit</th>
                    <th style={{ width: '18%' }}>Unit Price (₹)</th>
                    <th style={{ width: '12%' }}>GST %</th>
                    <th style={{ width: '15%' }}>Total (₹)</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          list="quotation-product-suggestions"
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          placeholder="Type or select equipment..."
                          value={item.productName || ''}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        />
                      </td>
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
                          type="text"
                          className="form-input"
                          style={{ padding: '4px 8px' }}
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
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
                          value={item.gstPercent}
                          onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                        />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                        ₹{item.amount?.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="icon-btn text-danger"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Terms & Summary */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8 }}>
              Section 3: Terms & Total
            </div>

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
              background: 'var(--bg-surface-elevated)',
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
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>-₹{discountTotal.toLocaleString('en-IN')}</span>
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
                color: 'var(--text-primary)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 8
              }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddOpen(false);
                onClearPreSelectedLead?.();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> Issue Official Quotation (V1)
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
        subtitle={`Branching from ${selectedQuote?.version || 'V1'} to new revision`}
      >
        <form onSubmit={handleReviseSubmit}>
          {/* Previous Version Audit & Context */}
          <div style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Base Version: <strong style={{ color: 'var(--primary)' }}>{selectedQuote?.version || 'V1'}</strong>
                {' • '}
                Previous Value: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>₹{selectedQuote?.grandTotal?.toLocaleString('en-IN')}</strong>
                {' • '}
                Status: <StatusBadge status={selectedQuote?.status} />
              </div>
              {selectedQuote?.status === 'Rejected' && selectedQuote?.rejectReason && (
                <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={13} />
                  <span><strong>Rejection Feedback:</strong> {selectedQuote.rejectReason}</span>
                </div>
              )}
            </div>
            <div className="badge badge-info" style={{ fontWeight: 700, padding: '5px 10px', fontSize: '0.8rem' }}>
              Target Version: V{parseInt(selectedQuote?.version?.replace('V', '') || '1', 10) + 1}
            </div>
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        value={item.productName || item.description || ''}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                      />
                    </td>
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
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Revision Reason Field */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Reason for Revision / Change Summary *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. 5% commercial discount applied per client negotiation, updated technical warranty"
              value={revisionReasonText}
              onChange={(e) => setRevisionReasonText(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Revised Grand Total: </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsReviseOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <GitBranch size={15} /> Save Revised Version
              </button>
            </div>
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
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={selectedQuote.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Version</div>
                <div className="detail-value">{selectedQuote.version}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Company</div>
                <div className="detail-value">{selectedQuote.customer?.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedQuote.customer?.contactPerson}</div>
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

            {/* Rejection Banner & Quick Reopen/Revise if Rejected */}
            {selectedQuote.status === 'Rejected' && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={15} /> Quotation Rejected (Lost)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#991B1B', marginTop: 4 }}>
                    <strong>Reason:</strong> {selectedQuote.rejectReason || 'No specific rejection reason recorded.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF', fontWeight: 600 }}
                    onClick={() => handleReopenQuote(selectedQuote._id)}
                  >
                    <RotateCcw size={13} /> Reopen for Negotiation
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#D97706', borderColor: '#D97706', fontWeight: 600 }}
                    onClick={() => {
                      const q = selectedQuote;
                      setSelectedQuote(null);
                      handleOpenRevise(q);
                    }}
                  >
                    <GitBranch size={13} /> Revise (V{parseInt(selectedQuote.version?.replace('V', '') || '1', 10) + 1})
                  </button>
                </div>
              </div>
            )}

            {/* Revision Audit History Banner */}
            {selectedQuote.previousVersion && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 8,
                fontSize: '0.82rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Revision Lineage: Revised from <span className="badge badge-info">{selectedQuote.previousVersion}</span>
                  {selectedQuote.previousGrandTotal > 0 && (
                    <span> (Previous Value: <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{selectedQuote.previousGrandTotal.toLocaleString('en-IN')}</strong>)</span>
                  )}
                </div>
                {selectedQuote.revisionReason && (
                  <div style={{ marginTop: 4, color: 'var(--text-primary)' }}>
                    <strong>Reason for Revision:</strong> {selectedQuote.revisionReason}
                  </div>
                )}
              </div>
            )}

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
                          <strong>{it.productName || it.product?.productName || it.description || 'Custom Item'}</strong>
                          {it.description && it.description !== it.productName && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{it.description}</div>
                          )}
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

            {/* Linked PI Banner if already generated */}
            {(() => {
              const existingPI = getExistingPI(selectedQuote._id);
              if (!existingPI) return null;
              return (
                <div style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  background: 'rgba(52, 211, 153, 0.08)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '0.82rem' }}>
                    <strong style={{ color: 'var(--success)' }}>Proforma Invoice Generated:</strong>{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{existingPI.piNumber}</span> • Status: <span style={{ fontWeight: 600 }}>{existingPI.status}</span> • Total: ₹{existingPI.grandTotal?.toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 10px', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success-border)' }}
                    onClick={() => {
                      const pi = existingPI;
                      setSelectedQuote(null);
                      onViewPI ? onViewPI(pi) : onNavigateToPI?.(selectedQuote);
                    }}
                  >
                    <Receipt size={12} /> View PI ({existingPI.piNumber}) ➔
                  </button>
                </div>
              );
            })()}

            <div style={{
              marginTop: 18,
              padding: '12px 18px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grand Total (All Taxes Included): </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedQuote.grandTotal?.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {selectedQuote.status === 'Accepted' && (
                  (() => {
                    const existingPI = getExistingPI(selectedQuote._id);
                    if (existingPI) {
                      return (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--success)', borderColor: 'var(--success-border)', fontWeight: 600 }}
                          onClick={() => {
                            const pi = existingPI;
                            setSelectedQuote(null);
                            onViewPI ? onViewPI(pi) : onNavigateToPI?.(selectedQuote);
                          }}
                        >
                          <Receipt size={14} /> View Linked PI ({existingPI.piNumber}) ➔
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const q = selectedQuote;
                          setSelectedQuote(null);
                          onNavigateToPI(q);
                        }}
                      >
                        <Receipt size={14} /> Generate Proforma Invoice (PI) ➔
                      </button>
                    );
                  })()
                )}
                {selectedQuote.status === 'Rejected' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF', fontWeight: 600 }}
                      onClick={() => handleReopenQuote(selectedQuote._id)}
                    >
                      <RotateCcw size={14} /> Reverse / Reopen for Negotiation
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ background: '#D97706', borderColor: '#D97706', fontWeight: 600 }}
                      onClick={() => {
                        const q = selectedQuote;
                        setSelectedQuote(null);
                        handleOpenRevise(q);
                      }}
                    >
                      <GitBranch size={14} /> Revise to New Version
                    </button>
                  </>
                ) : selectedQuote.status !== 'Accepted' ? (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusUpdate(selectedQuote._id, 'Accepted')}
                    >
                      <Trophy size={14} /> Accept & Mark Won
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleOpenReject(selectedQuote)}
                    >
                      <XCircle size={14} /> Reject & Mark Lost
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Quotation Follow-up & Discussion History Timeline */}
            <div style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Quotation Follow-up & Discussion History ({getQuoteFollowUps(selectedQuote._id, selectedQuote.quotationNumber).length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                  onClick={() => {
                    const q = selectedQuote;
                    setSelectedQuote(null);
                    setQuickFollowUpQuote(q);
                  }}
                >
                  <PhoneCall size={12} /> + Add Follow-up Note
                </button>
              </div>

              {getQuoteFollowUps(selectedQuote._id, selectedQuote.quotationNumber).length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No follow-up notes logged for this quotation yet. Click <strong>+ Add Follow-up Note</strong> to record customer negotiations and discussions.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
                  {getQuoteFollowUps(selectedQuote._id, selectedQuote.quotationNumber).map((fu, idx) => (
                    <div
                      key={fu._id || idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary)' }}>
                            {fu.contactMethod || fu.contactType || 'Phone Call'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(fu.contactDate || fu.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <StatusBadge status={fu.customerResponse || fu.responseStatus || fu.status || 'Negotiation'} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 4 }}>
                        {fu.discussionNotes}
                      </div>
                      {fu.nextFollowUpDate && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Next Reminder: <strong>{new Date(fu.nextFollowUpDate).toLocaleDateString('en-GB')}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Follow-up Modal for Quotation Negotiations */}
      <Modal
        isOpen={!!quickFollowUpQuote}
        onClose={() => setQuickFollowUpQuote(null)}
        title={`Log Follow-up: ${quickFollowUpQuote?.quotationNumber}`}
        subtitle={`Negotiation note for ${quickFollowUpQuote?.customer?.companyName || 'Quotation'}`}
        size="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!quickFollowUpQuote) return;
          try {
            if (!followUpData.discussionNotes) {
              showToast('Please enter discussion notes', 'error');
              return;
            }
            if (onSaveFollowUp) {
              await onSaveFollowUp({
                customer: quickFollowUpQuote.customer?._id || quickFollowUpQuote.customer,
                companyName: quickFollowUpQuote.customer?.companyName || '',
                relatedQuotation: quickFollowUpQuote._id,
                quotationReference: quickFollowUpQuote._id,
                contactMethod: followUpData.contactType,
                contactType: followUpData.contactType,
                customerResponse: followUpData.responseStatus,
                responseStatus: followUpData.responseStatus,
                discussionNotes: `[${quickFollowUpQuote.quotationNumber}] ${followUpData.discussionNotes}`,
                nextFollowUpDate: followUpData.nextFollowUpDate,
                priority: 'High',
                status: 'Pending'
              });
              showToast(`Follow-up note logged for ${quickFollowUpQuote.quotationNumber}!`, 'success');
            }
            setQuickFollowUpQuote(null);
          } catch (err) {
            showToast(err.message, 'error');
          }
        }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contact Method</label>
              <select
                className="form-select"
                value={followUpData.contactType}
                onChange={(e) => setFollowUpData({ ...followUpData, contactType: e.target.value })}
              >
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="In-Person Meeting">In-Person Meeting</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Client Feedback</label>
              <select
                className="form-select"
                value={followUpData.responseStatus}
                onChange={(e) => setFollowUpData({ ...followUpData, responseStatus: e.target.value })}
              >
                <option value="Negotiation">Commercial Negotiation / Discount</option>
                <option value="Interested">Approved / Preparing PO</option>
                <option value="Call Scheduled">Follow-up Call Scheduled</option>
                <option value="No Response">Awaiting Management Review</option>
                <option value="Not Interested">Price Too High / Lost</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Discussion Notes *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Client requested 5% discount on bulk purchase or revised delivery terms..."
                value={followUpData.discussionNotes}
                onChange={(e) => setFollowUpData({ ...followUpData, discussionNotes: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Next Reminder Date</label>
              <input
                type="date"
                className="form-input"
                value={followUpData.nextFollowUpDate}
                onChange={(e) => setFollowUpData({ ...followUpData, nextFollowUpDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setQuickFollowUpQuote(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Negotiation Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Quotation Reason Modal */}
      <Modal
        isOpen={!!rejectModalQuote}
        onClose={() => setRejectModalQuote(null)}
        title={`Reject Quotation: ${rejectModalQuote?.quotationNumber}`}
        subtitle={`Record client feedback and reason for lost proposal`}
        maxWidth="520px"
      >
        <form onSubmit={handleConfirmReject}>
          <div className="form-group">
            <label className="form-label">Primary Rejection Reason *</label>
            <select
              className="form-control"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="Price too high / Commercial negotiation">Price too high / Commercial negotiation</option>
              <option value="Competitor selected (Lower price or brand)">Competitor selected (Lower price or brand)</option>
              <option value="Technical specification mismatch">Technical specification mismatch</option>
              <option value="Lead time / Delivery schedule too long">Lead time / Delivery schedule too long</option>
              <option value="Project cancelled / Budget postponed by client">Project cancelled / Budget postponed by client</option>
              <option value="Payment terms rejected">Payment terms rejected</option>
              <option value="Other / Client specific feedback">Other / Client specific feedback</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Client Notes & Feedback Details</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Client requested 8% price cut or 60 days credit; opted for local supplier..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRejectModalQuote(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              style={{ gap: 6 }}
            >
              <XCircle size={14} /> Confirm Rejection & Mark Lost
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
