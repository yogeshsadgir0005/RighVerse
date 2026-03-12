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

router.get('/', getLaws);
router.get('/suggest', suggestLaws);
router.get('/admin/list', adminListLaws);
router.get('/admin/:id', adminGetLaw); 
router.post('/', createLaw);
router.put('/:id', updateLaw);
router.delete('/:id', deleteLaw);
router.patch('/:id/publish', togglePublish);
router.get('/:id', getLawById);

module.exports = router;