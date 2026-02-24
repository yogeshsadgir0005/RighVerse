const express = require('express');
const router = express.Router();
const {
  getLaws,
  suggestLaws,
  getLawById,
  createLaw,
  updateLaw,
  deleteLaw,
  adminListLaws,
  togglePublish,
  adminGetLaw,
} = require('../controllers/lawController');

// Public Routes
router.get('/', getLaws);
router.get('/suggest', suggestLaws);

// Admin Routes (put BEFORE dynamic "/:id")
router.get('/admin/list', adminListLaws);
router.get('/admin/:id', adminGetLaw); // optional but useful
router.post('/', createLaw);
router.put('/:id', updateLaw);
router.delete('/:id', deleteLaw);
router.patch('/:id/publish', togglePublish);

// Public detail route (slug or ObjectId)
router.get('/:id', getLawById);

module.exports = router;