const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({
  installationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  deliveryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan'
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
  installationAddress: {
    type: String,
    required: true
  },
  contactPerson: String,
  mobileNumber: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  installationQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  assignedTechnician: {
    type: String,
    required: true
  },
  plannedInstallationDate: {
    type: Date,
    required: true
  },
  requiredTools: {
    type: String,
    default: 'Multimeter, Torque Wrench Set, Fluke Thermal Camera, Software Dongle'
  },
  installationInstructions: String,
  customerRequirements: String,
  remarks: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Failed / Rework', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Installation', installationSchema);

