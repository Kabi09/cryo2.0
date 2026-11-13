const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Product Master
router.get('/products', salesController.getProducts);
router.post('/products', salesController.createProduct);

// 01. Dashboard
router.get('/dashboard-summary', salesController.getDashboardSummary);

// 02. Customer Enquiries
router.get('/enquiries', salesController.getEnquiries);
router.post('/enquiries', salesController.createEnquiry);
router.post('/enquiries/:id/convert-to-lead', salesController.convertEnquiryToLead);

// 03. Customers & Leads
router.get('/customers', salesController.getCustomers);
router.post('/customers', salesController.createCustomer);
router.get('/leads', salesController.getLeads);
router.post('/leads', salesController.createLead);
router.put('/leads/:id/status', salesController.updateLeadStatus);

// 04. Follow-ups
router.get('/follow-ups', salesController.getFollowUps);
router.post('/follow-ups', salesController.createFollowUp);
router.put('/follow-ups/:id/status', salesController.updateFollowUpStatus);

// 05. Quotations (with V1, V2, V3 versioning)
router.get('/quotations', salesController.getQuotations);
router.post('/quotations', salesController.createQuotation);
router.post('/quotations/:id/revise', salesController.reviseQuotation);
router.put('/quotations/:id/status', salesController.updateQuotationStatus);

// 06. Proforma Invoices (PI)
router.get('/proforma-invoices', salesController.getProformaInvoices);
router.post('/proforma-invoices', salesController.createProformaInvoice);

// 07. Customer Purchase Orders
router.get('/customer-pos', salesController.getCustomerPOs);
router.post('/customer-pos', salesController.createCustomerPO);
router.put('/customer-pos/:id/verify', salesController.verifyCustomerPO);

// 08. Payments
router.get('/payments', salesController.getPayments);
router.post('/payments', salesController.createPayment);
router.put('/payments/:id/verify', salesController.verifyPayment);

// 09. Sales Orders (SO)
router.get('/sales-orders', salesController.getSalesOrders);
router.post('/sales-orders', salesController.createSalesOrder);
router.post('/sales-orders/:id/send-to-production', salesController.sendSOToProduction);

// 10. Sales Reports
router.get('/sales-reports', salesController.getSalesReports);

module.exports = router;

