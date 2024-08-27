import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Blogging.css';
import { FaUserCircle, FaThumbsUp, FaShareAlt, FaCommentAlt } from 'react-icons/fa';
import ShareModal from './ShareModal';
import EmojiPicker from 'emoji-picker-react';

const highlightSearchTerms = (text, term) => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};


// Navbar Component
const Navbar = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [usernames, setUsernames] = useState([]);
  const categories = [
    'Technology', 'Health', 'Science', 'Lifestyle', 'Education',
    'Travel', 'Food', 'Business', 'Entertainment'
  ];
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const profileOptionsRef = useRef(null);

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        const usernames = response.data.map(user => user.username); // Extract usernames from the response
        setUsernames(usernames);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
  
    fetchUsernames();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileOptionsRef.current &&
        !profileOptionsRef.current.contains(event.target) &&
        !event.target.closest('.profile')
      ) {
        setShowProfileOptions(false);
      }
    };

    if (showProfileOptions) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileOptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleUsernameFilterChange = (e) => {
    const selectedUsername = e.target.value;
    setUsernameFilter(selectedUsername);
    onFilter({ username: selectedUsername, category: categoryFilter });
  };
  
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    onFilter({ username: usernameFilter, category: selectedCategory });
  };

  return (
    <nav className="navbarr">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="filters">
        <div className="filter-dropdown1">
          <label htmlFor="username-filter">Username:</label>
          <select
            value={usernameFilter}
            onChange={handleUsernameFilterChange}
            className="username-dropdown"
          >
            <option value="">Select Username</option>
            {usernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-dropdown">
          <label htmlFor="category-filter">Category:</label>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="category-dropdown"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="profile" onClick={() => setShowProfileOptions(!showProfileOptions)}>
        <FaUserCircle size={40} />
        {showProfileOptions && (
          <div className="profile-options" ref={profileOptionsRef}>
            <Link to="/profile">View Your Profile</Link>
            <Link to="/my-blogs">View Your Old Blogs</Link>
            <Link to="/create-blog">Create New Blog</Link>
            <Link to="/">Logout</Link>
          </div>
        )}
      </div>
    </nav>
  );
};


// Blogging Component
const Blogging = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrls, setShareUrls] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [noBlogsMessage, setNoBlogsMessage] = useState('');

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          let apiUrl = 'http://localhost:5000/api/allblogs';
  
          // Include filters in API request if set
          const filters = [];
          if (categoryFilter) {
            filters.push(`category=${categoryFilter}`);
          }
          if (usernameFilter) {
            filters.push(`username=${usernameFilter}`);
          }
          if (filters.length > 0) {
            apiUrl += `?${filters.join('&')}`;
          }
  
          const response = await axios.get(apiUrl);
          const fetchedPosts = response.data;
  
          if (fetchedPosts.length === 0) {
            setNoBlogsMessage("The selected user hasn't published any blogs yet...");
          } else {
            setNoBlogsMessage('');
          }
  
        const likedResponse = await axios.get('http://localhost:5000/api/user/liked-posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
  
        const likedPostsSet = new Set(likedResponse.data.likedPosts.map(post => post._id));
        setLikedPosts(likedPostsSet);
  
        const mergedPosts = fetchedPosts.map(post => ({
          ...post,
          isLiked: likedPostsSet.has(post._id),
          likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
          comments: post.comments || [],
        }));
        setPosts(mergedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [categoryFilter, usernameFilter]); // Re-fetch posts when filters change

  const handleFilter = ({ username, category }) => {
    setUsernameFilter(username);
    setCategoryFilter(category);
  };

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/allblogs?search=${query}`);
      setSearchResults(response.data);
      setSearchTerm(query);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  const displayedPosts = searchTerm ? searchResults : posts;



  const handleLike = async (postId) => {
    try {
        const alreadyLiked = likedPosts.has(postId);

        await axios.post(
            `http://localhost:5000/api/blogs/${postId}/${alreadyLiked ? 'unlike' : 'like'}`,
            {},
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
        );

        const updatedPosts = posts.map(post =>
            post._id === postId 
                ? { 
                    ...post, 
                    likes: alreadyLiked ? Math.max((post.likes || 0) - 1, 0) : (post.likes || 0) + 1, 
                    isLiked: !alreadyLiked 
                } 
                : post
        );
        setPosts(updatedPosts);

        const newLikedPosts = new Set(likedPosts);
        if (alreadyLiked) {
            newLikedPosts.delete(postId);
        } else {
            newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);
    } catch (error) {
        console.error('Error liking post:', error);
    }
};

  

