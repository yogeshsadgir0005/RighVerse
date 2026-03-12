const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, default: "Untitled Experience" },
  redactedBody: { type: String, required: true }, 
  originalBody: { type: String, select: false }, 
  insight: { type: String },
  category: { type: String, default: "General" },
  location: { type: String, default: "India" },
  isAnonymous: { type: Boolean, default: true },
  consentGiven: { type: Boolean, required: true, default: false },
  supports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);