const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getHeroSettings, updateHeroSettings } = require('../controllers/heroController');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', getHeroSettings);

// Handle up to 3 uploads (1 bgImage, 2 lawyer photos)
router.put('/', upload.fields([
  { name: 'bgImage', maxCount: 1 },
  { name: 'lawyer0', maxCount: 1 },
  { name: 'lawyer1', maxCount: 1 }
]), updateHeroSettings);

module.exports = router;