const handleShare = (postId) => {
  const post = posts.find(p => p._id === postId);
  if (post) {
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    // Function to format HTML content into plain text with proper spacing and headings
    const formatContent = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const body = doc.body;

      let text = "";
      body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          switch (node.nodeName) {
            case 'P':
              text += `${node.textContent}\n\n`; // Add line space between paragraphs
              break;
            case 'H1':
              text += `\n${node.textContent}\n\n`; // Add line space before and after main headings
              break;
            case 'H2':
              text += `\n## ${node.textContent}\n\n`; // Add line space before and after subheadings
              break;
            case 'H3':
              text += `\n### ${node.textContent}\n\n`; // Add line space before and after sub-subheadings
              break;
            case 'OL':
              text += '\n';
              node.querySelectorAll('LI').forEach((li, index) => {
                text += `${index + 1}. ${li.textContent}\n`; // Numbered list items
              });
              text += '\n'; // Add line space after ordered lists
              break;
            case 'UL':
              text += '\n';
              node.querySelectorAll('LI').forEach((li) => {
                text += `- ${li.textContent}\n`; // Bulleted list items
              });
              text += '\n'; // Add line space after unordered lists
              break;
            default:
              break;
          }
        }
      });
      return text.trim();
    };

    const formattedContent = formatContent(post.content);
    const shareText = `${post.title}\n\n${formattedContent}\n\nRead more: ${postUrl}`;

    setShareUrls({
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`
    });

    setShowShareModal(true);
  }
};


  const handleComment = async (postId, e) => {
    e.preventDefault();  // Prevents the default form submission behavior
  
    if (commentText.trim() === '') return;
  
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${postId}/comment`,
        { commentText},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
  
      // Update the post's comments in the state
      const updatedPosts = posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...post.comments, response.data.comment] }
          : post
      );
  
      setPosts(updatedPosts);
      setCommentText(''); // Clear the input field after posting the comment
      setShowEmojiPicker(false); // Close emoji picker if open
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId, e) => {
    e.preventDefault();

    try {
        const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
        if (!isConfirmed) return;

        await axios.delete(
            `http://localhost:5000/api/blogs/${postId}/comments/${commentId}`,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
        );

        // Update the post's comments in the state by filtering out the deleted comment
        const updatedPosts = posts.map(post =>
            post._id === postId
                ? { ...post, comments: post.comments.filter(comment => comment._id !== commentId) }
                : post
        );

        setPosts(updatedPosts); // Update the posts state

        // Show the success alert and reload the state after the user clicks "OK"
        alert('Comment deleted successfully.');

        // Reload the state by triggering a re-render
        setPosts([...updatedPosts]);
    } catch (error) {
         // Update the post's comments in the state by filtering out the deleted comment
        const updatedPosts = posts.map(post =>
          post._id === postId
              ? { ...post, comments: post.comments.filter(comment => comment._id !== commentId) }
              : post
      );
        console.error('Error deleting comment:', error);

        setPosts(updatedPosts); // Update the posts state

        // Show the success alert and reload the state after the user clicks "OK"
        alert('Comment deleted successfully.');

        // Reload the state by triggering a re-render
        setPosts([...updatedPosts]);
    }
};


  
  const handleEmojiClick = (emojiObject) => {
    setCommentText(prevText => prevText + emojiObject.emoji);
  };

  const handleCommentButtonClick = (postId) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  return (
    <div className="specific-page-container">
      <div className="blogging-container">
        <Navbar onSearch={handleSearch} onFilter={handleFilter} />
        <h1>Welcome to the Blogging Platform!</h1>
        <p>Share your journey, express your thoughts, learn from others, and connect with the world!</p>
        {noBlogsMessage && <strong><p className="no-blogs-message">{noBlogsMessage}</p></strong>}
        <div className="posts-list">
          {displayedPosts.map((post) => (
            <div key={post._id} className="post">
              <h2 dangerouslySetInnerHTML={{ __html: highlightSearchTerms(post.title, searchTerm) }}></h2>
              <p dangerouslySetInnerHTML={{ __html: highlightSearchTerms(post.content, searchTerm) }}></p>
              <div className="post-actions">
              <button
  className="action-button5"
  onClick={() => handleLike(post._id)}
  style={{ cursor: 'pointer' }}
>
  <FaThumbsUp
    color={post.isLiked ? 'red' : 'white'}
    style={{ marginRight: '5px' }}
  />
  {post.isLiked ? 'Liked' : 'Like'} ({post.likes})
</button>

  <button
    className="action-button4"
    onClick={() => handleShare(post._id)}
  >
    <FaShareAlt /> Share
  </button>
  <div className="comment-section1">
    <button
      className="action-button6"
      onClick={() => handleCommentButtonClick(post._id)}
    >
      <FaCommentAlt /> Comments ({post.comments.length})
    </button>
    {selectedPostId === post._id && (
      <div className="comments-list">
      {post.comments.map((comment) => (
        <div key={comment._id} className="comment-item">
          <p>{comment.text}</p>
          <button
            className="delete-button"
            onClick={(e) => handleDeleteComment(post._id, comment._id, e)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
    
    )}
    {selectedPostId === post._id && (
      <div className="comment-input">
      <div className="textarea-wrapper">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          className="emoji-buttonn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {showEmojiPicker ? '🙃' : '🙂'}
        </button>
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <button className="post-comment-button" type="button" onClick={(e) => handleComment(post._id, e)}>
        Post Comment
      </button>
    </div>
    
      )}
      </div>
       </div>
        </div>
          ))}
        </div>
      </div>
      <ShareModal
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        whatsappUrl={shareUrls.whatsapp}
        telegramUrl={shareUrls.telegram}
      />
    </div>
  );
};

export default Blogging;