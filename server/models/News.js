const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String }, // Stores image URL
  isHighlight: { type: Boolean, default: false }, // Determines if it's the big left card
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);