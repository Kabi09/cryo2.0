const mongoose = require('mongoose');

const finishedGoodSchema = new mongoose.Schema({
  fgNumber: {
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
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  salesOrderNumber: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  qaApprovalReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionQA'
  },
  qaNumber: String,
  approvedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  warehouseLocation: {
    type: String,
    default: 'FG Warehouse - Section A1'
  },
  storageDate: {
    type: Date,
    default: Date.now
  },
  productCondition: {
    type: String,
    default: 'New / QA Passed'
  },
  stockStatus: {
    type: String,
    enum: ['Available', 'Reserved for Dispatch', 'Dispatched'],
    default: 'Available'
  },
  warrantyStartDate: Date,
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('FinishedGood', finishedGoodSchema);

