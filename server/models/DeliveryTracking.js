const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
  trackingNumber: {
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
  customerName: String,
  deliveryMethod: String,
  currentStatus: {
    type: String,
    enum: [
      'Planned',
      'Dispatched',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Delayed',
      'Delivery Failed',
      'Returned'
    ],
    default: 'In Transit'
  },
  currentLocation: {
    type: String,
    required: true
  },
  updateDateTime: {
    type: Date,
    default: Date.now
  },
  expectedArrival: {
    type: Date,
    required: true
  },
  delayReason: String,
  remarks: String,
  trackingProof: String,
  updatedBy: {
    type: String,
    default: 'Logistics Desk'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);

