const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  salesOrderNumber: String,
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  orderQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  productionQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  productionManager: {
    type: String,
    required: true
  },
  productionLocation: {
    type: String,
    default: 'Main Assembly Bay 1'
  },
  plannedStartDate: {
    type: Date,
    required: true
  },
  expectedCompletionDate: {
    type: Date,
    required: true
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM'
  },
  status: {
    type: String,
    enum: ['Planned', 'Waiting for Materials', 'Ready to Start', 'Running', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);

