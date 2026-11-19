import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

// 1. Supply Chain Management (8 Pages)
import ScmDashboardModule from './components/modules/ScmDashboardModule';
import InventoryModule from './components/modules/InventoryModule';
import MaterialsPage from './components/modules/MaterialsPage';
import SuppliersPage from './components/modules/SuppliersPage';
import PurchasingPage from './components/modules/PurchasingPage';
import QualityInventoryPage from './components/modules/QualityInventoryPage';
import MaterialRequestsPage from './components/modules/MaterialRequestsPage';
import ScmReportsPage from './components/modules/ScmReportsPage';

// 2. Sales Management (Step-by-Step Funnel Pipeline)
import DashboardModule from './components/sales/DashboardModule';
import ProductsModule from './components/sales/ProductsModule';
import EnquiriesModule from './components/sales/EnquiriesModule';
import FollowUpsModule from './components/sales/FollowUpsModule';
import CustomersLeadsModule from './components/sales/CustomersLeadsModule';
import QuotationsModule from './components/sales/QuotationsModule';
import ProformaInvoicesModule from './components/sales/ProformaInvoicesModule';
import SalesOrdersModule from './components/sales/SalesOrdersModule';
import SalesReportsModule from './components/sales/SalesReportsModule';
import SalesPipelineStepper from './components/sales/SalesPipelineStepper';
import CustomersEnquiriesPage from './components/sales/CustomersEnquiriesPage';
import QuotationsPIPage from './components/sales/QuotationsPIPage';
import OrdersPaymentsPage from './components/sales/OrdersPaymentsPage';

// 3. Production Management (7 Pages)
import ProductionDashboardModule from './components/production/ProductionDashboardModule';
import ProductionOrdersPage from './components/production/ProductionOrdersPage';
import BOMModule from './components/production/BOMModule';
import ProdMaterialRequestsPage from './components/production/ProdMaterialRequestsPage';
import ProductionTrackingPage from './components/production/ProductionTrackingPage';
import QualityReworkPage from './components/production/QualityReworkPage';
import FinishedGoodsModule from './components/production/FinishedGoodsModule';
import ProductionReportsModule from './components/production/ProductionReportsModule';

// 4. Logistics & Delivery Management (6 Pages)
import LogisticsDashboardModule from './components/logistics/LogisticsDashboardModule';
import DeliveryPlanningPage from './components/logistics/DeliveryPlanningPage';
import DispatchTrackingPage from './components/logistics/DispatchTrackingPage';
import DeliveryConfirmationModule from './components/logistics/DeliveryConfirmationModule';
import InstallationServicePage from './components/logistics/InstallationServicePage';
import DeliveryInstallationPage from './components/logistics/DeliveryInstallationPage';
import LogisticsReportsModule from './components/logistics/LogisticsReportsModule';

// 5. Employee Management & RBAC (5 Pages)
import EmployeeDashboardModule from './components/employee/EmployeeDashboardModule';
import EmployeesPage from './components/employee/EmployeesPage';
import DepartmentsModule from './components/employee/DepartmentsModule';
import RolesPermissionsModule from './components/employee/RolesPermissionsModule';
import AuditLogsPage from './components/employee/AuditLogsPage';
import DepartmentsReportsPage from './components/employee/DepartmentsReportsPage';

import { api } from './services/api';
import { CheckCircle2, AlertCircle, Info, Package, Briefcase, Factory, Truck, Users } from 'lucide-react';

