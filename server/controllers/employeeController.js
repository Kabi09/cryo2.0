const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');
const { JWT_SECRET, logAudit } = require('../middleware/authMiddleware');

// Standard ERP Modules List
const ERP_MODULES = [
  'Dashboard',
  'Marketing',
  'Sales',
  'Purchase',
  'Production',
  'Supply Chain',
  'Inventory',
  'Quality Assurance',
  'Logistics',
  'Installation',
  'Employee Management',
  'Reports',
  'Settings'
];

// 01. Employee Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const employee = await Employee.findOne({ username: username.toLowerCase().trim() })
      .populate('role')
      .populate('department');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (employee.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated or suspended. Please contact Super Admin.'
      });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        username: employee.username,
        role: employee.role?.name,
        isSuperAdmin: employee.role?.isSuperAdmin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await logAudit(
      'EMPLOYEE_LOGIN',
      employee.username,
      employee.role?.name || 'Employee',
      employee.employeeId,
      { loginTime: new Date() },
      req
    );

    const userObj = {
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      mobile: employee.mobile,
      department: employee.departmentName,
      designation: employee.designation,
      role: employee.role,
      username: employee.username,
      profileImage: employee.profileImage,
      joiningDate: employee.joiningDate,
      lastLogin: employee.lastLogin
    };

    res.json({
      success: true,
      token,
      data: userObj,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 02. Get Current Authenticated Profile
exports.getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id)
      .populate('role')
      .populate('department')
      .select('-password');

    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 03. HR & Access Control Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentsCount,
      rolesCount,
      recentEmployees,
      recentAuditLogs
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: { $ne: 'Active' } }),
      Department.countDocuments({ status: 'Active' }),
      Role.countDocuments({ status: 'Active' }),
      Employee.find().sort({ createdAt: -1 }).limit(5).populate('role').select('-password'),
      AuditLog.find().sort({ createdAt: -1 }).limit(8)
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          departmentsCount,
          rolesCount
        },
        recentEmployees,
        recentAuditLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 04. Employee Listing with Filters
