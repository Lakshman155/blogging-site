import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateBlog.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false); // Loading state to disable button while submitting
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }

    if (id) {
      setIsEditing(true);
      const fetchBlog = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          const { title, content, category, tags } = response.data;
          setBlog({
            title,
            content,
            category,
            tags: tags.join(', '),
          });
        } catch (error) {
          console.error('Error fetching blog:', error);
          toast.error('Failed to fetch blog details.');
        }
      };
      fetchBlog();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({
      ...prevBlog,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(''); // Clear previous errors

    const token = localStorage.getItem('token');

    try {
      if (!token) {
        toast.error('You need to be logged in to publish a blog.');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/blogs/${id}`,
          {
            ...blog,
            tags: blog.tags.split(',').map(tag => tag.trim()),
          },
          config
        );
        toast.success('Blog Successfully Updated!');
      } else {
        await axios.post(
          'http://localhost:5000/api/blogs',
          {
            ...blog,
            tags: blog.tags.split(',').map(tag => tag.trim()),
          },
          config
        );
        toast.success('Blog Successfully Published!');
      }

      setBlog({
        title: '',
        content: '',
        category: '',
        tags: '',
      });
      setLoading(false);
      navigate('/blogs'); // Redirect to blogs list or detail page
    } catch (error) {
      console.error('Error publishing/updating blog:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'publish'} blog. ${error.response ? error.response.data.message : 'Please try again.'}`);
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align', 'blockquote', 'code-block',
    'list', 'bullet', 'indent', 'link', 'image'
  ];

  return (
    <div className="create-blog-container">
      <ToastContainer />
      <h1>{isEditing ? 'Edit Blog Post' : 'Create New Blog'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={blog.title}
            onChange={handleChange}
            placeholder="Enter your blog title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <ReactQuill
            value={blog.content}
            onChange={(value) => setBlog((prevBlog) => ({ ...prevBlog, content: value }))}
            modules={modules}
            formats={formats}
            placeholder="Write your blog content here..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={blog.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Technology">Technology</option>
            <option value="Health">Health</option>
            <option value="Science">Science</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Education">Education</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Business">Business</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={blog.tags}
            onChange={handleChange}
            placeholder="Enter tags, separated by commas"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : isEditing ? 'Update Blog' : 'Publish Blog'}
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
