const mongoose = require('mongoose');

const productionUpdateSchema = new mongoose.Schema({
  updateNumber: {
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
  updateType: {
    type: String,
    enum: ['Daily', 'Weekly'],
    default: 'Daily'
  },
  fromDate: {
    type: Date,
    default: Date.now
  },
  toDate: {
    type: Date,
    default: Date.now
  },
  supervisorName: {
    type: String,
    required: true
  },
  plannedQuantity: {
    type: Number,
    required: true
  },
  previouslyCompletedQuantity: {
    type: Number,
    default: 0
  },
  completedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  totalCompletedQuantity: {
    type: Number,
    required: true
  },
  pendingQuantity: {
    type: Number,
    required: true
  },
  rejectedQuantity: {
    type: Number,
    default: 0
  },
  wastageQuantity: {
    type: Number,
    default: 0
  },
  workCompletedDescription: {
    type: String,
    required: true
  },
  machineStatus: {
    type: String,
    default: 'Operational'
  },
  problemsDelays: {
    type: String,
    default: 'None'
  },
  reasonForDelay: String,
  nextWorkPlan: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Updated', 'Verified', 'Flagged'],
    default: 'Updated'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionUpdate', productionUpdateSchema);