export default function App() {
  const [activeDomain, setActiveDomain] = useState('scm'); // 'scm' | 'sales' | 'production' | 'logistics' | 'employee'
  const [activeModule, setActiveModule] = useState('scm-dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cross-module state
  const [preSelectedGRNForQC, setPreSelectedGRNForQC] = useState(null);
  const [preSelectedLeadForQuotation, setPreSelectedLeadForQuotation] = useState(null);
  const [preSelectedQuoteForPI, setPreSelectedQuoteForPI] = useState(null);
  const [preSelectedPIForView, setPreSelectedPIForView] = useState(null);
  const [preSelectedPIForSO, setPreSelectedPIForSO] = useState(null);
  const [preSelectedWOForMR, setPreSelectedWOForMR] = useState(null);
  const [preSelectedQAForFG, setPreSelectedQAForFG] = useState(null);
  const [preSelectedCompletionForQA, setPreSelectedCompletionForQA] = useState(null);
  const [preSelectedPOData, setPreSelectedPOData] = useState(null);
  const [preSelectedSOForWO, setPreSelectedSOForWO] = useState(null);

  // 1. SCM State
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

  // 2. Sales State
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

  // 3. Production State
  const [productionDashboardData, setProductionDashboardData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [productionMaterialIssues, setProductionMaterialIssues] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [productionUpdates, setProductionUpdates] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [productionQATests, setProductionQATests] = useState([]);
  const [reworkOrders, setReworkOrders] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);

  // 4. Logistics State
  const [logisticsDashboardData, setLogisticsDashboardData] = useState(null);
  const [deliveryPlans, setDeliveryPlans] = useState([]);
  const [vehiclesCouriers, setVehiclesCouriers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [installationCompletions, setInstallationCompletions] = useState([]);
  const [logisticsReportsData, setLogisticsReportsData] = useState(null);

  // 5. Employee Management & RBAC State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cryo_current_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  });
  const [employeeDashboardData, setEmployeeDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeReportsData, setEmployeeReportsData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dbHealth, setDbHealth] = useState({ connected: true, status: 'Connected', host: '127.0.0.1', port: 27017, name: 'cryo_scm' });

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
        salesRepRes,

        // Production Calls
        prodDashRes,
        woRes,
        bomRes,
        schRes,
        mrRes,
        pmiRes,
        execRes,
        puRes,
        compRes,
        pqaRes,
        rwRes,
        fgRes,

        // Logistics Calls
        logDashRes,
        delPlanRes,
        vehRes,
        dispRes,
        trkRes,
        confRes,
        instRes,
        icompRes,
        logRepRes,

        // Employee Calls
        empDashRes,
        empRes,
        rolesRes,
        deptRes,
        empRepRes,
        auditLogsRes,

        // System Health Call
        healthRes
      ] = await Promise.all([
        // SCM
        api.getMaterials().catch(() => ({ data: [] })),
        api.getSuppliers().catch(() => ({ data: [] })),
        api.getSupplierMaterialLinks().catch(() => ({ data: [] })),
        api.getPurchaseOrders().catch(() => ({ data: [] })),
        api.getGRNs().catch(() => ({ data: [] })),
        api.getQCTests().catch(() => ({ data: [] })),
        api.getInventory().catch(() => ({ data: [] })),
        api.getMaterialIssues().catch(() => ({ data: [] })),
        api.getSupplierReturns().catch(() => ({ data: [] })),
        api.getInventoryReport().catch(() => null),

        // Sales
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
        api.getSalesReports().catch(() => null),

        // Production
        api.getProductionDashboard().catch(() => null),
        api.getWorkOrders().catch(() => ({ data: [] })),
        api.getBOMs().catch(() => ({ data: [] })),
        api.getSchedules().catch(() => ({ data: [] })),
        api.getMaterialRequests().catch(() => ({ data: [] })),
        api.getProductionMaterialIssues().catch(() => ({ data: [] })),
        api.getExecutions().catch(() => ({ data: [] })),
        api.getProductionUpdates().catch(() => ({ data: [] })),
        api.getCompletions().catch(() => ({ data: [] })),
        api.getProductionQATests().catch(() => ({ data: [] })),
        api.getReworkOrders().catch(() => ({ data: [] })),
        api.getFinishedGoods().catch(() => ({ data: [] })),

        // Logistics
        api.getLogisticsDashboard().catch(() => null),
        api.getDeliveryPlans().catch(() => ({ data: [] })),
        api.getVehiclesCouriers().catch(() => ({ data: [] })),
        api.getDispatches().catch(() => ({ data: [] })),
        api.getDeliveryTracking().catch(() => ({ data: [] })),
        api.getDeliveryConfirmations().catch(() => ({ data: [] })),
        api.getInstallations().catch(() => ({ data: [] })),
        api.getInstallationCompletions().catch(() => ({ data: [] })),
        api.getLogisticsReports().catch(() => null),

        // Employee Management & RBAC
        api.getEmployeeDashboard().catch(() => null),
        api.getEmployees().catch(() => ({ data: [] })),
        api.getRoles().catch(() => ({ data: [] })),
        api.getDepartments().catch(() => ({ data: [] })),
        api.getEmployeeReports().catch(() => null),
        api.getAuditLogs().catch(() => ({ data: [] })),

        // Health & DB Connection
        api.getHealth().catch(() => null)
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

      // Populate Production
      setProductionDashboardData(prodDashRes || null);
      setWorkOrders(woRes.data || []);
      setBoms(bomRes.data || []);
      setSchedules(schRes.data || []);
      setMaterialRequests(mrRes.data || []);
      setProductionMaterialIssues(pmiRes.data || []);
      setExecutions(execRes.data || []);
      setProductionUpdates(puRes.data || []);
      setCompletions(compRes.data || []);
      setProductionQATests(pqaRes.data || []);
      setReworkOrders(rwRes.data || []);
      setFinishedGoods(fgRes.data || []);

      // Populate Logistics
      setLogisticsDashboardData(logDashRes || null);
      setDeliveryPlans(delPlanRes.data || []);
      setVehiclesCouriers(vehRes.data || []);
      setDispatches(dispRes.data || []);
      setTrackingRecords(trkRes.data || []);
      setConfirmations(confRes.data || []);
      setInstallations(instRes.data || []);
      setInstallationCompletions(icompRes.data || []);
      setLogisticsReportsData(logRepRes || null);

      // Populate Employee & RBAC
      setEmployeeDashboardData(empDashRes || null);
      setEmployees(empRes.data || []);
      setRoles(rolesRes.data || []);
      setDepartments(deptRes.data || []);
      setEmployeeReportsData(empRepRes || null);
      setAuditLogs(auditLogsRes.data || []);

      // Populate Database & System Health
      if (healthRes?.database) {
        setDbHealth(healthRes.database);
      } else {
        setDbHealth({ connected: false, status: 'Disconnected' });
      }
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
      setActiveModule('scm-dashboard');
    } else if (domain === 'sales') {
      setActiveModule('sales-dashboard');
    } else if (domain === 'production') {
      setActiveModule('production-dashboard');
    } else if (domain === 'logistics') {
      setActiveModule('logistics-dashboard');
    } else if (domain === 'employee') {
      setActiveModule('employee-dashboard');
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
    setActiveModule('scm-quality-inventory');
  };
  const handleNavigateToPOWithData = (poData) => {
    setPreSelectedPOData(poData);
    setActiveDomain('scm');
    setActiveModule('scm-purchasing');
  };

  // Sales Handlers
  const handleSaveProduct = async (data) => {
    await api.createProduct(data);
    await loadAllData();
  };
  const handleUpdateProduct = async (id, data) => {
    await api.updateProduct(id, data);
    await loadAllData();
  };
  const handleSaveEnquiry = async (data) => {
    await api.createEnquiry(data);
    await loadAllData();
  };
  const handleConvertToLead = async (enquiryId) => {
    await api.convertEnquiryToLead(enquiryId);
    await loadAllData();
    showToast('Enquiry marked as Qualified Lead opportunity!', 'success');
  };
  const handleUpdateEnquiryStatus = async (id, data) => {
    await api.updateEnquiryStatus(id, data);
    await loadAllData();
  };
  const handleSaveSalesCustomer = async (data) => {
    await api.createCustomer(data);
    await loadAllData();
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
    showToast('Quotation revised successfully with incremented version', 'success');
  };
  const handleUpdateQuotationStatus = async (id, statusOrData) => {
    await api.updateQuotationStatus(id, statusOrData);
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
    showToast('Sales Order approved and handed over to Production Planning!', 'success');
    setActiveDomain('production');
    setActiveModule('production-orders');
  };

  const handleSelectSOForWO = (so) => {
    setPreSelectedSOForWO(so);
    setActiveDomain('production');
    setActiveModule('production-orders');
  };

  // Production Handlers
  const handleSaveWorkOrder = async (data) => {
    await api.createWorkOrder(data);
    await loadAllData();
  };
  const handleUpdateWorkOrderStatus = async (id, status) => {
    await api.updateWorkOrderStatus(id, status);
    await loadAllData();
  };
  const handleSaveBOM = async (data) => {
    await api.createBOM(data);
    await loadAllData();
  };
  const handleSaveSchedule = async (data) => {
    await api.createSchedule(data);
    await loadAllData();
  };
  const handleSaveMaterialRequest = async (data) => {
    await api.createMaterialRequest(data);
    await loadAllData();
  };
  const handleSaveProductionMaterialIssue = async (data) => {
    await api.createProductionMaterialIssue(data);
    await loadAllData();
  };
  const handleStartExecution = async (data) => {
    await api.startExecution(data);
    await loadAllData();
  };
  const handleUpdateExecutionStatus = async (id, status) => {
    await api.updateExecutionStatus(id, status);
    await loadAllData();
  };
  const handleSaveProductionUpdate = async (data) => {
    await api.createProductionUpdate(data);
    await loadAllData();
  };
  const handleSaveCompletion = async (data) => {
    await api.createCompletion(data);
    await loadAllData();
  };
  const handleSaveProductionQA = async (data) => {
    await api.createProductionQATest(data);
    await loadAllData();
  };
  const handleSaveReworkOrder = async (data) => {
    await api.createReworkOrder(data);
    await loadAllData();
  };
  const handleUpdateReworkStatus = async (id, data) => {
    await api.updateReworkStatus(id, data);
    await loadAllData();
  };
  const handleSaveFinishedGood = async (data) => {
    await api.createFinishedGood(data);
    await loadAllData();
  };
  const handleUpdateFinishedGoodStatus = async (id, status) => {
    await api.updateFinishedGoodStatus(id, status);
    await loadAllData();
  };

  // Logistics Handlers
  const handleSaveDeliveryPlan = async (data) => {
    await api.createDeliveryPlan(data);
    await loadAllData();
  };
  const handleSaveVehicleCourier = async (data) => {
    await api.createVehicleCourier(data);
    await loadAllData();
  };
  const handleUpdateVehicleCourier = async (id, data) => {
    await api.updateVehicleCourier(id, data);
    await loadAllData();
  };
  const handleSaveDispatch = async (data) => {
    await api.createDispatch(data);
    await loadAllData();
  };
  const handleSaveTrackingMilestone = async (data) => {
    await api.createTrackingMilestone(data);
    await loadAllData();
  };
  const handleSaveDeliveryConfirmation = async (data) => {
    await api.createDeliveryConfirmation(data);
    await loadAllData();
  };
  const handleSaveInstallation = async (data) => {
    await api.createInstallation(data);
    await loadAllData();
  };
  const handleUpdateInstallationStatus = async (id, status, remarks) => {
    await api.updateInstallationStatus(id, status, remarks);
    await loadAllData();
  };
  const handleSaveInstallationCompletion = async (data) => {
    await api.createInstallationCompletion(data);
    await loadAllData();
  };

  // Employee & RBAC Handlers
  const handleLogin = async (arg1, arg2) => {
    const credentials = (typeof arg1 === 'object' && arg1 !== null)
      ? arg1
      : { username: arg1, password: arg2 };
    const res = await api.loginEmployee(credentials);
    const userObj = res.user || res.data;
    if (userObj && res.token) {
      setCurrentUser(userObj);
      localStorage.setItem('cryo_auth_token', res.token);
      localStorage.setItem('cryo_current_user', JSON.stringify(userObj));
      const roleName = userObj.role?.name || userObj.role?.roleName || (typeof userObj.role === 'string' ? userObj.role : 'Employee');
      showToast(`Logged in successfully: ${userObj.name} (${roleName})`, 'success');
      await loadAllData();
    }
    return res;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cryo_auth_token');
    localStorage.removeItem('cryo_current_user');
    showToast('Signed out of ERP session', 'info');
  };

  const handleSaveEmployee = async (data) => {
    await api.createEmployee(data);
    await loadAllData();
  };

  const handleUpdateEmployee = async (id, data) => {
    await api.updateEmployee(id, data);
    await loadAllData();
  };

  const handleResetPassword = async (id, newPassword) => {
    await api.resetEmployeePassword(id, newPassword);
    await loadAllData();
  };

  const handleToggleEmployeeStatus = async (id) => {
    await api.toggleEmployeeStatus(id);
    await loadAllData();
  };

  const handleSaveRole = async (data) => {
    await api.createRole(data);
    await loadAllData();
  };

  const handleUpdateRolePermissions = async (id, data) => {
    await api.updateRolePermissions(id, data);
    await loadAllData();
  };

  const handleSaveDepartment = async (data) => {
    await api.createDepartment(data);
    await loadAllData();
  };

  return (
    <div className="app-container">
      {/* Unified Tree Accordion Sidebar */}
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
          } else if (mod.startsWith('production-')) {
            setActiveDomain('production');
          } else if (mod.startsWith('logistics-')) {
            setActiveDomain('logistics');
          } else if (mod.startsWith('employee-')) {
            setActiveDomain('employee');
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
          currentUser={currentUser}
          dbHealth={dbHealth}
        />

        <main className="content-body">
          {/* ======================================================== */}
          {/* 1. SUPPLY CHAIN MANAGEMENT (7 PAGES)                     */}
          {/* ======================================================== */}
          {activeModule === 'scm-dashboard' && (
            <ScmDashboardModule
              materials={materials}
              suppliers={scmSuppliers}
              purchaseOrders={scmPurchaseOrders}
              grns={grns}
              qcTests={qcTests}
              inventory={inventory}
              materialIssues={materialIssues}
              materialRequests={materialRequests}
              supplierLinks={supplierLinks}
              onNavigateTab={(tab, sub) => {
                if (tab === 'purchasing') {
                  setActiveModule('scm-purchasing');
                } else if (tab === 'quality-inventory') {
                  setActiveModule('scm-quality-inventory');
                } else if (tab === 'material-issues') {
                  setActiveModule('scm-material-issues');
                } else if (tab === 'inventory' || tab === 'stock') {
                  setActiveModule('scm-inventory');
                } else {
                  setActiveModule(`scm-${tab}`);
                }
              }}
              onNavigateToPOWithData={handleNavigateToPOWithData}
            />
          )}

          {(activeModule === 'scm-inventory' || activeModule === 'scm-stock') && (
            <div className="module-container">
              <InventoryModule
                inventory={inventory}
                onAdjustStock={handleAdjustStock}
                showToast={showToast}
              />
            </div>
          )}

          {(activeModule === 'scm-materials' || activeModule === 'scm-material-master') && (
            <MaterialsPage
              materials={materials}
              suppliers={scmSuppliers}
              supplierLinks={supplierLinks}
              onSaveMaterial={handleSaveMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onNavigateToPO={handleNavigateToPOWithData}
              onNavigateToSupplierLinks={() => {
                setActiveDomain('scm');
                setActiveModule('scm-suppliers');
              }}
              showToast={showToast}
            />
          )}

          {(activeModule === 'scm-suppliers' || activeModule === 'scm-supplier-links') && (
            <SuppliersPage
              suppliers={scmSuppliers}
              materials={materials}
              supplierLinks={supplierLinks}
              purchaseOrders={scmPurchaseOrders}
              onSaveSupplier={handleSaveScmSupplier}
              onUpdateSupplier={handleUpdateScmSupplier}
              onSaveSupplierLink={handleSaveSupplierLink}
              onUpdateSupplierLink={handleUpdateSupplierLink}
              onNavigateToPO={handleNavigateToPOWithData}
              showToast={showToast}
              defaultTab={activeModule === 'scm-supplier-links' ? 'links' : 'suppliers'}
            />
          )}

          {(activeModule === 'scm-purchasing' || activeModule === 'scm-purchase-orders' || activeModule === 'scm-grn') && (
            <PurchasingPage
              purchaseOrders={scmPurchaseOrders}
              suppliers={scmSuppliers}
              materials={materials}
              supplierLinks={supplierLinks}
              grns={grns}
              onSavePO={handleSaveScmPO}
              onUpdatePOStatus={handleUpdateScmPOStatus}
              onSaveGRN={handleSaveGRN}
              onNavigateToQC={handleNavigateToQC}
              preSelectedPOData={preSelectedPOData}
              onClearPreSelected={() => setPreSelectedPOData(null)}
              showToast={showToast}
              defaultTab={activeModule === 'scm-grn' ? 'grn' : 'po'}
            />
          )}

          {(activeModule === 'scm-quality-inventory' || activeModule === 'scm-qc-tests' || activeModule === 'scm-supplier-returns') && (
            <QualityInventoryPage
              qcTests={qcTests}
              grns={grns}
              supplierReturns={supplierReturns}
              onSaveQCTest={handleSaveQCTest}
              onSaveSupplierReturn={handleSaveSupplierReturn}
              preSelectedGRN={preSelectedGRNForQC}
              showToast={showToast}
              defaultTab={activeModule === 'scm-supplier-returns' ? 'returns' : 'qc-history'}
            />
          )}

          {(activeModule === 'scm-material-issues' || activeModule === 'scm-material-requests') && (
            <MaterialRequestsPage
              materialIssues={materialIssues}
              materials={materials}
              inventory={inventory}
              materialRequests={materialRequests}
              workOrders={workOrders}
              suppliers={scmSuppliers}
              purchaseOrders={scmPurchaseOrders}
              grns={scmGrns}
              onSaveMaterialIssue={handleSaveMaterialIssue}
              onSavePurchaseOrder={handleSavePurchaseOrder}
              onSaveGRN={handleSaveGRN}
              showToast={showToast}
              defaultTab={activeModule === 'scm-material-issues' ? 'issue' : 'requests'}
            />
          )}

          {(activeModule === 'scm-reports' || activeModule === 'scm-inventory-reports') && (
            <ScmReportsPage
              reportsData={scmReportsData}
              materials={materials}
              suppliers={scmSuppliers}
              purchaseOrders={scmPurchaseOrders}
              inventory={inventory}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* 2. SALES MANAGEMENT (STEP-BY-STEP FUNNEL WORKFLOW)       */}
          {/* ======================================================== */}
          {activeDomain === 'sales' && (
            <SalesPipelineStepper
              currentModule={activeModule}
              onNavigate={(mod) => {
                setActiveModule(mod);
              }}
            />
          )}

          {activeModule === 'sales-dashboard' && (
            <DashboardModule
              dashboardData={salesDashboardData}
              onNavigateModule={(mod) => {
                if (mod === 'products' || mod === 'product') {
                  setActiveModule('sales-products');
                } else if (mod === 'enquiries' || mod === 'enquiry') {
                  setActiveModule('sales-enquiries');
                } else if (mod === 'leads' || mod === 'customers-leads' || mod === 'customers') {
                  setActiveModule('sales-enquiries');
                } else if (mod === 'follow-ups' || mod === 'followup') {
                  setActiveModule('sales-enquiries');
                } else if (mod === 'quotations' || mod === 'quotation') {
                  setActiveModule('sales-quotations');
                } else if (mod === 'proforma-invoices' || mod === 'pi') {
                  setActiveModule('sales-proforma-invoices');
                } else if (mod === 'sales-orders' || mod === 'so' || mod === 'customer-pos' || mod === 'payments') {
                  setActiveModule('sales-orders');
                } else {
                  setActiveModule(`sales-${mod}`);
                }
              }}
            />
          )}

          {/* 1. PRODUCTS MASTER */}
          {activeModule === 'sales-products' && (
            <ProductsModule
              products={products}
              onSave={handleSaveProduct}
              onUpdate={handleUpdateProduct}
              showToast={showToast}
            />
          )}

          {/* STAGE 1: ENQUIRY */}
          {(activeModule === 'sales-enquiries' || activeModule === 'sales-enquiry' || activeModule === 'sales-customers-enquiries' || activeModule === 'sales-follow-ups' || activeModule === 'sales-leads') && (
            <EnquiriesModule
              enquiries={enquiries}
              products={products}
              customers={salesCustomers}
              followUps={followUps}
              onSave={handleSaveEnquiry}
              onConvertToLead={async (enqId) => {
                await handleConvertToLead(enqId);
              }}
              onUpdateStatus={handleUpdateEnquiryStatus}
              onSaveFollowUp={handleSaveFollowUp}
              onNavigateToQuotation={(enq) => {
                const qty = Number(enq.quantity) || 1;
                const unitPrice = Number(enq.targetPrice) || 0;
                setPreSelectedLeadForQuotation({
                  customer: enq.customer?._id || enq.customer,
                  companyName: enq.companyName || enq.customer?.companyName || '',
                  productName: enq.productName,
                  description: enq.productDescription || enq.additionalRequirements || enq.productName,
                  quantity: qty,
                  expectedQuantity: qty,
                  unitPrice: unitPrice > 0 ? unitPrice : 100000,
                  expectedOrderValue: unitPrice > 0 ? (unitPrice * qty) : (100000 * qty),
                  unit: enq.unit || 'Nos',
                  enquiryReference: enq._id,
                  enquiryNumber: enq.enquiryNumber
                });
                setActiveModule('sales-quotations');
              }}
              showToast={showToast}
            />
          )}

          {/* STAGE 2: FOLLOW-UP */}
          {(activeModule === 'sales-follow-ups' || activeModule === 'sales-followup') && (
            <FollowUpsModule
              followUps={followUps}
              customers={salesCustomers}
              leads={leads}
              quotations={quotations}
              enquiries={enquiries}
              onSave={handleSaveFollowUp}
              onUpdateStatus={handleUpdateFollowUpStatus}
              showToast={showToast}
            />
          )}

          {/* STAGE 3: QUALIFIED / NOT QUALIFIED LEAD */}
          {(activeModule === 'sales-leads' || activeModule === 'sales-customers-leads') && (
            <CustomersLeadsModule
              customers={salesCustomers}
              leads={leads}
              products={products}
              onSaveCustomer={handleSaveSalesCustomer}
              onSaveLead={handleSaveLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSaveFollowUp={handleSaveFollowUp}
              onNavigateToQuotation={(lead) => {
                setPreSelectedLeadForQuotation(lead);
                setActiveModule('sales-quotations');
              }}
              showToast={showToast}
              defaultTab="qualified"
            />
          )}

          {/* STAGE 4: QUOTATION */}
          {(activeModule === 'sales-quotations' || activeModule === 'sales-quotation' || activeModule === 'sales-quotations-pi') && (
            <QuotationsModule
              quotations={quotations}
              customers={salesCustomers}
              leads={leads}
              products={products}
              followUps={followUps}
              proformaInvoices={proformaInvoices}
              onSave={handleSaveQuotation}
              onRevise={handleReviseQuotation}
              onUpdateStatus={handleUpdateQuotationStatus}
              onSaveFollowUp={handleSaveFollowUp}
              preSelectedLead={preSelectedLeadForQuotation}
              onClearPreSelectedLead={() => setPreSelectedLeadForQuotation(null)}
              onNavigateToPI={(quote) => {
                setPreSelectedQuoteForPI(quote);
                setActiveModule('sales-proforma-invoices');
              }}
              onViewPI={(pi) => {
                setPreSelectedPIForView(pi);
                setActiveModule('sales-proforma-invoices');
              }}
              showToast={showToast}
            />
          )}

          {/* STAGE 5: PROFORMA INVOICE (PI) */}
          {(activeModule === 'sales-proforma-invoices' || activeModule === 'sales-pi') && (
            <ProformaInvoicesModule
              proformaInvoices={proformaInvoices}
              quotations={quotations}
              payments={payments}
              onSave={handleSavePI}
              onSavePayment={handleSavePayment}
              preSelectedQuote={preSelectedQuoteForPI}
              selectedPIForView={preSelectedPIForView}
              onClearViewPI={() => setPreSelectedPIForView(null)}
              onClearPreSelectedQuote={() => setPreSelectedQuoteForPI(null)}
              onNavigateToSO={(pi) => {
                setPreSelectedPIForSO(pi);
                setActiveModule('sales-orders');
              }}
              showToast={showToast}
            />
          )}

          {/* STAGE 6: SALES ORDER (SO) */}
          {(activeModule === 'sales-orders' || activeModule === 'sales-so' || activeModule === 'sales-orders-payments' || activeModule === 'sales-customer-pos' || activeModule === 'sales-payments' || activeModule === 'sales-sales-orders') && (
            <OrdersPaymentsPage
              salesOrders={salesOrders}
              customerPOs={customerPOs}
              payments={payments}
              customers={salesCustomers}
              quotations={quotations}
              proformaInvoices={proformaInvoices}
              products={products}
              finishedGoods={finishedGoods}
              preSelectedPI={preSelectedPIForSO}
              onSaveCustomerPO={handleSaveCustomerPO}
              onVerifyCustomerPO={handleVerifyCustomerPO}
              onSaveSalesOrder={handleSaveSalesOrder}
              onSendToProduction={handleSendSOToProduction}
              onSavePayment={handleSavePayment}
              onVerifyPayment={handleVerifyPayment}
              showToast={showToast}
              defaultTab={activeModule === 'sales-customer-pos' ? 'cpo' : activeModule === 'sales-payments' ? 'payments' : 'so'}
            />
          )}

          {activeModule === 'sales-reports' && (
            <SalesReportsModule
              reportsData={salesReportsData}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* 3. PRODUCTION MANAGEMENT (7 PAGES)                       */}
          {/* ======================================================== */}
          {activeModule === 'production-dashboard' && (
            <ProductionDashboardModule
              dashboardData={productionDashboardData}
              salesOrders={salesOrders}
              workOrders={workOrders}
              materialRequests={materialRequests}
              productionMaterialIssues={productionMaterialIssues}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'work-orders' || mod === 'production-orders') {
                  setActiveModule('production-orders');
                } else if (mod === 'planning' || mod === 'bom' || mod === 'production-planning') {
                  setActiveModule('production-planning');
                } else if (mod === 'daily' || mod === 'manufacturing' || mod === 'execution' || mod === 'updates' || mod === 'completion' || mod === 'tracking' || mod === 'production-daily') {
                  setActiveModule('production-daily');
                } else if (mod === 'completed' || mod === 'finished-goods' || mod === 'production-completed') {
                  setActiveModule('production-completed');
                } else if (mod === 'materials' || mod === 'material-requests' || mod === 'material-issue' || mod === 'production-materials') {
                  setActiveDomain('scm');
                  setActiveModule('scm-material-issues');
                } else {
                  setActiveModule(mod.startsWith('production-') ? mod : `production-${mod}`);
                }
              }}
              onSelectSOForWO={handleSelectSOForWO}
            />
          )}

          {(activeModule === 'production-orders' || activeModule === 'production-planning' || activeModule === 'production-daily' || activeModule === 'production-completed' || activeModule === 'production-bom' || activeModule === 'production-schedule') && (
            <ProductionOrdersPage
              workOrders={workOrders}
              salesOrders={salesOrders}
              products={products}
              boms={boms}
              materials={materials}
              inventory={inventory}
              materialRequests={materialRequests}
              productionMaterialIssues={productionMaterialIssues}
              materialIssues={materialIssues}
              executions={executions}
              productionUpdates={productionUpdates}
              completions={completions}
              finishedGoods={finishedGoods}
              preSelectedSO={preSelectedSOForWO}
              onClearPreSelectedSO={() => setPreSelectedSOForWO(null)}
              onSaveWorkOrder={handleSaveWorkOrder}
              onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
              onSaveBOM={handleSaveBOM}
              onSaveMaterialRequest={handleSaveMaterialRequest}
              onSaveProductionUpdate={handleSaveProductionUpdate}
              onSaveCompletion={handleSaveCompletion}
              onSaveFinishedGood={handleSaveFinishedGood}
              onNavigateToMaterials={(wo) => {
                setPreSelectedWOForMR(wo);
                setActiveDomain('scm');
                setActiveModule('scm-material-issues');
              }}
              onNavigateToManufacturing={(wo) => {
                setActiveModule('production-daily');
              }}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'production-orders') setActiveModule('production-orders');
                else if (mod === 'planning' || mod === 'production-planning') setActiveModule('production-planning');
                else if (mod === 'daily' || mod === 'production-daily' || mod === 'manufacturing' || mod === 'production-manufacturing') setActiveModule('production-daily');
                else if (mod === 'completed' || mod === 'production-completed' || mod === 'finished-goods' || mod === 'production-finished-goods') setActiveModule('production-completed');
                else if (mod === 'materials' || mod === 'production-materials') {
                  setActiveDomain('scm');
                  setActiveModule('scm-material-issues');
                } else setActiveModule(mod);
              }}
              showToast={showToast}
              defaultTab={
                activeModule === 'production-planning' || activeModule === 'production-bom' ? 'planning' :
                activeModule === 'production-daily' ? 'daily' :
                activeModule === 'production-completed' ? 'completed' : 'orders'
              }
            />
          )}

          {(activeModule === 'production-materials' || activeModule === 'production-material-requests' || activeModule === 'production-material-issue') && (
            <ProdMaterialRequestsPage
              materialRequests={materialRequests}
              materialIssues={productionMaterialIssues}
              workOrders={workOrders}
              materials={materials}
              boms={boms}
              inventory={inventory}
              preSelectedWO={preSelectedWOForMR}
              onSaveMaterialRequest={handleSaveMaterialRequest}
              onSaveProductionMaterialIssue={handleSaveProductionMaterialIssue}
              onNavigateToPurchasing={(mrOrItem) => {
                if (mrOrItem && mrOrItem.items) {
                  const shortItem = mrOrItem.items.find(it => {
                    const matId = it.material?._id || it.material;
                    const inv = inventory.find(i => (i.material?._id || i.material) === matId);
                    return (inv ? (inv.availableStock || inv.currentStock || 0) : 0) < (it.requestedQty || it.requiredQty || 0);
                  }) || mrOrItem.items[0];

                  const matId = shortItem?.material?._id || shortItem?.material;
                  const link = (supplierLinks || []).find(l => (l.material?._id || l.material) === matId && l.preferredSupplier) ||
                               (supplierLinks || []).find(l => (l.material?._id || l.material) === matId);
                  const supplierId = link ? (link.supplier?._id || link.supplier) : (scmSuppliers[0]?._id || '');
                  const price = link?.unitPrice || 80;
                  const qty = Math.max(shortItem?.requestedQty || 100, link?.minOrderQty || 100);

                  handleNavigateToPOWithData({
                    supplierId,
                    materialId: matId,
                    quantity: qty,
                    unitPrice: price
                  });
                } else {
                  setActiveDomain('scm');
                  setActiveModule('scm-purchasing');
                }
              }}
              onNavigateToManufacturing={(wo) => {
                setActiveModule('production-manufacturing');
              }}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'production-orders') setActiveModule('production-orders');
                else if (mod === 'materials' || mod === 'production-materials') setActiveModule('production-materials');
                else if (mod === 'manufacturing' || mod === 'production-manufacturing') setActiveModule('production-manufacturing');
                else if (mod === 'quality' || mod === 'production-quality') setActiveModule('production-quality');
                else if (mod === 'finished-goods' || mod === 'production-finished-goods') setActiveModule('production-finished-goods');
                else setActiveModule(mod);
              }}
              showToast={showToast}
              defaultTab={activeModule === 'production-material-issue' ? 'issues' : 'requests'}
            />
          )}

          {(activeModule === 'production-manufacturing' || activeModule === 'production-tracking' || activeModule === 'production-execution' || activeModule === 'production-updates' || activeModule === 'production-completion') && (
            <ProductionTrackingPage
              executions={executions}
              productionUpdates={productionUpdates}
              completions={completions}
              workOrders={workOrders}
              onStartExecution={handleStartExecution}
              onUpdateExecutionStatus={handleUpdateExecutionStatus}
              onSaveProductionUpdate={handleSaveProductionUpdate}
              onSaveCompletion={handleSaveCompletion}
              onNavigateToQA={(comp) => {
                setPreSelectedCompletionForQA(comp);
                setActiveModule('production-quality');
              }}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'production-orders') setActiveModule('production-orders');
                else if (mod === 'materials' || mod === 'production-materials') setActiveModule('production-materials');
                else if (mod === 'manufacturing' || mod === 'production-manufacturing') setActiveModule('production-manufacturing');
                else if (mod === 'quality' || mod === 'production-quality') setActiveModule('production-quality');
                else if (mod === 'finished-goods' || mod === 'production-finished-goods') setActiveModule('production-finished-goods');
                else setActiveModule(mod);
              }}
              showToast={showToast}
              defaultTab={activeModule === 'production-updates' ? 'updates' : activeModule === 'production-completion' ? 'completion' : 'execution'}
            />
          )}

          {(activeModule === 'production-quality' || activeModule === 'production-quality-rework' || activeModule === 'production-qa' || activeModule === 'production-rework') && (
            <QualityReworkPage
              qaTests={productionQATests}
              reworkOrders={reworkOrders}
              workOrders={workOrders}
              completions={completions}
              preSelectedCompletion={preSelectedCompletionForQA}
              onClearPreSelectedCompletion={() => setPreSelectedCompletionForQA(null)}
              onSaveQA={handleSaveProductionQA}
              onSaveReworkOrder={handleSaveReworkOrder}
              onUpdateReworkStatus={handleUpdateReworkStatus}
              onNavigateToFG={(qa) => {
                setPreSelectedQAForFG(qa);
                setActiveModule('production-finished-goods');
              }}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'production-orders') setActiveModule('production-orders');
                else if (mod === 'materials' || mod === 'production-materials') setActiveModule('production-materials');
                else if (mod === 'manufacturing' || mod === 'production-manufacturing') setActiveModule('production-manufacturing');
                else if (mod === 'quality' || mod === 'production-quality') setActiveModule('production-quality');
                else if (mod === 'finished-goods' || mod === 'production-finished-goods') setActiveModule('production-finished-goods');
                else setActiveModule(mod);
              }}
              showToast={showToast}
              defaultTab={activeModule === 'production-rework' ? 'rework' : activeModule === 'production-qa' ? 'passed' : 'pending'}
            />
          )}

          {activeModule === 'production-finished-goods' && (
            <FinishedGoodsModule
              finishedGoods={finishedGoods}
              workOrders={workOrders}
              qaTests={productionQATests}
              preSelectedQA={preSelectedQAForFG}
              onClearPreSelectedQA={() => setPreSelectedQAForFG(null)}
              onSave={handleSaveFinishedGood}
              onUpdateStatus={handleUpdateFinishedGoodStatus}
              onHandoverToLogistics={(fg) => {
                showToast(`Finished Goods ${fg.fgNumber} ready for Logistics delivery schedule`, 'success');
                setActiveDomain('logistics');
                setActiveModule('logistics-planning');
              }}
              onNavigateModule={(mod) => {
                if (mod === 'orders' || mod === 'production-orders') setActiveModule('production-orders');
                else if (mod === 'materials' || mod === 'production-materials') setActiveModule('production-materials');
                else if (mod === 'manufacturing' || mod === 'production-manufacturing') setActiveModule('production-manufacturing');
                else if (mod === 'quality' || mod === 'production-quality') setActiveModule('production-quality');
                else if (mod === 'finished-goods' || mod === 'production-finished-goods') setActiveModule('production-finished-goods');
                else setActiveModule(mod);
              }}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-reports' && (
            <ProductionReportsModule
              workOrders={workOrders}
              productionUpdates={productionUpdates}
              completions={completions}
              qaTests={productionQATests}
              reworkOrders={reworkOrders}
              finishedGoods={finishedGoods}
              materialRequests={materialRequests}
              products={products}
            />
          )}

          {/* ======================================================== */}
          {/* 4. LOGISTICS & DELIVERY MANAGEMENT (6 PAGES)             */}
          {/* ======================================================== */}
          {activeModule === 'logistics-dashboard' && (
            <LogisticsDashboardModule
              dashboardData={logisticsDashboardData}
              deliveryPlans={deliveryPlans}
              dispatches={dispatches}
              confirmations={confirmations}
              installations={installations}
              installationCompletions={installationCompletions}
              finishedGoods={finishedGoods}
              onNavigateModule={(mod) => {
                if (mod === 'deliveries' || mod === 'planning' || mod === 'vehicles' || mod === 'dispatch') {
                  setActiveModule('logistics-deliveries');
                } else if (mod === 'tracking') {
                  setActiveModule('logistics-tracking');
                } else if (mod === 'confirmation' || mod === 'pod') {
                  setActiveModule('logistics-confirmation');
                } else if (mod === 'installation') {
                  setActiveModule('logistics-installation');
                } else if (mod === 'reports') {
                  setActiveModule('logistics-reports');
                } else {
                  setActiveModule(`logistics-${mod}`);
                }
              }}
            />
          )}

          {(activeModule === 'logistics-deliveries' || activeModule === 'logistics-planning' || activeModule === 'logistics-dispatch' || activeModule === 'logistics-vehicles-couriers') && (
            <DeliveryPlanningPage
              deliveryPlans={deliveryPlans}
              dispatches={dispatches}
              salesOrders={salesOrders}
              finishedGoods={finishedGoods}
              vehiclesCouriers={vehiclesCouriers}
              onSaveDeliveryPlan={handleSaveDeliveryPlan}
              onSaveDispatch={handleSaveDispatch}
              onSaveVehicleCourier={handleSaveVehicleCourier}
              onUpdateVehicleCourier={handleUpdateVehicleCourier}
              showToast={showToast}
              defaultTab={activeModule === 'logistics-dispatch' ? 'dispatch' : activeModule === 'logistics-vehicles-couriers' ? 'vehicles' : 'planning'}
            />
          )}

          {(activeModule === 'logistics-tracking' || activeModule === 'logistics-dispatch-tracking') && (
            <DispatchTrackingPage
              trackingRecords={trackingRecords}
              deliveryPlans={deliveryPlans}
              onSaveTrackingMilestone={handleSaveTrackingMilestone}
              showToast={showToast}
            />
          )}

          {(activeModule === 'logistics-confirmation' || activeModule === 'logistics-pod') && (
            <DeliveryConfirmationModule
              confirmations={confirmations}
              deliveryPlans={deliveryPlans}
              dispatches={dispatches}
              onSave={handleSaveDeliveryConfirmation}
              showToast={showToast}
            />
          )}

          {(activeModule === 'logistics-installation' || activeModule === 'logistics-delivery-installation' || activeModule === 'logistics-installation-completion') && (
            <InstallationServicePage
              installations={installations}
              installationCompletions={installationCompletions}
              deliveryPlans={deliveryPlans}
              onSaveInstallation={handleSaveInstallation}
              onUpdateInstallationStatus={handleUpdateInstallationStatus}
              onSaveInstallationCompletion={handleSaveInstallationCompletion}
              showToast={showToast}
              defaultTab={activeModule === 'logistics-installation-completion' ? 'completion-checklist' : 'scheduled'}
            />
          )}

          {activeModule === 'logistics-reports' && (
            <LogisticsReportsModule
              deliveryPlans={deliveryPlans}
              dispatches={dispatches}
              trackingRecords={trackingRecords}
              confirmations={confirmations}
              installations={installations}
              installationCompletions={installationCompletions}
              reportsData={logisticsReportsData}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* 5. EMPLOYEE MANAGEMENT & RBAC (5 PAGES)                  */}
          {/* ======================================================== */}
          {activeModule === 'employee-dashboard' && (
            <EmployeeDashboardModule
              dashboardData={employeeDashboardData}
              departments={departments}
              roles={roles}
              employees={employees}
              onNavigateModule={(mod) => {
                if (mod === 'employees' || mod === 'employee-directory') {
                  setActiveModule('employee-directory');
                } else if (mod === 'departments') {
                  setActiveModule('employee-departments');
                } else if (mod === 'roles' || mod === 'roles-permissions') {
                  setActiveModule('employee-roles-permissions');
                } else if (mod === 'audit-logs' || mod === 'reports') {
                  setActiveModule('employee-audit-logs');
                } else {
                  setActiveModule(`employee-${mod}`);
                }
              }}
            />
          )}

          {(activeModule === 'employee-directory' || activeModule === 'employee-login' || activeModule === 'employees') && (
            <EmployeesPage
              employees={employees}
              roles={roles}
              departments={departments}
              currentUser={currentUser}
              onSaveEmployee={handleSaveEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onResetPassword={handleResetPassword}
              onToggleStatus={handleToggleEmployeeStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'employee-departments' && (
            <DepartmentsModule
              departments={departments}
              onSaveDepartment={handleSaveDepartment}
              showToast={showToast}
            />
          )}

          {(activeModule === 'employee-roles-permissions' || activeModule === 'employee-roles') && (
            <RolesPermissionsModule
              roles={roles}
              departments={departments}
              onSaveRole={handleSaveRole}
              onUpdateRolePermissions={handleUpdateRolePermissions}
              showToast={showToast}
            />
          )}

          {(activeModule === 'employee-audit-logs' || activeModule === 'employee-departments-reports' || activeModule === 'employee-reports') && (
            <AuditLogsPage
              reportsData={employeeReportsData}
              employees={employees}
              departments={departments}
              roles={roles}
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {[
          { key: 'scm', label: 'SCM', icon: Package, defaultModule: 'scm-materials' },
          { key: 'sales', label: 'Sales', icon: Briefcase, defaultModule: 'sales-dashboard' },
          { key: 'production', label: 'Prod', icon: Factory, defaultModule: 'production-dashboard' },
          { key: 'logistics', label: 'Logistics', icon: Truck, defaultModule: 'logistics-dashboard' },
          { key: 'employee', label: 'HR & RBAC', icon: Users, defaultModule: 'employee-dashboard' }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeDomain === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                handleDomainChange(item.key);
                setActiveModule(item.defaultModule);
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
