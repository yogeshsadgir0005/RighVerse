const express = require('express');
const router = express.Router();
const { 
  getLatestLaw, 
  getWeeklyLaws, 
  analyzeStory, 
  chatWithAI, 
  getLawById // <--- Import this
} = require('../controllers/aiController');

router.get('/law-of-day', getLatestLaw);
router.get('/weekly-updates', getWeeklyLaws);
router.get('/law/:id', getLawById); // <--- Add this route
router.post('/analyze-story', analyzeStory);
router.post('/chat', chatWithAI);

module.exports = router;