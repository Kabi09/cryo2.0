const mongoose = require('mongoose');

const bomMaterialSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialCode: {
    type: String,
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  quantityPerUnit: {
    type: Number,
    required: true,
    min: 0.001
  },
  unit: {
    type: String,
    required: true
  },
  wastagePercent: {
    type: Number,
    default: 0
  }
});

const bomSchema = new mongoose.Schema({
  bomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  version: {
    type: String,
    default: 'V1',
    trim: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  materials: [bomMaterialSchema],
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Inactive', 'Archived'],
    default: 'Active'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('BOM', bomSchema);

