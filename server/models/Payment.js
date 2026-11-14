const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
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
  piReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProformaInvoice',
    required: true
  },
  salesOrderReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentType: {
    type: String,
    default: 'Advance'
  },
  amountReceived: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentMethod: {
    type: String,
    default: 'Bank Transfer'
  },
  transactionReference: {
    type: String,
    required: true,
    trim: true
  },
  paymentProof: {
    type: String,
    default: 'Bank_Receipt.pdf'
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Received'
  },
  verifiedBy: {
    type: String,
    default: ''
  },
  verifiedDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

