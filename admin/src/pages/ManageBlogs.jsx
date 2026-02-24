import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Trash2, Plus, Pencil, X, Loader2, Upload } from 'lucide-react';

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date: '',
    summary: '',
    content: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(''); // for edit mode preview
  const [saving, setSaving] = useState(false);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic frontend validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file only.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('author', formData.author);
      payload.append('date', formData.date);
      payload.append('summary', formData.summary);
      payload.append('content', formData.content);

      // Only append image if selected
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editId) {
        await axios.put(`/blogs/${editId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/blogs', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Error saving blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert('Error deleting blog');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      title: item.title || '',
      author: item.author || '',
      date: item.date || '',
      summary: item.summary || '',
      content: item.content || '',
    });
    setExistingImage(item.image || '');
    setImageFile(null); // reset new upload
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      title: '',
      author: '',
      date: '',
      summary: '',
      content: '',
    });
    setImageFile(null);
    setExistingImage('');
    // reset file input manually if needed
    const fileInput = document.getElementById('blog-image-input');
    if (fileInput) fileInput.value = '';
  };

  const selectedImagePreview = imageFile ? URL.createObjectURL(imageFile) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-serif font-bold mb-8 text-stone-900">Manage Blogs</h2>

      {/* FORM SECTION */}
      <div
        className={`p-6 rounded-xl shadow-sm border mb-12 transition-colors ${
          editId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-stone-200'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-stone-800">
            {editId ? (
              <>
                <Pencil size={20} /> Edit Blog
              </>
            ) : (
              <>
                <Plus size={20} /> Add New Blog
              </>
            )}
          </h3>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-stone-500 hover:text-red-500 flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Blog Title"
              required
              className="w-full p-2 border border-stone-300 rounded"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="Author Name"
            required
            className="p-2 border border-stone-300 rounded"
            value={formData.author}
            onChange={(e) => handleInputChange('author', e.target.value)}
          />

          <input
            type="text"
            placeholder="Date (e.g. June 20, 2025)"
            required
            className="p-2 border border-stone-300 rounded"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />

          {/* IMAGE UPLOAD FIELD */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Cover Image Upload {editId ? '(optional if keeping existing image)' : ''}
            </label>

            <div className="border border-stone-300 rounded p-3 bg-white">
              <label
                htmlFor="blog-image-input"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded bg-stone-900 text-white hover:bg-black transition-colors text-sm"
              >
                <Upload size={16} />
                {imageFile ? 'Change Image' : 'Choose Image'}
              </label>

              <input
                id="blog-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="mt-2 text-sm text-stone-600">
                {imageFile ? (
                  <span>Selected: {imageFile.name}</span>
                ) : existingImage ? (
                  <span>Using existing image</span>
                ) : (
                  <span>No image selected</span>
                )}
              </div>

              {(selectedImagePreview || existingImage) && (
                <div className="mt-3">
                  <img
                    src={selectedImagePreview || existingImage}
                    alt="Blog cover preview"
                    className="h-40 w-full max-w-md object-cover rounded border border-stone-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <textarea
              placeholder="Short Summary (Appears on card)"
              required
              rows={2}
              className="w-full p-2 border border-stone-300 rounded"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <textarea
              placeholder="Full Blog Content (Markdown or HTML allowed)"
              required
              rows={6}
              className="w-full p-2 border border-stone-300 rounded font-mono text-sm"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded text-white col-span-2 transition-colors flex justify-center items-center gap-2 ${
              editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-stone-900 hover:bg-black'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {editId ? 'Update Blog' : 'Publish Blog'}
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" /> Loading...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 font-bold uppercase text-xs text-stone-900">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <td className="p-4 font-medium text-stone-900 max-w-xs truncate">{blog.title}</td>
                  <td className="p-4">{blog.author}</td>
                  <td className="p-4">{blog.date}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {blogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-stone-400">
                    No blogs found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}