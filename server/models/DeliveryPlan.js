const mongoose = require('mongoose');

const deliveryPlanSchema = new mongoose.Schema({
  deliveryNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  soNumber: {
    type: String,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  contactPerson: String,
  mobileNumber: String,
  deliveryAddress: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  finishedGood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedGood'
  },
  serialNumber: String,
  orderedQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  alreadyDeliveredQuantity: {
    type: Number,
    default: 0
  },
  pendingQuantity: {
    type: Number,
    default: 1
  },
  plannedDeliveryQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  deliveryMethod: {
    type: String,
    enum: ['Company Vehicle', 'Courier / Transport'],
    default: 'Company Vehicle'
  },
  installationRequired: {
    type: Boolean,
    default: true
  },
  specialInstructions: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Planned', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Planned'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryPlan', deliveryPlanSchema);

