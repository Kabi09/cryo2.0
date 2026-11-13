import React, { useState } from 'react';
import QuotationsModule from './QuotationsModule';
import ProformaInvoicesModule from './ProformaInvoicesModule';
import { FileText, Receipt } from 'lucide-react';

export default function QuotationsPIPage({
  quotations,
  proformaInvoices,
  customers,
  leads,
  products,
  onSaveQuotation,
  onReviseQuotation,
  onUpdateQuotationStatus,
  onSavePI,
  showToast,
  defaultTab = 'quotations'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'quotations' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotations')}
          >
            <FileText size={14} style={{ marginRight: 6 }} />
            Quotations ({quotations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'pi' ? 'active' : ''}`}
            onClick={() => setActiveTab('pi')}
          >
            <Receipt size={14} style={{ marginRight: 6 }} />
            Proforma Invoices (PI) ({proformaInvoices.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'quotations' && (
        <QuotationsModule
          quotations={quotations}
          customers={customers}
          leads={leads}
          products={products}
          onSave={onSaveQuotation}
          onRevise={onReviseQuotation}
          onUpdateStatus={onUpdateQuotationStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'pi' && (
        <ProformaInvoicesModule
          proformaInvoices={proformaInvoices}
          quotations={quotations}
          onSave={onSavePI}
          showToast={showToast}
        />
      )}
    </div>
  );
}

