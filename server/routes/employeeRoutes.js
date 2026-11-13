const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Authentication
router.post('/login', employeeController.login);
router.get('/me', protect, employeeController.getMe);

// Dashboard & Reports
router.get('/dashboard', employeeController.getDashboardSummary);
router.get('/reports', employeeController.getReports);
router.get('/audit-logs', employeeController.getAuditLogs);

// Roles & Permissions
router.get('/roles', employeeController.getRoles);
router.post('/roles', employeeController.createRole);
router.put('/roles/:id', employeeController.updateRolePermissions);

// Departments
router.get('/departments', employeeController.getDepartments);
router.post('/departments', employeeController.createDepartment);

// Employees CRUD
router.get('/', employeeController.getEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.put('/:id/reset-password', employeeController.resetPassword);
router.put('/:id/toggle-status', employeeController.toggleEmployeeStatus);

module.exports = router;

