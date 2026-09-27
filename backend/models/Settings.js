const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  label: {
    type: String
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json', 'image'],
    default: 'string'
  },
  group: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

settingsSchema.index({ key: 1 });
settingsSchema.index({ group: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
