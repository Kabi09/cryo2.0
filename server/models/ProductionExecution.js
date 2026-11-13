const mongoose = require('mongoose');

const productionExecutionSchema = new mongoose.Schema({
  executionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  workOrderNumber: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  plannedQty: {
    type: Number,
    required: true
  },
  materialsIssued: {
    type: String,
    default: 'Fully Issued'
  },
  startDateTime: {
    type: Date,
    default: Date.now
  },
  supervisor: {
    type: String,
    required: true
  },
  machineWorkstation: {
    type: String,
    default: 'CNC Lathe Line 1'
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    default: 'Morning'
  },
  operatorName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Planned', 'Waiting for Materials', 'Ready to Start', 'Running', 'Paused', 'Resumed', 'On Hold', 'Completed'],
    default: 'Running'
  },
  initialRemarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionExecution', productionExecutionSchema);

