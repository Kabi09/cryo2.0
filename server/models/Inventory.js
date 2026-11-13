const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
    unique: true
  },
  openingStock: {
    type: Number,
    default: 0
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  totalIssued: {
    type: Number,
    default: 0
  },
  totalReturned: {
    type: Number,
    default: 0
  },
  adjustments: {
    type: Number,
    default: 0
  },
  availableStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reservedStock: {
    type: Number,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'Out of Stock'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);

