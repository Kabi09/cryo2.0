const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ['Opening Stock', 'QC Inward Receipt', 'Production Issue', 'Supplier Return', 'Audit Adjustment'],
    required: true
  },
  referenceDoc: {
    type: String,
    required: true
  },
  qtyIn: {
    type: Number,
    default: 0
  },
  qtyOut: {
    type: Number,
    default: 0
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  loggedBy: {
    type: String,
    default: 'System'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);

