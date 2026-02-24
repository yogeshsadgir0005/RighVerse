const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String },
  content: { type: String }, // Full blog content (HTML or Markdown)
}, {
  timestamps: true,
});

module.exports = mongoose.model('Blog', blogSchema);