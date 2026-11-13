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

// Production Management Modules (12 Modules)
import ProductionDashboardModule from './components/production/ProductionDashboardModule';
import ProductionPlanningModule from './components/production/ProductionPlanningModule';
import BOMModule from './components/production/BOMModule';
import ProductionScheduleModule from './components/production/ProductionScheduleModule';
import MaterialRequestsModule from './components/production/MaterialRequestsModule';
import ProductionMaterialIssueModule from './components/production/ProductionMaterialIssueModule';
import ProductionExecutionModule from './components/production/ProductionExecutionModule';
import ProductionUpdatesModule from './components/production/ProductionUpdatesModule';
import ProductionCompletionModule from './components/production/ProductionCompletionModule';
import ProductionQAModule from './components/production/ProductionQAModule';
import ReworkModule from './components/production/ReworkModule';
import FinishedGoodsModule from './components/production/FinishedGoodsModule';

// Logistics & Delivery Management Modules (9 Modules)
import LogisticsDashboardModule from './components/logistics/LogisticsDashboardModule';
import DeliveryPlanningModule from './components/logistics/DeliveryPlanningModule';
import VehicleCourierModule from './components/logistics/VehicleCourierModule';
import DispatchModule from './components/logistics/DispatchModule';
import DeliveryTrackingModule from './components/logistics/DeliveryTrackingModule';
import DeliveryConfirmationModule from './components/logistics/DeliveryConfirmationModule';
import InstallationModule from './components/logistics/InstallationModule';
import InstallationCompletionModule from './components/logistics/InstallationCompletionModule';
import LogisticsReportsModule from './components/logistics/LogisticsReportsModule';

// Employee Management & RBAC Modules (6 Modules)
import EmployeeDashboardModule from './components/employee/EmployeeDashboardModule';
import EmployeesModule from './components/employee/EmployeesModule';
import RolesPermissionsModule from './components/employee/RolesPermissionsModule';
import DepartmentsModule from './components/employee/DepartmentsModule';
import EmployeeLoginModule from './components/employee/EmployeeLoginModule';
import EmployeeReportsModule from './components/employee/EmployeeReportsModule';

