const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  orderedQty: {
    type: Number,
    required: true
  },
  previouslyReceivedQty: {
    type: Number,
    default: 0
  },
  currentReceivedQty: {
    type: Number,
    required: true,
    min: 0.01
  },
  balanceQty: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date
  }
});

const grnSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  receivedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  deliveryChallanNo: {
    type: String,
    trim: true,
    default: ''
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: ''
  },
  receivedBy: {
    type: String,
    required: true,
    default: 'Store Officer'
  },
  items: [grnItemSchema],
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'QC Pending', 'Accepted', 'Completed'],
    default: 'QC Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('GRN', grnSchema);

