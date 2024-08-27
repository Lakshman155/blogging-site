import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_BASE_URL = 'http://localhost:3000';

const PostForm = ({ postId, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
          const { title, content, categories, tags } = response.data;
          setTitle(title);
          setContent(content);
          setCategories(categories.join(', '));
          setTags(tags.join(', '));
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      };

      fetchPost();
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title,
      content,
      categories: categories.split(',').map(cat => cat.trim()),
      tags: tags.split(',').map(tag => tag.trim()),
    };

    try {
      if (postId) {
        await axios.put(`${API_BASE_URL}/posts/${postId}`, postData);
      } else {
        await axios.post(`${API_BASE_URL}/posts`, postData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Content:</label>
        <ReactQuill value={content} onChange={setContent} />
      </div>
      <div>
        <label>Categories:</label>
        <input type="text" value={categories} onChange={(e) => setCategories(e.target.value)} />
      </div>
      <div>
        <label>Tags:</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PostForm;
