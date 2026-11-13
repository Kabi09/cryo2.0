const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');

// 1. Dashboard
router.get('/dashboard', logisticsController.getDashboardSummary);

// 2. Delivery Planning
router.get('/delivery-plans', logisticsController.getDeliveryPlans);
router.post('/delivery-plans', logisticsController.createDeliveryPlan);

// 3. Vehicles & Couriers
router.get('/vehicles-couriers', logisticsController.getVehiclesCouriers);
router.post('/vehicles-couriers', logisticsController.createVehicleCourier);
router.put('/vehicles-couriers/:id', logisticsController.updateVehicleCourier);

// 4. Dispatch
router.get('/dispatches', logisticsController.getDispatches);
router.post('/dispatches', logisticsController.createDispatch);

// 5. Tracking
router.get('/tracking', logisticsController.getDeliveryTracking);
router.post('/tracking', logisticsController.updateTrackingMilestone);

// 6. Delivery Confirmation (POD)
router.get('/confirmations', logisticsController.getDeliveryConfirmations);
router.post('/confirmations', logisticsController.createDeliveryConfirmation);

// 7. Installation
router.get('/installations', logisticsController.getInstallations);
router.post('/installations', logisticsController.createInstallation);
router.put('/installations/:id/status', logisticsController.updateInstallationStatus);

// 8. Installation Completion
router.get('/installation-completions', logisticsController.getInstallationCompletions);
router.post('/installation-completions', logisticsController.createInstallationCompletion);

// 9. Reports
router.get('/reports', logisticsController.getLogisticsReports);

module.exports = router;

