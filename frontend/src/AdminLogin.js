import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check for admin credentials
    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="a-login-container">
      <div className="a-login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              placeholder="Ex: adminId@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Ex: AdminPwd@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
          </div>

          <button type="submit">Login</button>
        </form>
        <div className="already"> If you are an user?<Link to="/login"> User Login</Link> </div>
      </div>
    </div>
  );
};

export default AdminLogin;
