const mongoose = require('mongoose');

const importDataSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  sheetName: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  recordsImported: {
    type: Number,
    default: 0
  },
  errors: [{
    row: Number,
    field: String,
    message: String,
    value: String
  }],
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ImportData', importDataSchema);