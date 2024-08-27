import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import CommentList from './CommentList';

const API_BASE_URL = 'http://localhost:3000';

const PostDetails = () => {
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = liked
        ? await axios.post(`${API_BASE_URL}/posts/${post._id}/unlike`, { userId: 'user_id' })
        : await axios.post(`${API_BASE_URL}/posts/${post._id}/like`, { userId: 'user_id' });
      setLiked(!liked);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>Categories: {post.categories.join(', ')}</p>
      <p>Tags: {post.tags.join(', ')}</p>
      <button onClick={handleLike}>{liked ? 'Unlike' : 'Like'}</button>
      <p>{post.likes.length} likes</p>
      <Link to={`/posts/${post._id}/edit`}>Edit Post</Link>
      <CommentList postId={post._id} />
    </div>
  );
};

export default PostDetails;