exports.getEmployees = async (req, res) => {
  try {
    const { department, role, status, search } = req.query;
    const filter = {};

    if (department && department !== 'All') filter.departmentName = department;
    if (role && role !== 'All') filter.roleName = role;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter)
      .populate('role')
      .populate('department')
      .sort({ createdAt: -1 })
      .select('-password');

    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 05. Create New Employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      department: departmentId,
      designation,
      role: roleId,
      reportingManager,
      username,
      password,
      profileImage,
      joiningDate
    } = req.body;

    if (!name || !email || !mobile || !designation || !roleId || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile, designation, role, username and password are required'
      });
    }

    // Check duplicates
    const existingUser = await Employee.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.toLowerCase().trim() }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or username already exists'
      });
    }

    // Auto-generate sequential employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;

    // Fetch Role & Department
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
      return res.status(400).json({ success: false, message: 'Selected role not found' });
    }

    let departmentName = 'General';
    if (departmentId) {
      const depDoc = await Department.findById(departmentId);
      if (depDoc) {
        departmentName = depDoc.name;
        depDoc.staffCount = (depDoc.staffCount || 0) + 1;
        await depDoc.save();
      }
    }

    const newEmployee = new Employee({
      employeeId,
      name,
      email: email.toLowerCase().trim(),
      mobile,
      department: departmentId || null,
      departmentName,
      designation,
      role: roleId,
      roleName: roleDoc.name,
      reportingManager: reportingManager || 'Super Admin',
      username: username.toLowerCase().trim(),
      password,
      profileImage: profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      joiningDate: joiningDate || Date.now(),
      status: 'Active'
    });

    await newEmployee.save();

    await logAudit(
      'EMPLOYEE_CREATE',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      employeeId,
      { name, role: roleDoc.name, department: departmentName },
      req
    );

    const saved = await Employee.findById(newEmployee._id).populate('role').populate('department').select('-password');
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 06. Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      name,
      email,
      mobile,
      department: departmentId,
      designation,
      role: roleId,
      reportingManager,
      status
    } = req.body;

    if (name) employee.name = name;
    if (email) employee.email = email.toLowerCase().trim();
    if (mobile) employee.mobile = mobile;
    if (designation) employee.designation = designation;
    if (reportingManager) employee.reportingManager = reportingManager;
    if (status) employee.status = status;

    if (roleId && roleId !== String(employee.role)) {
      const roleDoc = await Role.findById(roleId);
      if (roleDoc) {
        employee.role = roleId;
        employee.roleName = roleDoc.name;
      }
    }

    if (departmentId && departmentId !== String(employee.department)) {
      const depDoc = await Department.findById(departmentId);
      if (depDoc) {
        employee.department = departmentId;
        employee.departmentName = depDoc.name;
      }
    }

    await employee.save();

    await logAudit(
      'EMPLOYEE_UPDATE',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      employee.employeeId,
      { updatedFields: req.body },
      req
    );

    const updated = await Employee.findById(id).populate('role').populate('department').select('-password');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 07. Reset Employee Password
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.password = newPassword;
    await employee.save();

    await logAudit(
      'PASSWORD_RESET',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      employee.employeeId,
      { note: 'Password reset by admin' },
      req
    );

    res.json({ success: true, message: `Password reset successfully for ${employee.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 08. Deactivate / Activate Employee
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate('role');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Safety rule: Cannot deactivate Super Admin
    if (employee.role?.isSuperAdmin || employee.username === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Safety Rule: Super Admin account cannot be deactivated!'
      });
    }

    employee.status = employee.status === 'Active' ? 'Deactivated' : 'Active';
    await employee.save();

    await logAudit(
      'STATUS_CHANGE',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      employee.employeeId,
      { newStatus: employee.status },
      req
    );

    res.json({
      success: true,
      message: `Employee ${employee.name} is now ${employee.status}`,
      data: employee
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 09. Get Roles & Permissions
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ isSuperAdmin: -1, createdAt: 1 });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Create Role with Initial Permissions
exports.createRole = async (req, res) => {
  try {
    const { name, description, department, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A role with this name already exists' });
    }

    // Build permissions for all 13 modules
    const formattedPerms = {};
    ERP_MODULES.forEach(mod => {
      formattedPerms[mod] = permissions?.[mod] || {
        access: false,
        view: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        approve: false
      };
    });

    const newRole = new Role({
      name: name.trim(),
      description: description || '',
      department: department || 'General',
      isSuperAdmin: false,
      permissions: formattedPerms
    });

    await newRole.save();

    await logAudit(
      'ROLE_CREATE',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      newRole.name,
      { description },
      req
    );

    res.status(201).json({ success: true, data: newRole });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 11. Update Permissions Matrix for a Role
exports.updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, description, status, department } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Safety rule: Super Admin permissions cannot be modified or degraded
    if (role.isSuperAdmin || role.name === 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Safety Rule: Super Admin permissions are permanent and cannot be modified!'
      });
    }

    if (description !== undefined) role.description = description;
    if (status) role.status = status;
    if (department) role.department = department;

    if (permissions) {
      // Ensure business rule: if access is false, all actions are cleared
      const updatedPerms = { ...role.permissions.toObject() };
      ERP_MODULES.forEach(mod => {
        if (permissions[mod]) {
          const modP = permissions[mod];
          const hasAccess = Boolean(modP.access);
          updatedPerms[mod] = {
            access: hasAccess,
            view: hasAccess ? Boolean(modP.view) : false,
            add: hasAccess ? Boolean(modP.add) : false,
            edit: hasAccess ? Boolean(modP.edit) : false,
            delete: hasAccess ? Boolean(modP.delete) : false,
            export: hasAccess ? Boolean(modP.export) : false,
            approve: hasAccess ? Boolean(modP.approve) : false
          };
        }
      });
      role.permissions = updatedPerms;
    }

    await role.save();

    await logAudit(
      'PERMISSION_UPDATE',
      req.employee?.username || 'Super Admin',
      req.employee?.role?.name || 'Super Admin',
      role.name,
      { updatedRole: role.name },
      req
    );

    res.json({
      success: true,
      message: `Permissions updated successfully for role: ${role.name}`,
      data: role
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 12. Get Departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, count: departments.length, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 13. Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, headOfDepartment } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const trimmedName = name.trim();

    // Check duplicate name (case-insensitive)
    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Department "${trimmedName}" already exists with code ${existing.departmentCode}. Please use a unique department name.`
      });
    }

    // Generate unique code with high-entropy timestamp suffix
    const cleanPrefix = trimmedName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'DEPT';
    const count = await Department.countDocuments();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `DEP-${cleanPrefix}-${count + 1}-${randomSuffix}`;

    const dep = new Department({
      departmentCode: code,
      name: trimmedName,
      description: description || '',
      headOfDepartment: headOfDepartment || 'Operations Lead'
    });

    await dep.save();
    res.status(201).json({ success: true, data: dep });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name or code already exists in the system.'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// 14. Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 15. Employee Reports
exports.getReports = async (req, res) => {
  try {
    const employees = await Employee.find().populate('role').populate('department').select('-password');
    const departments = await Department.find();
    const roles = await Role.find();
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);

    // Distribution metrics
    const departmentDistribution = {};
    departments.forEach(d => { departmentDistribution[d.name] = 0; });
    employees.forEach(e => {
      const dep = e.departmentName || 'General';
      departmentDistribution[dep] = (departmentDistribution[dep] || 0) + 1;
    });

    const roleDistribution = {};
    roles.forEach(r => { roleDistribution[r.name] = 0; });
    employees.forEach(e => {
      const r = e.roleName || 'Employee';
      roleDistribution[r] = (roleDistribution[r] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalStaff: employees.length,
        activeStaff: employees.filter(e => e.status === 'Active').length,
        deactivatedStaff: employees.filter(e => e.status !== 'Active').length,
        departmentDistribution,
        roleDistribution,
        employees,
        auditLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

