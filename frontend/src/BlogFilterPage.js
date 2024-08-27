import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogFilterPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  useEffect(() => {
    // Fetch users from the API
    axios.get('/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  useEffect(() => {
    // Fetch all blogs from the API
    axios.get('/api/allblogs')
      .then(response => {
        console.log('Fetched blogs:', response.data); // Debugging line
        setBlogs(response.data);
        setFilteredBlogs(response.data); // Initialize with all blogs
      })
      .catch(error => console.error('Error fetching blogs:', error));
  }, []);

  useEffect(() => {
    // Filter blogs by selected username
    if (selectedUser) {
      const filtered = blogs.filter(blog => blog.author.username === selectedUser);
      console.log('Filtered blogs:', filtered); // Debugging line
      setFilteredBlogs(filtered);
    } else {
      setFilteredBlogs(blogs);
    }
  }, [selectedUser, blogs]);

  return (
    <div>
      <h1>Filter Blogs by User</h1>

      <label htmlFor="user-dropdown">Select a User:</label>
      <select
        id="user-dropdown"
        value={selectedUser}
        onChange={e => setSelectedUser(e.target.value)}
      >
        <option value="">-- Select User --</option>
        {users.map(user => (
          <option key={user.id} value={user.username}>
            {user.username}
          </option>
        ))}
      </select>

      <div>
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map(blog => (
            <div key={blog._id}>
              <h2>{blog.title}</h2>
              <p>{blog.content}</p>
              <p><strong>Author:</strong> {blog.author.username}</p>
            </div>
          ))
        ) : (
          <p>No blogs found for the selected user.</p>
        )}
      </div>
    </div>
  );
};

export default BlogFilterPage;
