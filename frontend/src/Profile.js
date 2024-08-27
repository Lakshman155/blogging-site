import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import { FaThumbsUp } from 'react-icons/fa';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [likedPosts, setLikedPosts] = useState([]);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUser(response.data);
                fetchLikedPosts(); // Fetch liked posts after fetching user details
            } catch (error) {
                console.error('Error fetching user details:', error);
                toast.error('Failed to fetch user details. Please try again later.');
            }
        };

        const fetchLikedPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user/liked-posts', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setLikedPosts(response.data.likedPosts); // Assuming response.data.likedPosts contains the post details
            } catch (error) {
                console.error('Error fetching liked posts:', error);
                toast.error('Failed to fetch liked posts. Please try again later.');
            }
        };

        fetchUserDetails();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                'http://localhost:5000/api/user/password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.response?.data?.message || 'Failed to update password. Please try again later.');
        }
    };

    const handleUnlike = async (postId) => {
        try {
            await axios.post(
                `http://localhost:5000/api/blogs/${postId}/unlike`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Remove the post from the likedPosts array after unliking
            setLikedPosts(likedPosts.filter((post) => post._id !== postId));
            toast.success('Post unliked successfully');
        } catch (error) {
            console.error('Error unliking post:', error);
            toast.error('Failed to unlike post. Please try again later.');
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="specific-page-container">
            <div className="profile-container">
                <ToastContainer />
                <h1 className="profile-heading">Your Profile!</h1>
                <div className="user-details">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Mobile:</strong> {user.mobile}</p>
                </div>
                <div className="password-change">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordChange}>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Change Password</button>
                    </form>
                </div>
            </div>

            <div className="liked-posts-container">
                <h2 className="liked-posts-heading">Liked Posts</h2>
                <div className="liked-posts-section">
                    {likedPosts.length > 0 ? (
                        likedPosts.map((post) => (
                            <div key={post._id} className="post">
                                <h3>{post.title}</h3>
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                <small><strong>Author: {post.author.username}</strong></small>
                                <div className="post-actionss">
                                    <button
                                        className="action-button"
                                        onClick={() => handleUnlike(post._id)}
                                    >
                                        <FaThumbsUp />
                                        Unlike
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>You haven't liked any posts yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
