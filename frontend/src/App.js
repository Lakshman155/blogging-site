import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import AdminLogin from './AdminLogin';
import Home from './Home';
import AdminDashboard from './AdminDashboard';
import Blogging from './Blogging';
import ForgotPassword from './ForgotPassword';
import EditPost from './EditPost';
import BlogFilterPage from './BlogFilterPage';
import CreateBlog from './CreateBlog';
import ProtectedRoute from './ProtectedRoute';
import MyBlogs from './MyBlogs';
import BlogDetail from './BlogDetail';
import Profile from './Profile'; // Import Profile component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/blogging" element={<ProtectedRoute><Blogging /></ProtectedRoute>} />
        <Route path="/edit-blog/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} /> 
        <Route path="/blogfilter" element={<ProtectedRoute><BlogFilterPage /></ProtectedRoute>} /> 
        <Route path="/my-blogs" element={<ProtectedRoute><MyBlogs /></ProtectedRoute>} />
        <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Add route for Profile */}
      </Routes>
    </Router>
  );
}

export default App;
