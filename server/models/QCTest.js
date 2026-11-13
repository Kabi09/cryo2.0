const mongoose = require('mongoose');

const qcParameterSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  standard: {
    type: String,
    required: true
  },
  actual: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  }
});

const qcTestSchema = new mongoose.Schema({
  qcNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  grn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  receivedQuantity: {
    type: Number,
    required: true
  },
  testedQuantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  acceptedQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  rejectedQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  availableRejectedQuantity: {
    type: Number,
    default: 0
  },
  testDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  inspectorName: {
    type: String,
    required: true,
    default: 'Quality Inspector'
  },
  parameters: [qcParameterSchema],
  overallResult: {
    type: String,
    enum: ['Pass', 'Partial Pass', 'Reject'],
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Completed'
  }
}, { timestamps: true });

module.exports = mongoose.model('QCTest', qcTestSchema);

