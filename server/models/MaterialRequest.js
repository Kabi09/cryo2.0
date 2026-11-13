const mongoose = require('mongoose');

const requestItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialCode: String,
  materialName: String,
  requiredQty: {
    type: Number,
    required: true
  },
  availableStock: {
    type: Number,
    default: 0
  },
  alreadyIssuedQty: {
    type: Number,
    default: 0
  },
  requestedQty: {
    type: Number,
    required: true
  },
  remainingQty: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Partially Approved', 'Issued', 'Rejected'],
    default: 'Pending'
  }
});

const materialRequestSchema = new mongoose.Schema({
  requestNumber: {
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
  requestedDate: {
    type: Date,
    default: Date.now
  },
  requiredDate: {
    type: Date,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'Production Assembly'
  },
  items: [requestItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Partially Approved', 'Rejected', 'Fully Issued'],
    default: 'Pending'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);

