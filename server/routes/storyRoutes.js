const express = require('express');
const router = express.Router();
const { getStories, createStory, deleteStory , supportStory } = require('../controllers/storyController');

router.get('/', getStories);
router.post('/', createStory);
router.put('/:id/support', supportStory);
router.delete('/:id', deleteStory);
module.exports = router;