import { api } from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeDomain, setActiveDomain] = useState('scm'); // 'scm' | 'sales' | 'production'
  const [activeModule, setActiveModule] = useState('scm-materials');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cross-module state
  const [preSelectedGRNForQC, setPreSelectedGRNForQC] = useState(null);

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
      return saved ? JSON.parse(saved) : null;
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
      setActiveModule('scm-materials');
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
    setActiveModule('scm-qc-tests');
  };

  // Sales Handlers
  const handleSaveEnquiry = async (data) => {
    await api.createEnquiry(data);
    await loadAllData();
  };
  const handleConvertToLead = async (enquiryId) => {
    await api.convertEnquiryToLead(enquiryId);
    await loadAllData();
    showToast('Enquiry successfully converted to Lead without duplicate customer entry', 'success');
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
    showToast('Sales Order approved and handed over to Production Planning!', 'success');
    setActiveDomain('production');
    setActiveModule('production-planning');
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
  const handleLogin = async (credentials) => {
    const res = await api.loginEmployee(credentials);
    if (res.user && res.token) {
      setCurrentUser(res.user);
      localStorage.setItem('cryo_auth_token', res.token);
      localStorage.setItem('cryo_current_user', JSON.stringify(res.user));
      showToast(`Welcome back, ${res.user.name} (${res.user.role?.roleName || 'Employee'})!`, 'success');
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
          {/* ========================================= */}
          {/* 1. SUPPLY CHAIN MANAGEMENT (10 MENUS)     */}
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
          {/* 2. SALES MANAGEMENT (10 MENUS)            */}
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

          {/* ========================================= */}
          {/* 3. PRODUCTION MANAGEMENT (12 MENUS)       */}
          {/* ========================================= */}
          {activeModule === 'production-dashboard' && (
            <ProductionDashboardModule
              dashboardData={productionDashboardData}
              onNavigateModule={(mod) => setActiveModule(`production-${mod}`)}
            />
          )}

          {activeModule === 'production-planning' && (
            <ProductionPlanningModule
              workOrders={workOrders}
              salesOrders={salesOrders}
              products={products}
              boms={boms}
              onSave={handleSaveWorkOrder}
              onUpdateStatus={handleUpdateWorkOrderStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-bom' && (
            <BOMModule
              boms={boms}
              products={products}
              materials={materials}
              onSave={handleSaveBOM}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-schedule' && (
            <ProductionScheduleModule
              schedules={schedules}
              workOrders={workOrders}
              onSave={handleSaveSchedule}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-material-requests' && (
            <MaterialRequestsModule
              materialRequests={materialRequests}
              workOrders={workOrders}
              materials={materials}
              boms={boms}
              inventory={inventory}
              onSave={handleSaveMaterialRequest}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-material-issue' && (
            <ProductionMaterialIssueModule
              materialIssues={productionMaterialIssues}
              materialRequests={materialRequests}
              inventory={inventory}
              onSave={handleSaveProductionMaterialIssue}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-execution' && (
            <ProductionExecutionModule
              executions={executions}
              workOrders={workOrders}
              onStart={handleStartExecution}
              onUpdateStatus={handleUpdateExecutionStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-updates' && (
            <ProductionUpdatesModule
              productionUpdates={productionUpdates}
              workOrders={workOrders}
              onSave={handleSaveProductionUpdate}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-completion' && (
            <ProductionCompletionModule
              completions={completions}
              workOrders={workOrders}
              onSave={handleSaveCompletion}
              onNavigateToQA={() => setActiveModule('production-qa')}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-qa' && (
            <ProductionQAModule
              qaTests={productionQATests}
              workOrders={workOrders}
              completions={completions}
              onSave={handleSaveProductionQA}
              onNavigateToRework={() => setActiveModule('production-rework')}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-rework' && (
            <ReworkModule
              reworkOrders={reworkOrders}
              workOrders={workOrders}
              onSave={handleSaveReworkOrder}
              onUpdateStatus={handleUpdateReworkStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'production-finished-goods' && (
            <FinishedGoodsModule
              finishedGoods={finishedGoods}
              workOrders={workOrders}
              qaTests={productionQATests}
              onSave={handleSaveFinishedGood}
              onUpdateStatus={handleUpdateFinishedGoodStatus}
              showToast={showToast}
            />
          )}

          {/* ========================================= */}
          {/* 4. LOGISTICS & DELIVERY (9 MENUS)         */}
          {/* ========================================= */}
          {activeModule === 'logistics-dashboard' && (
            <LogisticsDashboardModule
              dashboardData={logisticsDashboardData}
              deliveryPlans={deliveryPlans}
              onNavigateModule={(mod) => setActiveModule(`logistics-${mod}`)}
            />
          )}

          {activeModule === 'logistics-planning' && (
            <DeliveryPlanningModule
              deliveryPlans={deliveryPlans}
              salesOrders={salesOrders}
              finishedGoods={finishedGoods}
              onSave={handleSaveDeliveryPlan}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-vehicles-couriers' && (
            <VehicleCourierModule
              items={vehiclesCouriers}
              onSave={handleSaveVehicleCourier}
              onUpdate={handleUpdateVehicleCourier}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-dispatch' && (
            <DispatchModule
              dispatches={dispatches}
              deliveryPlans={deliveryPlans}
              vehiclesCouriers={vehiclesCouriers}
              finishedGoods={finishedGoods}
              onSave={handleSaveDispatch}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-tracking' && (
            <DeliveryTrackingModule
              trackingRecords={trackingRecords}
              deliveryPlans={deliveryPlans}
              onSave={handleSaveTrackingMilestone}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-confirmation' && (
            <DeliveryConfirmationModule
              confirmations={confirmations}
              deliveryPlans={deliveryPlans}
              onSave={handleSaveDeliveryConfirmation}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-installation' && (
            <InstallationModule
              installations={installations}
              deliveryPlans={deliveryPlans}
              onSave={handleSaveInstallation}
              onUpdateStatus={handleUpdateInstallationStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'logistics-installation-completion' && (
            <InstallationCompletionModule
              completions={installationCompletions}
              installations={installations}
              onSave={handleSaveInstallationCompletion}
              showToast={showToast}
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

          {/* ========================================= */}
          {/* 5. EMPLOYEE MANAGEMENT & RBAC (6 MENUS)   */}
          {/* ========================================= */}
          {activeModule === 'employee-dashboard' && (
            <EmployeeDashboardModule
              dashboardData={employeeDashboardData}
              departments={departments}
              roles={roles}
              employees={employees}
              onNavigateModule={(mod) => {
                setActiveModule(mod);
              }}
            />
          )}

          {activeModule === 'employee-directory' && (
            <EmployeesModule
              employees={employees}
              roles={roles}
              departments={departments}
              onSaveEmployee={handleSaveEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onResetPassword={handleResetPassword}
              onToggleStatus={handleToggleEmployeeStatus}
              showToast={showToast}
            />
          )}

          {activeModule === 'employee-roles-permissions' && (
            <RolesPermissionsModule
              roles={roles}
              departments={departments}
              onSaveRole={handleSaveRole}
              onUpdateRolePermissions={handleUpdateRolePermissions}
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

          {activeModule === 'employee-login' && (
            <EmployeeLoginModule
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              showToast={showToast}
            />
          )}

          {activeModule === 'employee-reports' && (
            <EmployeeReportsModule
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
    </div>
  );
}
