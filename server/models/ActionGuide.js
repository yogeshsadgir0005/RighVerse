const mongoose = require('mongoose');

const actionGuideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [{ type: String, required: true }], // Dynamic array of strings
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionGuide', actionGuideSchema);