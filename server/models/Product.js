const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Industrial Machinery'
  },
  unit: {
    type: String,
    default: 'Nos'
  },
  standardPrice: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  modelNumber: {
    type: String,
    default: ''
  },
  specifications: {
    type: String,
    default: ''
  },
  warranty: {
    type: String,
    default: '12 Months'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

