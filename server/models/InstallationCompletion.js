const mongoose = require('mongoose');

const installationCompletionSchema = new mongoose.Schema({
  completionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  installation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installation',
    required: true
  },
  installationNumber: {
    type: String,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  technician: {
    type: String,
    required: true
  },
  installationDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  // 7 Standard Mandatory Installation Checkpoints
  checklist: {
    productFixedProperly: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    electricalConnection: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    powerSupplyTest: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    sensorConnection: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    temperatureTest: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    softwareConfiguration: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    overallWorkingCondition: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    }
  },
  // Itemized Functional Test Observations
  testingDetails: [{
    parameter: String,
    expectedValue: String,
    actualValue: String,
    result: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    defectDescription: String,
    correctiveAction: String
  }],
  // Customer Sign-Off and Documentation
  customerConfirmation: {
    customerName: {
      type: String,
      required: true
    },
    customerFeedback: {
      type: String,
      default: 'Machine operational, staff trained, verified smooth running condition.'
    },
    customerSignature: {
      type: String,
      default: 'Confirmed and accepted on site'
    },
    technicianSignature: {
      type: String,
      default: 'Verified by Lead Service Technician'
    },
    beforePhoto: String,
    afterPhoto: String,
    installationReport: String
  },
  overallResult: {
    type: String,
    enum: ['Pass', 'Fail'],
    default: 'Pass'
  },
  issueReported: {
    type: Boolean,
    default: false
  },
  issueResolutionDetails: String,
  status: {
    type: String,
    enum: ['Completed', 'Failed - Retest Required', 'In Progress'],
    default: 'Completed'
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('InstallationCompletion', installationCompletionSchema);

