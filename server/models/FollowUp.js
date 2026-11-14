const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  followUpNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  companyName: {
    type: String,
    default: ''
  },
  enquiryReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  relatedLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  relatedQuotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  quotationReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  contactDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  contactMethod: {
    type: String,
    default: 'Phone Call'
  },
  discussionNotes: {
    type: String,
    required: true
  },
  customerResponse: {
    type: String,
    default: 'Interested'
  },
  nextFollowUpDate: {
    type: Date,
    required: true
  },
  nextAction: {
    type: String,
    default: 'Follow-up Call'
  },
  assignedEmployee: {
    type: String,
    default: 'Sales Executive'
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);

