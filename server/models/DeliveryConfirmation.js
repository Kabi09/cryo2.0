const mongoose = require('mongoose');

const deliveryConfirmationSchema = new mongoose.Schema({
  confirmationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  deliveryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan',
    required: true
  },
  deliveryNumber: {
    type: String,
    required: true
  },
  dispatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispatch'
  },
  dispatchNumber: String,
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
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  dispatchedQuantity: {
    type: Number,
    required: true
  },
  receivedQuantity: {
    type: Number,
    required: true
  },
  pendingQuantity: {
    type: Number,
    default: 0
  },
  deliveryDateTime: {
    type: Date,
    default: Date.now
  },
  receivedBy: {
    type: String,
    required: true
  },
  customerMobile: {
    type: String,
    required: true
  },
  customerSignature: {
    type: String,
    default: 'Signed electronically on delivery tablet'
  },
  productCondition: {
    type: String,
    enum: ['Good', 'Damaged', 'Partially Damaged'],
    default: 'Good'
  },
  damageRemarks: String,
  podDocument: String,
  installationRequired: {
    type: Boolean,
    default: true
  },
  remarks: String,
  status: {
    type: String,
    enum: ['Delivered', 'Partial Delivery', 'Rejected'],
    default: 'Delivered'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryConfirmation', deliveryConfirmationSchema);

