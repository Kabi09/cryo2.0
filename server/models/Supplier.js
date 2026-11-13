const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  supplierName: {
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
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: 'Tamil Nadu'
  },
  pincode: {
    type: String,
    trim: true,
    default: ''
  },
  paymentTerms: {
    type: String,
    enum: ['Immediate', 'Net 15 Days', 'Net 30 Days', 'Net 45 Days', 'Net 60 Days', 'Advance 100%'],
    default: 'Net 30 Days'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);

