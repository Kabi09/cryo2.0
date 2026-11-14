const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadNumber: {
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
  enquiryReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  productName: {
    type: String,
    default: ''
  },
  interestedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  expectedQuantity: {
    type: Number,
    default: 1
  },
  expectedOrderValue: {
    type: Number,
    default: 0
  },
  expectedClosingDate: {
    type: Date
  },
  leadOwner: {
    type: String,
    default: 'Senior Sales Manager'
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Qualified', 'Won', 'Lost'],
    default: 'New'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

