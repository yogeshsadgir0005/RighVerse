const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, default: "Untitled Experience" },
  redactedBody: { type: String, required: true }, // The safe, AI-anonymized version
  originalBody: { type: String, select: false }, // Hidden by default for safety, kept for legal reference
  insight: { type: String }, // The AI-generated legal insight
  category: { type: String, default: "General" },
  location: { type: String, default: "India" },
  isAnonymous: { type: Boolean, default: true },
  consentGiven: { type: Boolean, required: true, default: false }, // Track that they agreed to the AI terms
  supports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);