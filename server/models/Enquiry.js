const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  enquiryDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customerType: {
    type: String,
    enum: ['New', 'Existing'],
    default: 'New'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
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
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productDescription: {
    type: String,
    default: ''
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  targetPrice: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unit: {
    type: String,
    default: 'Nos'
  },
  requiredDeliveryDate: {
    type: Date
  },
  additionalRequirements: {
    type: String,
    default: ''
  },
  enquirySource: {
    type: String,
    enum: ['Website', 'Phone', 'Email', 'Referral', 'Direct'],
    default: 'Website'
  },
  assignedSalesPerson: {
    type: String,
    default: 'Sales Executive'
  },
  remarks: {
    type: String,
    default: ''
  },
  lostReason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Follow-up', 'Converted to Lead', 'Qualified', 'Lost', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);

