const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  materialName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Metals', 'Plastics', 'Rubber', 'Chemicals', 'Packaging', 'Fasteners', 'Electronics', 'Other'],
    default: 'Metals'
  },
  unit: {
    type: String,
    required: true,
    enum: ['Kg', 'Meter', 'Litre', 'Nos', 'Sheet', 'Roll', 'Box'],
    default: 'Kg'
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 150
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  storageLocation: {
    type: String,
    trim: true,
    default: 'Main Warehouse'
  },
  hsnCode: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);

