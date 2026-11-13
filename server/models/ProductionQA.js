const mongoose = require('mongoose');

const testParameterSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  expected: {
    type: String,
    required: true
  },
  actual: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  }
});

const productionQASchema = new mongoose.Schema({
  qaNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  workOrderNumber: String,
  completion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionCompletion'
  },
  completionNumber: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  batchSerialNumber: String,
  testedQuantity: {
    type: Number,
    required: true
  },
  passedQuantity: {
    type: Number,
    required: true
  },
  failedQuantity: {
    type: Number,
    default: 0
  },
  inspectorName: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  testParameters: [testParameterSchema],
  overallResult: {
    type: String,
    enum: ['Pass', 'Fail', 'Partial Pass'],
    required: true
  },
  decision: {
    type: String,
    enum: ['Finished Goods', 'Rework', 'Reject / Scrap'],
    required: true
  },
  defectDescription: String,
  failureReason: String,
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductionQA', productionQASchema);

