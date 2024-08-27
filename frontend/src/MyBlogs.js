import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyBlogs.css';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchUserBlogs(token);
    }
  }, [navigate]);

  const fetchUserBlogs = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/user/blogs', config);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  };

  return (
    <div className="specific-page-container">
      <div className="my-blogs-container">
        <h1 className="my-blog-heading">Your Published Blogs!</h1>
        {blogs.length === 0 ? (
          <p>No blogs found. Start writing your first blog!</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-card3">
              <h2>{blog.title}</h2>
              <p><strong>Category:</strong> {blog.category}</p>
              <p><strong>Tags:</strong> {blog.tags.join(', ')}</p> {/* Join tags with a comma and space */}
              <p><strong>Created At:</strong> {new Date(blog.createdAt).toLocaleString()}</p>
              <div 
                className="blog-content" 
                dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 100) + '...' }} 
              />
              <button onClick={() => navigate(`/blog/${blog._id}`)}>Read More</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBlogs;
