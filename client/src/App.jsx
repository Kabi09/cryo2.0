import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

// Supply Chain Management Modules
import MaterialMasterModule from './components/modules/MaterialMasterModule';
import SuppliersModule from './components/modules/SuppliersModule';
import SupplierMaterialLinkModule from './components/modules/SupplierMaterialLinkModule';
import PurchaseOrdersModule from './components/modules/PurchaseOrdersModule';
import GRNModule from './components/modules/GRNModule';
import QCTestsModule from './components/modules/QCTestsModule';
import InventoryModule from './components/modules/InventoryModule';
import MaterialIssueModule from './components/modules/MaterialIssueModule';
import SupplierReturnsModule from './components/modules/SupplierReturnsModule';
import InventoryReportModule from './components/modules/InventoryReportModule';

// Sales Management Modules
import DashboardModule from './components/sales/DashboardModule';
import EnquiriesModule from './components/sales/EnquiriesModule';
import CustomersLeadsModule from './components/sales/CustomersLeadsModule';
import FollowUpsModule from './components/sales/FollowUpsModule';
import QuotationsModule from './components/sales/QuotationsModule';
import ProformaInvoicesModule from './components/sales/ProformaInvoicesModule';
import CustomerPOsModule from './components/sales/CustomerPOsModule';
import PaymentsModule from './components/sales/PaymentsModule';
import SalesOrdersModule from './components/sales/SalesOrdersModule';
import SalesReportsModule from './components/sales/SalesReportsModule';

