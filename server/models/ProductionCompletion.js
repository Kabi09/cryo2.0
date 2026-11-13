const mongoose = require('mongoose');

const productionCompletionSchema = new mongoose.Schema({
  completionNumber: {
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
  plannedQuantity: {
    type: Number,
    required: true
  },
  producedQuantity: {
    type: Number,
    required: true
  },
  acceptedDuringProduction: {
    type: Number,
    required: true
  },
  rejectedQuantity: {
    type: Number,
    default: 0
  },
  actualStartDate: {
    type: Date,
    required: true
  },
  actualCompletionDate: {
    type: Date,
    default: Date.now
  },
  productionSupervisor: {
    type: String,
    required: true
  },
  remainingMaterial: {
    type: String,
    default: 'Returned to store'
  },
  remarks: String,
  status: {
    type: String,
    enum: ['QA Pending', 'QA In Progress', 'QA Passed', 'QA Failed', 'Completed'],
    default: 'QA Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionCompletion', productionCompletionSchema);

