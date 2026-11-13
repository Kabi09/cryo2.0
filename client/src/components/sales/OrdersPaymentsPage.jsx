import React, { useState } from 'react';
import CustomerPOsModule from './CustomerPOsModule';
import PaymentsModule from './PaymentsModule';
import SalesOrdersModule from './SalesOrdersModule';
import { FileCheck2, CreditCard, ShoppingBag } from 'lucide-react';

export default function OrdersPaymentsPage({
  customerPOs,
  payments,
  salesOrders,
  customers,
  proformaInvoices,
  quotations,
  products,
  onSaveCustomerPO,
  onVerifyCustomerPO,
  onSavePayment,
  onVerifyPayment,
  onSaveSalesOrder,
  onSendToProduction,
  showToast,
  defaultTab = 'so'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'so' ? 'active' : ''}`}
            onClick={() => setActiveTab('so')}
          >
            <ShoppingBag size={14} style={{ marginRight: 6 }} />
            Sales Orders ({salesOrders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'cpo' ? 'active' : ''}`}
            onClick={() => setActiveTab('cpo')}
          >
            <FileCheck2 size={14} style={{ marginRight: 6 }} />
            Customer Purchase Orders ({customerPOs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={14} style={{ marginRight: 6 }} />
            Payments & Collections ({payments.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'so' && (
        <SalesOrdersModule
          salesOrders={salesOrders}
          customers={customers}
          customerPOs={customerPOs}
          quotations={quotations}
          proformaInvoices={proformaInvoices}
          products={products}
          onSave={onSaveSalesOrder}
          onSendToProduction={onSendToProduction}
          showToast={showToast}
        />
      )}

      {activeTab === 'cpo' && (
        <CustomerPOsModule
          customerPOs={customerPOs}
          customers={customers}
          proformaInvoices={proformaInvoices}
          quotations={quotations}
          onSave={onSaveCustomerPO}
          onVerify={onVerifyCustomerPO}
          showToast={showToast}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsModule
          payments={payments}
          customers={customers}
          proformaInvoices={proformaInvoices}
          onSave={onSavePayment}
          onVerify={onVerifyPayment}
          showToast={showToast}
        />
      )}
    </div>
  );
}

