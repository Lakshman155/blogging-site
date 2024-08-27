import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/comments`, {
        postId,
        userId: 'user_id', // Replace with actual user ID
        content,
      });
      setComments([...comments, response.data.comment]);
      setContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = likedComments[commentId]
        ? await axios.post(`${API_BASE_URL}/comments/${commentId}/unlike`, { userId: 'user_id' })
        : await axios.post(`${API_BASE_URL}/comments/${commentId}/like`, { userId: 'user_id' });
      setLikedComments({ ...likedComments, [commentId]: !likedComments[commentId] });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        )
      );
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    }
  };

  return (
    <div>
      <h3>Comments</h3>
      <form onSubmit={handleCommentSubmit}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
        <button type="submit">Add Comment</button>
      </form>
      <ul>
        {comments.map(comment => (
          <li key={comment._id}>
            {comment.content}
            <button onClick={() => handleLikeComment(comment._id)}>
              {likedComments[comment._id] ? 'Unlike' : 'Like'}
            </button>
            <span>{comment.likes.length} likes</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
