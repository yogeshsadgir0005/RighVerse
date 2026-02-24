const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new news
// @route   POST /api/news
// @access  Private (Admin)
const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await News.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (newsItem) {
      res.status(200).json(newsItem);
    } else {
      res.status(404).json({ message: 'News item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNews, createNews, deleteNews , updateNews ,getNewsById };