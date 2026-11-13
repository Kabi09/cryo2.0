const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityName: {
    type: String,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  }
});

const productionScheduleSchema = new mongoose.Schema({
  scheduleNumber: {
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  plannedQuantity: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  workingDays: {
    type: Number,
    default: 10
  },
  supervisor: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Rotational'],
    default: 'Morning'
  },
  workInstructions: String,
  activities: [activitySchema],
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Delayed'],
    default: 'Planned'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionSchedule', productionScheduleSchema);