import { api } from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeDomain, setActiveDomain] = useState('scm'); // 'scm' or 'sales'
  const [activeModule, setActiveModule] = useState('scm-materials');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cross-module state (SCM GRN to QC navigation)
  const [preSelectedGRNForQC, setPreSelectedGRNForQC] = useState(null);

  // SCM State
  const [materials, setMaterials] = useState([]);
  const [scmSuppliers, setScmSuppliers] = useState([]);
  const [supplierLinks, setSupplierLinks] = useState([]);
  const [scmPurchaseOrders, setScmPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [qcTests, setQcTests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [materialIssues, setMaterialIssues] = useState([]);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [scmReportsData, setScmReportsData] = useState(null);

  // Sales State
  const [products, setProducts] = useState([]);
  const [salesCustomers, setSalesCustomers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [customerPOs, setCustomerPOs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [salesDashboardData, setSalesDashboardData] = useState(null);
  const [salesReportsData, setSalesReportsData] = useState(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        // SCM Calls
        matRes,
        supRes,
        linkRes,
        scmPoRes,
        grnRes,
        qcRes,
        invRes,
        issueRes,
        retRes,
        scmRepRes,
        // Sales Calls
        prodRes,
        custRes,
        enqRes,
        leadRes,
        fuRes,
        quoteRes,
        piRes,
        cpoRes,
        payRes,
        soRes,
        salesDashRes,
        salesRepRes
      ] = await Promise.all([
        api.getMaterials().catch(() => ({ data: [] })),
        api.getSuppliers().catch(() => ({ data: [] })),
        api.getSupplierMaterialLinks().catch(() => ({ data: [] })),
        api.getPurchaseOrders().catch(() => ({ data: [] })),
        api.getGRNs().catch(() => ({ data: [] })),
        api.getQCTests().catch(() => ({ data: [] })),
        api.getInventory().catch(() => ({ data: [] })),
        api.getMaterialIssues().catch(() => ({ data: [] })),
        api.getSupplierReturns().catch(() => ({ data: [] })),
        api.getReports().catch(() => null),
        api.getProducts().catch(() => ({ data: [] })),
        api.getCustomers().catch(() => ({ data: [] })),
        api.getEnquiries().catch(() => ({ data: [] })),
        api.getLeads().catch(() => ({ data: [] })),
        api.getFollowUps().catch(() => ({ data: [] })),
        api.getQuotations().catch(() => ({ data: [] })),
        api.getProformaInvoices().catch(() => ({ data: [] })),
        api.getCustomerPOs().catch(() => ({ data: [] })),
        api.getPayments().catch(() => ({ data: [] })),
        api.getSalesOrders().catch(() => ({ data: [] })),
        api.getDashboardSummary().catch(() => null),
        api.getSalesReports().catch(() => null)
      ]);

      // Populate SCM
      setMaterials(matRes.data || []);
      setScmSuppliers(supRes.data || []);
      setSupplierLinks(linkRes.data || []);
      setScmPurchaseOrders(scmPoRes.data || []);
      setGrns(grnRes.data || []);
      setQcTests(qcRes.data || []);
      setInventory(invRes.data || []);
      setMaterialIssues(issueRes.data || []);
      setSupplierReturns(retRes.data || []);
      setScmReportsData(scmRepRes || null);

      // Populate Sales
      setProducts(prodRes.data || []);
      setSalesCustomers(custRes.data || []);
      setEnquiries(enqRes.data || []);
      setLeads(leadRes.data || []);
      setFollowUps(fuRes.data || []);
      setQuotations(quoteRes.data || []);
      setProformaInvoices(piRes.data || []);
      setCustomerPOs(cpoRes.data || []);
      setPayments(payRes.data || []);
      setSalesOrders(soRes.data || []);
      setSalesDashboardData(salesDashRes || null);
      setSalesReportsData(salesRepRes || null);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Error connecting to backend services', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleDomainChange = (domain) => {
    setActiveDomain(domain);
    if (domain === 'scm') {
      setActiveModule('scm-materials');
    } else {
      setActiveModule('sales-dashboard');
    }
  };

  // SCM Handlers
  const handleSaveMaterial = async (data) => {
    await api.createMaterial(data);
    await loadAllData();
  };
  const handleUpdateMaterial = async (id, data) => {
    await api.updateMaterial(id, data);
    await loadAllData();
  };
  const handleSaveScmSupplier = async (data) => {
    await api.createSupplier(data);
    await loadAllData();
  };
  const handleUpdateScmSupplier = async (id, data) => {
    await api.updateSupplier(id, data);
    await loadAllData();
  };
  const handleSaveSupplierLink = async (data) => {
    await api.createSupplierMaterialLink(data);
    await loadAllData();
  };
  const handleUpdateSupplierLink = async (id, data) => {
    await api.updateSupplierMaterialLink(id, data);
    await loadAllData();
  };
  const handleSaveScmPO = async (data) => {
    await api.createPurchaseOrder(data);
    await loadAllData();
  };
  const handleUpdateScmPOStatus = async (id, status) => {
    await api.updatePOStatus(id, status);
    await loadAllData();
  };
  const handleSaveGRN = async (data) => {
    await api.createGRN(data);
    await loadAllData();
  };
  const handleSaveQCTest = async (data) => {
    await api.createQCTest(data);
    await loadAllData();
  };
  const handleAdjustStock = async (data) => {
    await api.adjustStock(data);
    await loadAllData();
  };
  const handleSaveMaterialIssue = async (data) => {
    await api.createMaterialIssue(data);
    await loadAllData();
  };
  const handleSaveSupplierReturn = async (data) => {
    await api.createSupplierReturn(data);
    await loadAllData();
  };
  const handleNavigateToQC = (grn) => {
    setPreSelectedGRNForQC(grn);
    setActiveModule('scm-qc-tests');
  };

  // Sales Handlers
  const handleSaveEnquiry = async (data) => {
    await api.createEnquiry(data);
    await loadAllData();
  };
  const handleConvertToLead = async (id) => {
    await api.convertEnquiryToLead(id);
    await loadAllData();
  };
  const handleSaveSalesCustomer = async (data) => {
    const res = await api.createCustomer(data);
    await loadAllData();
    return res;
  };
  const handleSaveLead = async (data) => {
    await api.createLead(data);
    await loadAllData();
  };
  const handleUpdateLeadStatus = async (id, status) => {
    await api.updateLeadStatus(id, status);
    await loadAllData();
  };
  const handleSaveFollowUp = async (data) => {
    await api.createFollowUp(data);
    await loadAllData();
  };
  const handleUpdateFollowUpStatus = async (id, status) => {
    await api.updateFollowUpStatus(id, status);
    await loadAllData();
  };
  const handleSaveQuotation = async (data) => {
    await api.createQuotation(data);
    await loadAllData();
  };
  const handleReviseQuotation = async (id, data) => {
    await api.reviseQuotation(id, data);
    await loadAllData();
  };
  const handleUpdateQuotationStatus = async (id, status) => {
    await api.updateQuotationStatus(id, status);
    await loadAllData();
  };
  const handleSavePI = async (data) => {
    await api.createProformaInvoice(data);
    await loadAllData();
  };
  const handleSaveCustomerPO = async (data) => {
    await api.createCustomerPO(data);
    await loadAllData();
  };
  const handleVerifyCustomerPO = async (id, data) => {
    await api.verifyCustomerPO(id, data);
    await loadAllData();
  };
  const handleSavePayment = async (data) => {
    await api.createPayment(data);
    await loadAllData();
  };
  const handleVerifyPayment = async (id, data) => {
    await api.verifyPayment(id, data);
    await loadAllData();
  };
  const handleSaveSalesOrder = async (data) => {
    await api.createSalesOrder(data);
    await loadAllData();
  };
  const handleSendSOToProduction = async (id, data) => {
    await api.sendSOToProduction(id, data);
    await loadAllData();
  };

  return (
    <div className="app-container">
      {/* Dynamic Unified Sidebar */}
      <Sidebar
        activeDomain={activeDomain}
        onSelectDomain={handleDomainChange}
        activeModule={activeModule}
        onSelectModule={(mod, domain) => {
          setActiveModule(mod);
          if (domain) {
            setActiveDomain(domain);
          } else if (mod.startsWith('scm-')) {
            setActiveDomain('scm');
          } else if (mod.startsWith('sales-')) {
            setActiveDomain('sales');
          }
          setPreSelectedGRNForQC(null);
        }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Header
          activeDomain={activeDomain}
          onSelectDomain={handleDomainChange}
          activeModule={activeModule}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
        />

        <main className="content-body">
          {/* ========================================= */}
          {/* SUPPLY CHAIN MANAGEMENT MODULES (10 MENUS) */}
          {/* ========================================= */}
          {activeModule === 'scm-materials' && (
            <MaterialMasterModule
              materials={materials}
              onSave={handleSaveMaterial}
              onUpdate={handleUpdateMaterial}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-suppliers' && (
            <SuppliersModule
              suppliers={scmSuppliers}
              onSave={handleSaveScmSupplier}
              onUpdate={handleUpdateScmSupplier}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-supplier-links' && (
            <SupplierMaterialLinkModule
              links={supplierLinks}
              suppliers={scmSuppliers}
              materials={materials}
              onSave={handleSaveSupplierLink}
              onUpdate={handleUpdateSupplierLink}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-purchase-orders' && (
            <PurchaseOrdersModule
              purchaseOrders={scmPurchaseOrders}
              suppliers={scmSuppliers}
              materials={materials}
              supplierLinks={supplierLinks}
              onSave={handleSaveScmPO}
              onUpdateStatus={handleUpdateScmPOStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-grn' && (
            <GRNModule
              grns={grns}
              purchaseOrders={scmPurchaseOrders}
              onSave={handleSaveGRN}
              showToast={showToast}
              onNavigateToQC={handleNavigateToQC}
            />
          )}

          {activeModule === 'scm-qc-tests' && (
            <QCTestsModule
              qcTests={qcTests}
              grns={grns}
              onSave={handleSaveQCTest}
              showToast={showToast}
              preSelectedGRN={preSelectedGRNForQC}
            />
          )}

          {activeModule === 'scm-inventory' && (
            <InventoryModule
              inventory={inventory}
              onAdjustStock={handleAdjustStock}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-material-issues' && (
            <MaterialIssueModule
              materialIssues={materialIssues}
              materials={materials}
              inventory={inventory}
              onSave={handleSaveMaterialIssue}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-supplier-returns' && (
            <SupplierReturnsModule
              supplierReturns={supplierReturns}
              qcTests={qcTests}
              onSave={handleSaveSupplierReturn}
              showToast={showToast}
            />
          )}

          {activeModule === 'scm-reports' && (
            <InventoryReportModule
              reportsData={scmReportsData}
              showToast={showToast}
            />
          )}

          {/* ========================================= */}
          {/* SALES MANAGEMENT MODULES (10 MENUS)        */}
          {/* ========================================= */}
          {activeModule === 'sales-dashboard' && (
            <DashboardModule
              dashboardData={salesDashboardData}
              onNavigateModule={(mod) => setActiveModule(`sales-${mod}`)}
            />
          )}

          {activeModule === 'sales-enquiries' && (
            <EnquiriesModule
              enquiries={enquiries}
              products={products}
              customers={salesCustomers}
              onSave={handleSaveEnquiry}
              onConvertToLead={handleConvertToLead}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-customers-leads' && (
            <CustomersLeadsModule
              customers={salesCustomers}
              leads={leads}
              products={products}
              onSaveCustomer={handleSaveSalesCustomer}
              onSaveLead={handleSaveLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-follow-ups' && (
            <FollowUpsModule
              followUps={followUps}
              customers={salesCustomers}
              leads={leads}
              quotations={quotations}
              onSave={handleSaveFollowUp}
              onUpdateStatus={handleUpdateFollowUpStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-quotations' && (
            <QuotationsModule
              quotations={quotations}
              customers={salesCustomers}
              leads={leads}
              products={products}
              onSave={handleSaveQuotation}
              onRevise={handleReviseQuotation}
              onUpdateStatus={handleUpdateQuotationStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-proforma-invoices' && (
            <ProformaInvoicesModule
              proformaInvoices={proformaInvoices}
              quotations={quotations}
              onSave={handleSavePI}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-customer-pos' && (
            <CustomerPOsModule
              customerPOs={customerPOs}
              customers={salesCustomers}
              proformaInvoices={proformaInvoices}
              quotations={quotations}
              onSave={handleSaveCustomerPO}
              onVerify={handleVerifyCustomerPO}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-payments' && (
            <PaymentsModule
              payments={payments}
              customers={salesCustomers}
              proformaInvoices={proformaInvoices}
              onSave={handleSavePayment}
              onVerify={handleVerifyPayment}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-sales-orders' && (
            <SalesOrdersModule
              salesOrders={salesOrders}
              customers={salesCustomers}
              customerPOs={customerPOs}
              quotations={quotations}
              proformaInvoices={proformaInvoices}
              products={products}
              onSave={handleSaveSalesOrder}
              onSendToProduction={handleSendSOToProduction}
              showToast={showToast}
            />
          )}

          {activeModule === 'sales-reports' && (
            <SalesReportsModule
              reportsData={salesReportsData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
            {t.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
            {t.type === 'info' && <Info size={18} color="#6366F1" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
