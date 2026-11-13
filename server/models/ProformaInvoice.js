const mongoose = require('mongoose');

const proformaInvoiceSchema = new mongoose.Schema({
  piNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true
  },
  piDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String,
    quantity: Number,
    unit: String,
    unitPrice: Number,
    gstPercent: Number,
    amount: Number
  }],
  grandTotal: {
    type: Number,
    required: true
  },
  advancePercentage: {
    type: Number,
    default: 50
  },
  advanceAmount: {
    type: Number,
    required: true
  },
  balanceAmount: {
    type: Number,
    required: true
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  bankDetails: {
    type: String,
    default: 'HDFC Bank, Anna Nagar Branch, A/C: 50200012345678, IFSC: HDFC0000240'
  },
  paymentTerms: {
    type: String,
    default: '50% Advance via Bank/RTGS, Balance Before Dispatch'
  },
  deliveryTerms: {
    type: String,
    default: '4 Weeks from receipt of Advance & verified PO'
  },
  validity: {
    type: String,
    default: '30 Days from date of issue'
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Cancelled'],
    default: 'Sent'
  }
}, { timestamps: true });

module.exports = mongoose.model('ProformaInvoice', proformaInvoiceSchema);

