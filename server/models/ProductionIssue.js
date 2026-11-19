const mongoose = require('mongoose');

const issuedItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialCode: String,
  materialName: {
    type: String,
    required: true
  },
  requestedQty: {
    type: Number,
    required: true
  },
  approvedQty: {
    type: Number,
    required: true
  },
  availableStock: {
    type: Number,
    required: true
  },
  issuedQty: {
    type: Number,
    required: true,
    min: 0.001
  },
  batchNumber: String,
  unit: {
    type: String,
    required: true
  },
  remarks: String
});

const productionIssueSchema = new mongoose.Schema({
  issueNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  materialRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequest',
    required: true
  },
  requestNumber: String,
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  workOrderNumber: String,
  storeLocation: {
    type: String,
    default: 'Central RM Store - Rack A'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: String,
    required: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  items: [issuedItemSchema],
  status: {
    type: String,
    enum: ['Issued', 'Partial Issue', 'Partially Issued', 'Fully Issued'],
    default: 'Issued'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionIssue', productionIssueSchema);

