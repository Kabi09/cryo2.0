const mongoose = require('mongoose');

const supplierReturnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  grn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN',
    required: true
  },
  qcReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QCTest',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  rejectedQuantityAvailable: {
    type: Number,
    required: true
  },
  returnQuantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true,
    default: 'Kg'
  },
  returnDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    required: true,
    enum: ['Failed QC Specifications', 'Damaged in Transit', 'Incorrect Dimension / Grade', 'Expired / Degraded', 'Excess Dispatch'],
    default: 'Failed QC Specifications'
  },
  debitNoteNumber: {
    type: String,
    trim: true,
    default: ''
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Returned'],
    default: 'Returned'
  }
}, { timestamps: true });

module.exports = mongoose.model('SupplierReturn', supplierReturnSchema);

