const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildImageUrl = (req, file) => {
  if (!file) return null;
  // file.path may contain backslashes on Windows, normalize to URL path
  const relativePath = file.path.split(path.sep).join('/');
  const uploadsIndex = relativePath.indexOf('uploads/');
  const publicPath = uploadsIndex >= 0 ? relativePath.substring(uploadsIndex) : relativePath;
  return `${req.protocol}://${req.get('host')}/${publicPath}`;
};

const createBlog = async (req, res) => {
  try {
    const { title, author, date, summary, content } = req.body;

    const imageUrl = req.file ? buildImageUrl(req, req.file) : '';

    const blog = await Blog.create({
      title,
      author,
      date,
      summary,
      content,
      image: imageUrl,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete associated uploaded file (optional cleanup)
    if (blog.image) {
      try {
        const imageUrl = new URL(blog.image);
        const filePath = path.join(__dirname, '..', imageUrl.pathname); // pathname starts with /uploads/...
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // ignore URL parsing/file deletion errors
      }
    }

    await Blog.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { title, author, date, summary, content } = req.body;

    let imageUrl = existingBlog.image;

    // If new image uploaded, replace old image
    if (req.file) {
      const newImageUrl = buildImageUrl(req, req.file);
      imageUrl = newImageUrl;

      // Delete old image file
      if (existingBlog.image) {
        try {
          const oldUrl = new URL(existingBlog.image);
          const oldFilePath = path.join(__dirname, '..', oldUrl.pathname);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          // ignore cleanup errors
        }
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        date,
        summary,
        content,
        image: imageUrl,
      },
      { new: true }
    );

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.status(200).json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogs, createBlog, deleteBlog, updateBlog, getBlogById };