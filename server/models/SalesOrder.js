const mongoose = require('mongoose');

const salesOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    default: ''
  },
  description: String,
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
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  gstPercent: {
    type: Number,
    default: 18
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const salesOrderSchema = new mongoose.Schema({
  soNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  soDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerPOReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerPO'
  },
  quotationReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  piReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProformaInvoice'
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  items: [salesOrderItemSchema],
  orderAmount: {
    type: Number,
    required: true
  },
  advanceReceived: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    default: 'Net 30 Days'
  },
  shippingAddress: {
    type: String,
    default: ''
  },
  deliveryInstructions: {
    type: String,
    default: 'Handle with care. Unload at plant bay 1.'
  },
  productionRemarks: {
    type: String,
    default: 'Fabrication and assembly to begin upon advance verification.'
  },
  productionStatus: {
    type: String,
    enum: ['Not Started', 'Sent to Production', 'In Fabrication', 'In Assembly', 'Completed'],
    default: 'Not Started'
  },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'In Production', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);

