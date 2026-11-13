const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  billingAddress: {
    type: String,
    default: ''
  },
  shippingAddress: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'Chennai'
  },
  state: {
    type: String,
    default: 'Tamil Nadu'
  },
  pincode: {
    type: String,
    default: ''
  },
  customerType: {
    type: String,
    enum: ['Company', 'Individual'],
    default: 'Company'
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
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);

