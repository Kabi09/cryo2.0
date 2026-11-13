const mongoose = require('mongoose');

const supplierMaterialLinkSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  supplierMaterialCode: {
    type: String,
    trim: true,
    default: ''
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderQty: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  leadTimeDays: {
    type: Number,
    required: true,
    min: 0,
    default: 3
  },
  preferredSupplier: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

supplierMaterialLinkSchema.index({ supplier: 1, material: 1 }, { unique: true });

module.exports = mongoose.model('SupplierMaterialLink', supplierMaterialLinkSchema);

