const express = require('express');
const router = express.Router();
const scmController = require('../controllers/scmController');

// 01. Raw Material Master
router.get('/materials', scmController.getMaterials);
router.post('/materials', scmController.createMaterial);
router.put('/materials/:id', scmController.updateMaterial);

// 02. Suppliers
router.get('/suppliers', scmController.getSuppliers);
router.post('/suppliers', scmController.createSupplier);
router.put('/suppliers/:id', scmController.updateSupplier);

// 03. Supplier Material Link
router.get('/supplier-material-links', scmController.getSupplierMaterialLinks);
router.post('/supplier-material-links', scmController.createSupplierMaterialLink);
router.put('/supplier-material-links/:id', scmController.updateSupplierMaterialLink);

// 04. Purchase Orders
router.get('/purchase-orders', scmController.getPurchaseOrders);
router.post('/purchase-orders', scmController.createPurchaseOrder);
router.put('/purchase-orders/:id/status', scmController.updatePOStatus);

// 05. GRN (Goods Receipt Note)
router.get('/grns', scmController.getGRNs);
router.post('/grns', scmController.createGRN);

// 06. QC Tests
router.get('/qc-tests', scmController.getQCTests);
router.post('/qc-tests', scmController.createQCTest);

// 07. Raw Material Inventory & Ledger
router.get('/inventory', scmController.getInventory);
router.get('/inventory/ledger/:materialId', scmController.getMaterialStockLedger);
router.post('/inventory/adjust', scmController.adjustStock);

// 08. Material Issue to Production
router.get('/material-issues', scmController.getMaterialIssues);
router.post('/material-issues', scmController.createMaterialIssue);

// 09. Returns to Supplier
router.get('/supplier-returns', scmController.getSupplierReturns);
router.post('/supplier-returns', scmController.createSupplierReturn);

// 10. Inventory Report & Analytics
router.get('/reports', scmController.getInventoryReport);

module.exports = router;

