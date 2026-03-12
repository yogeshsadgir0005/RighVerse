const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String },
  isHighlight: { type: Boolean, default: false },
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);