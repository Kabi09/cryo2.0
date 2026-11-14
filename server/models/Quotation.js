const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    default: 'Nos'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  gstPercent: {
    type: Number,
    default: 18
  },
  amount: {
    type: Number,
    required: true
  }
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  version: {
    type: String,
    default: 'V1'
  },
  quotationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  leadReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  validUntil: {
    type: Date,
    required: true
  },
  items: [quotationItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discountTotal: {
    type: Number,
    default: 0
  },
  gstTotal: {
    type: Number,
    required: true,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryTerms: {
    type: String,
    default: 'Ex-Factory, 4 to 6 weeks from PO confirmation'
  },
  paymentTerms: {
    type: String,
    default: '50% Advance with PO, 50% Before Dispatch'
  },
  warranty: {
    type: String,
    default: '12 Months comprehensive manufacturer warranty'
  },
  notes: {
    type: String,
    default: ''
  },
  rejectReason: {
    type: String,
    default: ''
  },
  previousVersion: {
    type: String,
    default: ''
  },
  previousGrandTotal: {
    type: Number,
    default: 0
  },
  revisionReason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Sent'
  }
}, { timestamps: true });

quotationSchema.index({ quotationNumber: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);

