const HeroSettings = require('../models/HeroSettings');

exports.getHeroSettings = async (req, res) => {
  try {
    let settings = await HeroSettings.findOne();
    
    // If no settings exist, create default with 4 slots
    if (!settings) {
      settings = await HeroSettings.create({
        lawyers: [
            { name: "Lawyer 1", image: "" }, 
            { name: "Lawyer 2", image: "" },
            { name: "Lawyer 3", image: "" },
            { name: "Lawyer 4", image: "" }
        ]
      });
    }
    
    // Safety check: if DB has fewer than 4, return it (frontend handles padding) 
    // or update DB here if strictly needed.
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateHeroSettings = async (req, res) => {
  try {
    const lawyerData = JSON.parse(req.body.lawyers);
    
    // Map over the incoming array (which now has 4 items)
    const updates = { 
      lawyers: lawyerData.map((lawyer, i) => ({
        ...lawyer,
        // Check dynamically for lawyer0, lawyer1, lawyer2, lawyer3
        image: req.files[`lawyer${i}`] ? `/uploads/${req.files[`lawyer${i}`][0].filename}` : lawyer.image
      }))
    };

    const settings = await HeroSettings.findOneAndUpdate({}, updates, { new: true, upsert: true });
    res.json(settings);
  } catch (err) { res.status(400).json({ message: err.message }); }
};