const mongoose = require('mongoose');

// Default permission schema for any module
const modulePermissionSchema = new mongoose.Schema({
  access: { type: Boolean, default: false },
  view: { type: Boolean, default: false },
  add: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  approve: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'General'
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  // Permission Matrix for 13 ERP Modules
  permissions: {
    Dashboard: { type: modulePermissionSchema, default: () => ({ access: true, view: true }) },
    Marketing: { type: modulePermissionSchema, default: () => ({}) },
    Sales: { type: modulePermissionSchema, default: () => ({}) },
    Purchase: { type: modulePermissionSchema, default: () => ({}) },
    Production: { type: modulePermissionSchema, default: () => ({}) },
    'Supply Chain': { type: modulePermissionSchema, default: () => ({}) },
    Inventory: { type: modulePermissionSchema, default: () => ({}) },
    'Quality Assurance': { type: modulePermissionSchema, default: () => ({}) },
    Logistics: { type: modulePermissionSchema, default: () => ({}) },
    Installation: { type: modulePermissionSchema, default: () => ({}) },
    'Employee Management': { type: modulePermissionSchema, default: () => ({}) },
    Reports: { type: modulePermissionSchema, default: () => ({}) },
    Settings: { type: modulePermissionSchema, default: () => ({}) }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);

