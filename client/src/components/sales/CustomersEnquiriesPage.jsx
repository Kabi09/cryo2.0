import React, { useState } from 'react';
import CustomersLeadsModule from './CustomersLeadsModule';
import EnquiriesModule from './EnquiriesModule';
import { Users, HelpCircle } from 'lucide-react';

export default function CustomersEnquiriesPage({
  customers,
  leads,
  enquiries,
  products,
  onSaveCustomer,
  onSaveLead,
  onUpdateLeadStatus,
  onSaveEnquiry,
  onConvertToLead,
  showToast,
  defaultTab = 'customers-leads'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'customers-leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers-leads')}
          >
            <Users size={14} style={{ marginRight: 6 }} />
            Customers & Leads ({customers.length} Clients / {leads.length} Leads)
          </button>
          <button
            className={`tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <HelpCircle size={14} style={{ marginRight: 6 }} />
            Customer Enquiries ({enquiries.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'customers-leads' && (
        <CustomersLeadsModule
          customers={customers}
          leads={leads}
          products={products}
          onSaveCustomer={onSaveCustomer}
          onSaveLead={onSaveLead}
          onUpdateLeadStatus={onUpdateLeadStatus}
          showToast={showToast}
        />
      )}

      {activeTab === 'enquiries' && (
        <EnquiriesModule
          enquiries={enquiries}
          products={products}
          customers={customers}
          onSave={onSaveEnquiry}
          onConvertToLead={onConvertToLead}
          showToast={showToast}
        />
      )}
    </div>
  );
}

