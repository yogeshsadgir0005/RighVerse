const ActionGuide = require('../models/ActionGuide');

exports.getGuides = async (req, res) => {
  try {
    const guides = await ActionGuide.find().sort({ createdAt: -1 });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const { title, steps } = req.body;
    if (!title || !steps || steps.length === 0) {
      return res.status(400).json({ message: "Title and at least one step are required." });
    }
    
    const newGuide = new ActionGuide({ title, steps });
    await newGuide.save();
    res.status(201).json(newGuide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    await ActionGuide.findByIdAndDelete(req.params.id);
    res.json({ message: "Guide deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};