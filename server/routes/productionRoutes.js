const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');

// 01. Production Dashboard
router.get('/dashboard-summary', productionController.getProductionDashboard);

// 02. Production Planning
router.get('/work-orders', productionController.getWorkOrders);
router.post('/work-orders', productionController.createWorkOrder);
router.put('/work-orders/:id/status', productionController.updateWorkOrderStatus);

// 03. BOM – Bill of Materials
router.get('/boms', productionController.getBOMs);
router.post('/boms', productionController.createBOM);
router.put('/boms/:id', productionController.updateBOM);

// 04. Production Schedule
router.get('/schedules', productionController.getSchedules);
router.post('/schedules', productionController.createSchedule);
router.put('/schedules/:id', productionController.updateSchedule);

// 05. Material Requests
router.get('/material-requests', productionController.getMaterialRequests);
router.post('/material-requests', productionController.createMaterialRequest);
router.put('/material-requests/:id/status', productionController.updateMaterialRequestStatus);

// 06. Material Issue
router.get('/material-issues', productionController.getMaterialIssues);
router.post('/material-issues', productionController.createMaterialIssue);

// 07. Production Execution
router.get('/executions', productionController.getExecutions);
router.post('/executions', productionController.startExecution);
router.put('/executions/:id/status', productionController.updateExecutionStatus);

// 08. Production Updates (Daily / Weekly)
router.get('/production-updates', productionController.getProductionUpdates);
router.post('/production-updates', productionController.createProductionUpdate);

// 09. Production Completion
router.get('/completions', productionController.getCompletions);
router.post('/completions', productionController.createCompletion);

// 10. Quality Assurance (QA)
router.get('/qa-tests', productionController.getQATests);
router.post('/qa-tests', productionController.createQATest);

// 11. Rework / Rebuild
router.get('/rework-orders', productionController.getReworkOrders);
router.post('/rework-orders', productionController.createReworkOrder);
router.put('/rework-orders/:id/status', productionController.updateReworkStatus);

// 12. Finished Goods
router.get('/finished-goods', productionController.getFinishedGoods);
router.post('/finished-goods', productionController.createFinishedGood);
router.put('/finished-goods/:id/status', productionController.updateFinishedGoodStatus);

module.exports = router;

