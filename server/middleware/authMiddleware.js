const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'cryo_enterprise_rbac_secret_2026';

// Verify JWT Token
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Access token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const employee = await Employee.findById(decoded.id)
      .populate('role')
      .populate('department')
      .select('-password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists'
      });
    }

    if (employee.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated or suspended. Contact Super Admin.'
      });
    }

    req.employee = employee;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
};

// Check RBAC Permissions
exports.checkPermission = (moduleName, action = 'view') => {
  return (req, res, next) => {
    // If not authenticated, block
    if (!req.employee || !req.employee.role) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: User role unassigned'
      });
    }

    const role = req.employee.role;

    // Super Admin has unrestricted universal privileges
    if (role.isSuperAdmin || role.name === 'Super Admin') {
      return next();
    }

    const modulePerms = role.permissions ? role.permissions[moduleName] : null;

    if (!modulePerms || !modulePerms.access) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You do not have permission to access the '${moduleName}' module.`
      });
    }

    if (action && !modulePerms[action]) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You lack '${action}' permission in '${moduleName}'.`
      });
    }

    next();
  };
};

// Audit Logger Helper
exports.logAudit = async (action, performedBy, roleName, target, details, req) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      performedByRole: roleName,
      target,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || '127.0.0.1'
    });
  } catch (e) {
    console.error('Audit log creation error:', e.message);
  }
};

exports.JWT_SECRET = JWT_SECRET;

