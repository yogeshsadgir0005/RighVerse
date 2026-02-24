const HeroSettings = require('../models/HeroSettings');

exports.getHeroSettings = async (req, res) => {
  try {
    let settings = await HeroSettings.findOne();
    if (!settings) {
      settings = await HeroSettings.create({
     
        lawyers: [{ name: "Lawyer 1", image: "/uploads/l1.jpg" }, { name: "Lawyer 2", image: "/uploads/l2.jpg" }]
      });
    }
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateHeroSettings = async (req, res) => {
  try {
    // Parse the lawyer text data (sent as a JSON string because FormData doesn't support nested objects)
    const lawyerData = JSON.parse(req.body.lawyers);
    const updates = { 
    
      lawyers: lawyerData.map((lawyer, i) => ({
        ...lawyer,
        image: req.files[`lawyer${i}`] ? `/uploads/${req.files[`lawyer${i}`][0].filename}` : lawyer.image
      }))
    };

    const settings = await HeroSettings.findOneAndUpdate({}, updates, { new: true, upsert: true });
    res.json(settings);
  } catch (err) { res.status(400).json({ message: err.message }); }
};