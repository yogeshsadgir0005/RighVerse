const express = require('express');
const router = express.Router();
const { getStories, createStory, deleteStory } = require('../controllers/storyController');

router.get('/', getStories);
router.post('/', createStory);
router.delete('/:id', deleteStory);

module.exports = router;