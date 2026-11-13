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
    enum: ['Advance', 'Partial', 'Final'],
    default: 'Advance'
  },
  amountReceived: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'UPI', 'Cheque', 'Cash'],
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
    enum: ['Received', 'Verified'],
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

