const mongoose = require('mongoose');

const vehicleCourierSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  entityType: {
    type: String,
    enum: ['Company Vehicle', 'Courier / Transport'],
    required: true
  },
  // Company Vehicle Fields
  vehicleNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['Van', 'Truck', 'Car', 'Heavy Lorry', 'Other'],
    default: 'Van'
  },
  driverName: String,
  driverMobile: String,
  licenseNumber: String,
  vehicleCapacity: String, // e.g., '2.5 Tons', '5 Machines'
  insuranceExpiry: Date,

  // Courier / Transport Fields
  courierPartner: String, // e.g. BlueDart, VRL Logistics, ABC Transport
  trackingNumber: String,
  serviceType: {
    type: String,
    enum: ['Express Cargo', 'Standard Surface', 'Air Freight', 'Dedicated Container'],
    default: 'Standard Surface'
  },
  contactPerson: String,
  contactMobile: String,

  // Assignment & Status
  assignedDelivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan'
  },
  assignedDeliveryNumber: String,
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'In Transit', 'Maintenance', 'Inactive'],
    default: 'Available'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('VehicleCourier', vehicleCourierSchema);

