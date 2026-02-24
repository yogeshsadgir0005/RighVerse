// backend/models/DailyLaw.js
const mongoose = require('mongoose');

const dailyLawSchema = new mongoose.Schema({
  title: { type: String, required: true },
  highlights: { type: String },
  summary: { type: String, required: true },
  whyItMatters: { type: String },
  sourceLink: { type: String },
  imageUrl: { type: String }, // <--- New field for DALL-E image
  date: { type: Date, default: Date.now }, // Timestamp of creation
  fetchDateString: { type: String, unique: true } // "2024-01-20" to prevent duplicates for same day
});

module.exports = mongoose.model('DailyLaw', dailyLawSchema);