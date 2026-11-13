const API_BASE = '/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // ==========================================
  // SUPPLY CHAIN MANAGEMENT (SCM) ENDPOINTS
  // ==========================================
  
  // 01. Materials Master
  getMaterials: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/materials?${query}`).then(handleResponse);
  },
  createMaterial: (data) =>
    fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateMaterial: (id, data) =>
    fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 02. SCM Suppliers
  getSuppliers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/suppliers?${query}`).then(handleResponse);
  },
  createSupplier: (data) =>
    fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateSupplier: (id, data) =>
    fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 03. Supplier Material Link
  getSupplierMaterialLinks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/supplier-material-links?${query}`).then(handleResponse);
  },
  createSupplierMaterialLink: (data) =>
    fetch(`${API_BASE}/supplier-material-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateSupplierMaterialLink: (id, data) =>
    fetch(`${API_BASE}/supplier-material-links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 04. Purchase Orders (PO)
  getPurchaseOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/purchase-orders?${query}`).then(handleResponse);
  },
  createPurchaseOrder: (data) =>
    fetch(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updatePOStatus: (id, status) =>
    fetch(`${API_BASE}/purchase-orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // 05. Goods Receipt Note (GRN)
  getGRNs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/grns?${query}`).then(handleResponse);
  },
  createGRN: (data) =>
    fetch(`${API_BASE}/grns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 06. QC Tests
  getQCTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/qc-tests?${query}`).then(handleResponse);
  },
  createQCTest: (data) =>
    fetch(`${API_BASE}/qc-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 07. Raw Material Inventory & Ledger
  getInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/inventory?${query}`).then(handleResponse);
  },
  getMaterialLedger: (materialId) =>
    fetch(`${API_BASE}/inventory/ledger/${materialId}`).then(handleResponse),
  adjustStock: (data) =>
    fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 08. Material Issue to Production
  getMaterialIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/material-issues?${query}`).then(handleResponse);
  },
  createMaterialIssue: (data) =>
    fetch(`${API_BASE}/material-issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 09. Returns to Supplier
  getSupplierReturns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/supplier-returns?${query}`).then(handleResponse);
  },
  createSupplierReturn: (data) =>
    fetch(`${API_BASE}/supplier-returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 10. SCM Inventory Report
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reports?${query}`).then(handleResponse);
  },

  // ==========================================
  // SALES MANAGEMENT ENDPOINTS
  // ==========================================
  getProducts: () => fetch(`${API_BASE}/sales/products`).then(handleResponse),
  createProduct: (data) =>
    fetch(`${API_BASE}/sales/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getDashboardSummary: () => fetch(`${API_BASE}/sales/dashboard-summary`).then(handleResponse),

  getEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/enquiries?${query}`).then(handleResponse);
  },
  createEnquiry: (data) =>
    fetch(`${API_BASE}/sales/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  convertEnquiryToLead: (id) =>
    fetch(`${API_BASE}/sales/enquiries/${id}/convert-to-lead`, {
      method: 'POST'
    }).then(handleResponse),

  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/customers?${query}`).then(handleResponse);
  },
  createCustomer: (data) =>
    fetch(`${API_BASE}/sales/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getLeads: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/leads?${query}`).then(handleResponse);
  },
  createLead: (data) =>
    fetch(`${API_BASE}/sales/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateLeadStatus: (id, leadStatus) =>
    fetch(`${API_BASE}/sales/leads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadStatus })
    }).then(handleResponse),

  getFollowUps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/follow-ups?${query}`).then(handleResponse);
  },
  createFollowUp: (data) =>
    fetch(`${API_BASE}/sales/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateFollowUpStatus: (id, status) =>
    fetch(`${API_BASE}/sales/follow-ups/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  getQuotations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/quotations?${query}`).then(handleResponse);
  },
  createQuotation: (data) =>
    fetch(`${API_BASE}/sales/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  reviseQuotation: (id, data) =>
    fetch(`${API_BASE}/sales/quotations/${id}/revise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateQuotationStatus: (id, status) =>
    fetch(`${API_BASE}/sales/quotations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  getProformaInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/proforma-invoices?${query}`).then(handleResponse);
  },
  createProformaInvoice: (data) =>
    fetch(`${API_BASE}/sales/proforma-invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getCustomerPOs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/customer-pos?${query}`).then(handleResponse);
  },
  createCustomerPO: (data) =>
    fetch(`${API_BASE}/sales/customer-pos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  verifyCustomerPO: (id, data = {}) =>
    fetch(`${API_BASE}/sales/customer-pos/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/payments?${query}`).then(handleResponse);
  },
  createPayment: (data) =>
    fetch(`${API_BASE}/sales/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  verifyPayment: (id, data = {}) =>
    fetch(`${API_BASE}/sales/payments/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getSalesOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/sales/sales-orders?${query}`).then(handleResponse);
  },
  createSalesOrder: (data) =>
    fetch(`${API_BASE}/sales/sales-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  sendSOToProduction: (id, data = {}) =>
    fetch(`${API_BASE}/sales/sales-orders/${id}/send-to-production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  getSalesReports: () => fetch(`${API_BASE}/sales/sales-reports`).then(handleResponse),

  // ==========================================
  // PRODUCTION MANAGEMENT ENDPOINTS (12 MENUS)
  // ==========================================

  // 01. Dashboard
  getProductionDashboard: () => fetch(`${API_BASE}/production/dashboard-summary`).then(handleResponse),

  // 02. Production Planning
  getWorkOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/work-orders?${query}`).then(handleResponse);
  },
  createWorkOrder: (data) =>
    fetch(`${API_BASE}/production/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateWorkOrderStatus: (id, status) =>
    fetch(`${API_BASE}/production/work-orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // 03. BOM – Bill of Materials
  getBOMs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/boms?${query}`).then(handleResponse);
  },
  createBOM: (data) =>
    fetch(`${API_BASE}/production/boms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateBOM: (id, data) =>
    fetch(`${API_BASE}/production/boms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 04. Production Schedule
  getSchedules: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/schedules?${query}`).then(handleResponse);
  },
  createSchedule: (data) =>
    fetch(`${API_BASE}/production/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateSchedule: (id, data) =>
    fetch(`${API_BASE}/production/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 05. Material Requests
  getMaterialRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/material-requests?${query}`).then(handleResponse);
  },
  createMaterialRequest: (data) =>
    fetch(`${API_BASE}/production/material-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateMaterialRequestStatus: (id, status) =>
    fetch(`${API_BASE}/production/material-requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // 06. Material Issue
  getProductionMaterialIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/material-issues?${query}`).then(handleResponse);
  },
  createProductionMaterialIssue: (data) =>
    fetch(`${API_BASE}/production/material-issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 07. Production Execution
  getExecutions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/executions?${query}`).then(handleResponse);
  },
  startExecution: (data) =>
    fetch(`${API_BASE}/production/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateExecutionStatus: (id, status) =>
    fetch(`${API_BASE}/production/executions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // 08. Production Updates (Daily / Weekly)
  getProductionUpdates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/production-updates?${query}`).then(handleResponse);
  },
  createProductionUpdate: (data) =>
    fetch(`${API_BASE}/production/production-updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 09. Production Completion
  getCompletions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/completions?${query}`).then(handleResponse);
  },
  createCompletion: (data) =>
    fetch(`${API_BASE}/production/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 10. Quality Assurance (QA)
  getProductionQATests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/qa-tests?${query}`).then(handleResponse);
  },
  createProductionQATest: (data) =>
    fetch(`${API_BASE}/production/qa-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 11. Rework / Rebuild
  getReworkOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/rework-orders?${query}`).then(handleResponse);
  },
  createReworkOrder: (data) =>
    fetch(`${API_BASE}/production/rework-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateReworkStatus: (id, data) =>
    fetch(`${API_BASE}/production/rework-orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // 12. Finished Goods
  getFinishedGoods: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/production/finished-goods?${query}`).then(handleResponse);
  },
  createFinishedGood: (data) =>
    fetch(`${API_BASE}/production/finished-goods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateFinishedGoodStatus: (id, stockStatus) =>
    fetch(`${API_BASE}/production/finished-goods/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockStatus })
    }).then(handleResponse)
};
