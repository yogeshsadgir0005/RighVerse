const express = require('express');
const router = express.Router();
const { getNews, createNews, deleteNews, updateNews, getNewsById } = require('../controllers/newsController');

router.route('/').get(getNews).post(createNews);

// Add .get(getNewsById) here
router.route('/:id')
  .get(getNewsById)
  .delete(deleteNews)
  .put(updateNews);

module.exports = router;