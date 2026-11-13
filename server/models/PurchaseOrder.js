const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxPercent: {
    type: Number,
    required: true,
    default: 18
  },
  lineTotal: {
    type: Number,
    required: true
  },
  receivedQuantity: {
    type: Number,
    default: 0
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  poDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  deliveryAddress: {
    type: String,
    default: 'Cryo Factory, Phase 2, Industrial Estate, Chennai - 600058'
  },
  items: [poItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  gstTotal: {
    type: Number,
    required: true,
    default: 0
  },
  freightCharges: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0
  },
  paymentTerms: {
    type: String,
    default: 'Net 30 Days'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Partially Received', 'Completed', 'Cancelled'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

