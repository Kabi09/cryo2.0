const mongoose = require('mongoose');

const customerPOSchema = new mongoose.Schema({
  internalPOId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  customerPONumber: {
    type: String,
    required: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  piReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProformaInvoice'
  },
  quotationReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  customerPODate: {
    type: Date,
    required: true
  },
  receivedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  poAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  paymentTerms: {
    type: String,
    default: 'As per accepted PI'
  },
  poDocument: {
    type: String,
    default: 'Customer_PO_Signed.pdf'
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Received', 'Verified', 'Rejected'],
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

module.exports = mongoose.model('CustomerPO', customerPOSchema);

