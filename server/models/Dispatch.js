const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  dispatchNumber: {
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
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  soNumber: String,
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
  finishedGood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedGood'
  },
  serialNumber: {
    type: String,
    required: true
  },
  plannedQuantity: {
    type: Number,
    required: true
  },
  actualDispatchQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  warehouseLocation: {
    type: String,
    default: 'FG Central Warehouse - Bay 1'
  },
  packingDetails: {
    type: String,
    default: 'Heavy duty wooden crate, sealed with shrink wrap, silica desiccant included'
  },
  dispatchDateTime: {
    type: Date,
    default: Date.now
  },
  deliveryMethod: {
    type: String,
    enum: ['Company Vehicle', 'Courier / Transport'],
    required: true
  },
  vehicleCourier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleCourier'
  },
  // Auto-filled vehicle or courier metadata
  vehicleNumber: String,
  driverName: String,
  driverMobile: String,
  courierPartner: String,
  trackingNumber: String,
  dispatchedBy: {
    type: String,
    required: true
  },
  checkedBy: {
    type: String,
    required: true
  },
  packagePhotos: [String],
  deliveryChallan: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Dispatched', 'Delivered', 'Cancelled'],
    default: 'Dispatched'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispatch', dispatchSchema);

