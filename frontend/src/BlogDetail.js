import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-blog/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        console.log('Deleting blog with ID:', id); // Log ID for debugging
        await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Add token to headers if needed
          }
        });
        alert('Blog post deleted successfully.'); // Alert message after successful deletion
        navigate('/my-blogs'); // Redirect to the blogs list after deletion
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete the blog post. Please try again.');
      }
    }
  };

  if (!blog) {
    return <p>Loading...</p>;
  }

  return (
    <div className="specific-page-container">
      <div className="blog-detail-container">
        <h1 className="blog-detail-heading">Your Detailed Blog!</h1>
        <h2>{blog.title}</h2>
        <p><strong>Author:</strong> {blog.author.username}</p>
        <p><strong>Category:</strong> {blog.category}</p>
        <p><strong>Tags:</strong> {blog.tags.join(', ')}</p>
        <p><strong>Created At:</strong> {new Date(blog.createdAt).toLocaleString()}</p>
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
        <div className="blog-buttons2">
          <button onClick={handleEdit} className="edit-button">Edit Post</button>
          <button onClick={handleDelete} className="delete-buttonn">Delete Post</button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
