const mongoose = require('mongoose');

const reworkOrderSchema = new mongoose.Schema({
  reworkNumber: {
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
  qaReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionQA'
  },
  qaNumber: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  serialNumber: String,
  reworkQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  defectDescription: {
    type: String,
    required: true
  },
  failureReason: String,
  reworkType: {
    type: String,
    enum: ['Repair', 'Rebuild', 'Component Replacement'],
    default: 'Repair'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'High'
  },
  assignedTechnician: {
    type: String,
    required: true
  },
  problemIdentified: String,
  repairAction: String,
  replacementMaterials: String,
  technicianRemarks: String,
  reworkStartDate: {
    type: Date,
    default: Date.now
  },
  reworkCompletionDate: Date,
  retestRequired: {
    type: Boolean,
    default: true
  },
  retestStatus: {
    type: String,
    enum: ['Pending', 'Passed', 'Failed'],
    default: 'Pending'
  },
  reQAReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionQA'
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Repair Completed', 'Re-QA Pending', 'Passed', 'Scrapped'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReworkOrder', reworkOrderSchema);

