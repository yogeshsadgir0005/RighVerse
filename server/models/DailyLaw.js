
const mongoose = require('mongoose');

const dailyLawSchema = new mongoose.Schema({
  title: { type: String, required: true },
  highlights: { type: String },
  summary: { type: String, required: true },
  whyItMatters: { type: String },
  sourceLink: { type: String },
  imageUrl: { type: String }, 
  date: { type: Date, default: Date.now },  
  fetchDateString: { type: String, unique: true } 
});

module.exports = mongoose.model('DailyLaw', dailyLawSchema);