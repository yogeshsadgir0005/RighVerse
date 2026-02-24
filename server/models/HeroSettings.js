const mongoose = require('mongoose');

const heroSettingsSchema = new mongoose.Schema({
  lawyers: [{
    name: String,
    title: String,
    quote: String,
    desc: String,
    image: String // This stores the individual lawyer photo URL
  }]
}, { timestamps: true });

module.exports = mongoose.model('HeroSettings', heroSettingsSchema);