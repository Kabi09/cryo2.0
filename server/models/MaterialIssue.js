const mongoose = require('mongoose');

const materialIssueItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  availableStockAtTime: {
    type: Number,
    required: true
  },
  requiredQuantity: {
    type: Number,
    default: 0
  },
  issueQuantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    default: 'DEFAULT'
  }
});

const materialIssueSchema = new mongoose.Schema({
  issueNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  workOrder: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Fabrication', 'Machining', 'Assembly', 'Finishing', 'Packaging', 'R&D'],
    default: 'Fabrication'
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  requestedBy: {
    type: String,
    required: true,
    default: 'Production Supervisor'
  },
  issuedBy: {
    type: String,
    required: true,
    default: 'Store Manager'
  },
  items: [materialIssueItemSchema],
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Cancelled'],
    default: 'Issued'
  }
}, { timestamps: true });

module.exports = mongoose.model('MaterialIssue', materialIssueSchema);

