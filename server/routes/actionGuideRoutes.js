const express = require('express');
const router = express.Router();
const { getGuides, createGuide, deleteGuide } = require('../controllers/actionGuideController');

router.get('/', getGuides);
router.post('/', createGuide);
router.delete('/:id', deleteGuide);

module.exports = router;