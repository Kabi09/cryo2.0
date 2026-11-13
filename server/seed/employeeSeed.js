require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

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

async function seedEmployees() {
  await connectDB();
  console.log('--- Seeding Employee Management & RBAC Data ---');

  // Clear existing
  await Department.deleteMany({});
  await Role.deleteMany({});
  await Employee.deleteMany({});
  await AuditLog.deleteMany({});
  console.log('Cleared existing Employee, Role, Department & Audit collections');

  // 1. Seed Departments
  const departmentsData = [
    { departmentCode: 'DEP-MGMT', name: 'Management & Executive', description: 'Executive leadership, governance & company administration', headOfDepartment: 'Alexander Vance' },
    { departmentCode: 'DEP-SALES', name: 'Sales & Marketing', description: 'Customer relationship, quotations, order booking & marketing', headOfDepartment: 'Rajesh Kannan' },
    { departmentCode: 'DEP-SCM', name: 'Supply Chain & Procurement', description: 'Raw material procurement, vendor management & central store', headOfDepartment: 'Kumar Velan' },
    { departmentCode: 'DEP-PROD', name: 'Production & Assembly', description: 'Precision cryo machinery manufacturing, shop floor & scheduling', headOfDepartment: 'Suresh Murugan' },
    { departmentCode: 'DEP-QA', name: 'Quality Assurance & QC', description: 'Multi-point testing, thermal certification & rebuild inspection', headOfDepartment: 'Dr. Meena Ramesh' },
    { departmentCode: 'DEP-LOG', name: 'Logistics & Field Service', description: 'Outbound dispatch, tracking, delivery & on-site installation', headOfDepartment: 'Dinesh Kumar' }
  ];

  const createdDepartments = await Department.insertMany(departmentsData);
  console.log(`Created ${createdDepartments.length} Departments`);

  const depMap = {};
  createdDepartments.forEach(d => { depMap[d.departmentCode] = d; });

  // 2. Build Roles with Module Permission Matrix
  const makeFullPerms = (access = true) => {
    const p = {};
    ERP_MODULES.forEach(m => {
      p[m] = {
        access,
        view: access,
        add: access,
        edit: access,
        delete: access,
        export: access,
        approve: access
      };
    });
    return p;
  };

  // Super Admin: All true across all modules
  const superAdminRole = new Role({
    name: 'Super Admin',
    description: 'Supreme administrator with unrestricted access across all ERP departments and security settings',
    department: 'Management & Executive',
    isSuperAdmin: true,
    status: 'Active',
    permissions: makeFullPerms(true)
  });

  // Admin: Operational control across core modules
  const adminPerms = makeFullPerms(false);
  ['Dashboard', 'Sales', 'Production', 'Supply Chain', 'Inventory', 'Quality Assurance', 'Logistics', 'Installation', 'Reports'].forEach(m => {
    adminPerms[m] = { access: true, view: true, add: true, edit: true, delete: false, export: true, approve: true };
  });
  adminPerms['Employee Management'] = { access: true, view: true, add: true, edit: true, delete: false, export: true, approve: false };
  const adminRole = new Role({
    name: 'Admin',
    description: 'Operations manager with multi-department operational authorization',
    department: 'Management & Executive',
    isSuperAdmin: false,
    status: 'Active',
    permissions: adminPerms
  });

  // Sales Executive
  const salesPerms = makeFullPerms(false);
  ['Dashboard', 'Marketing', 'Sales', 'Reports'].forEach(m => {
    salesPerms[m] = { access: true, view: true, add: true, edit: true, delete: false, export: true, approve: false };
  });
  const salesRole = new Role({
    name: 'Sales Executive',
    description: 'Lead generation, customer quotes, proforma invoices, and customer order management',
    department: 'Sales & Marketing',
    isSuperAdmin: false,
    status: 'Active',
    permissions: salesPerms
  });

  // Production Supervisor
  const prodPerms = makeFullPerms(false);
  ['Dashboard', 'Production', 'Inventory', 'Quality Assurance'].forEach(m => {
    prodPerms[m] = { access: true, view: true, add: true, edit: true, delete: false, export: false, approve: true };
  });
  const prodRole = new Role({
    name: 'Production Supervisor',
    description: 'Shop floor execution, assembly completion, and shift progress reporting',
    department: 'Production & Assembly',
    isSuperAdmin: false,
    status: 'Active',
    permissions: prodPerms
  });

  // Store Keeper
  const storePerms = makeFullPerms(false);
  ['Dashboard', 'Supply Chain', 'Purchase', 'Inventory'].forEach(m => {
    storePerms[m] = { access: true, view: true, add: true, edit: true, delete: false, export: true, approve: true };
  });
  const storeRole = new Role({
    name: 'Store Manager',
    description: 'Inward GRN receipt, warehouse inventory control, and production material issuance',
    department: 'Supply Chain & Procurement',
    isSuperAdmin: false,
    status: 'Active',
    permissions: storePerms
  });

  // Lead Field Engineer
  const fieldPerms = makeFullPerms(false);
  ['Dashboard', 'Logistics', 'Installation'].forEach(m => {
    fieldPerms[m] = { access: true, view: true, add: true, edit: true, delete: false, export: false, approve: true };
  });
  const fieldRole = new Role({
    name: 'Lead Field Engineer',
    description: 'Customer delivery fulfillment, on-site commissioning, and 7-point QA sign-off',
    department: 'Logistics & Field Service',
    isSuperAdmin: false,
    status: 'Active',
    permissions: fieldPerms
  });

  // General Employee
  const employeePerms = makeFullPerms(false);
  ['Dashboard', 'Reports'].forEach(m => {
    employeePerms[m] = { access: true, view: true, add: false, edit: false, delete: false, export: false, approve: false };
  });
  const employeeRole = new Role({
    name: 'Employee',
    description: 'General staff with read-only dashboard visibility',
    department: 'General',
    isSuperAdmin: false,
    status: 'Active',
    permissions: employeePerms
  });

  const createdRoles = await Role.insertMany([
    superAdminRole,
    adminRole,
    salesRole,
    prodRole,
    storeRole,
    fieldRole,
    employeeRole
  ]);
  console.log(`Created ${createdRoles.length} RBAC Roles`);

  const roleMap = {};
  createdRoles.forEach(r => { roleMap[r.name] = r; });

  // 3. Seed Employees
  const employeesData = [
    {
      employeeId: 'EMP-001',
      name: 'Alexander Vance',
      email: 'superadmin@cryo.com',
      mobile: '+91 98765 00001',
      department: depMap['DEP-MGMT']._id,
      departmentName: depMap['DEP-MGMT'].name,
      designation: 'Managing Director & Super Admin',
      role: roleMap['Super Admin']._id,
      roleName: 'Super Admin',
      reportingManager: 'Board of Directors',
      username: 'superadmin',
      password: 'SuperAdmin@123',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-01-10'),
      status: 'Active'
    },
    {
      employeeId: 'EMP-002',
      name: 'Kavitha Sundaram',
      email: 'kavitha.admin@cryo.com',
      mobile: '+91 98765 00002',
      department: depMap['DEP-MGMT']._id,
      departmentName: depMap['DEP-MGMT'].name,
      designation: 'Operations Director',
      role: roleMap['Admin']._id,
      roleName: 'Admin',
      reportingManager: 'Alexander Vance',
      username: 'admin.operations',
      password: 'Admin@123',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-04-15'),
      status: 'Active'
    },
    {
      employeeId: 'EMP-003',
      name: 'Rajesh Kannan',
      email: 'rajesh.sales@cryo.com',
      mobile: '+91 98765 00003',
      department: depMap['DEP-SALES']._id,
      departmentName: depMap['DEP-SALES'].name,
      designation: 'Senior Sales Executive',
      role: roleMap['Sales Executive']._id,
      roleName: 'Sales Executive',
      reportingManager: 'Kavitha Sundaram',
      username: 'sales.rajesh',
      password: 'Sales@123',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-06-01'),
      status: 'Active'
    },
    {
      employeeId: 'EMP-004',
      name: 'Suresh Murugan',
      email: 'suresh.prod@cryo.com',
      mobile: '+91 98765 00004',
      department: depMap['DEP-PROD']._id,
      departmentName: depMap['DEP-PROD'].name,
      designation: 'Plant Production Head',
      role: roleMap['Production Supervisor']._id,
      roleName: 'Production Supervisor',
      reportingManager: 'Kavitha Sundaram',
      username: 'prod.suresh',
      password: 'Prod@123',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-05-20'),
      status: 'Active'
    },
    {
      employeeId: 'EMP-005',
      name: 'Kumar Velan',
      email: 'kumar.store@cryo.com',
      mobile: '+91 98765 00005',
      department: depMap['DEP-SCM']._id,
      departmentName: depMap['DEP-SCM'].name,
      designation: 'Store & Warehouse Manager',
      role: roleMap['Store Manager']._id,
      roleName: 'Store Manager',
      reportingManager: 'Kavitha Sundaram',
      username: 'store.kumar',
      password: 'Store@123',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-07-11'),
      status: 'Active'
    },
    {
      employeeId: 'EMP-006',
      name: 'Dinesh Kumar',
      email: 'dinesh.logistics@cryo.com',
      mobile: '+91 98765 00006',
      department: depMap['DEP-LOG']._id,
      departmentName: depMap['DEP-LOG'].name,
      designation: 'Field Commissioning Lead',
      role: roleMap['Lead Field Engineer']._id,
      roleName: 'Lead Field Engineer',
      reportingManager: 'Kavitha Sundaram',
      username: 'log.dinesh',
      password: 'Logistics@123',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      joiningDate: new Date('2023-08-01'),
      status: 'Active'
    }
  ];

  for (const empData of employeesData) {
    const emp = new Employee(empData);
    await emp.save(); // triggers bcrypt hash hook
  }
  console.log(`Created ${employeesData.length} Employee accounts with hashed credentials`);

  // Update staff counts in departments
  for (const dep of createdDepartments) {
    const c = await Employee.countDocuments({ department: dep._id });
    dep.staffCount = c;
    await dep.save();
  }

  // Initial Audit Logs
  await AuditLog.insertMany([
    {
      action: 'SYSTEM_INIT',
      performedBy: 'superadmin',
      performedByRole: 'Super Admin',
      target: 'RBAC_SECURITY_SUBSYSTEM',
      details: { message: 'Initialized 13-Module Role Permission Matrix and secure credentials' }
    },
    {
      action: 'ROLE_CREATE',
      performedBy: 'superadmin',
      performedByRole: 'Super Admin',
      target: 'Admin, Sales Executive, Production Supervisor, Store Manager, Lead Field Engineer',
      details: { roleCount: createdRoles.length }
    }
  ]);
  console.log('Seeded initial RBAC Audit Logs');

  console.log('--- Employee & RBAC Seeding Completed Successfully! ---');
  process.exit(0);
}

seedEmployees().catch(err => {
  console.error('Seed failure:', err);
  process.exit(1);
});

