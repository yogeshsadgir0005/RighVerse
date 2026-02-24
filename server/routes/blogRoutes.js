const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
  getBlogById
} = require('../controllers/blogsController');

// Ensure uploads/blogs folder exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'blogs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    cb(null, `${Date.now()}-${safeName}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// GET all / POST with image upload
router.route('/')
  .get(getBlogs)
  .post(upload.single('image'), createBlog);

// GET one / DELETE / PUT with optional image upload
router.route('/:id')
  .get(getBlogById)
  .delete(deleteBlog)
  .put(upload.single('image'), updateBlog);

module.exports = router;