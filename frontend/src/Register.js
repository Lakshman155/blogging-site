import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (username.length < 6) {
      errors.username = 'Username must be at least 6 characters long';
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (password.length < 6 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
      errors.password = 'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one special character';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      try {
        await axios.post('http://localhost:5000/register', { username, email, mobile, password });
        setUsername('');
        setEmail('');
        setMobile('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        alert('Your Account Created Successfully...');
        navigate('/login'); // Redirect to login page
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setErrors({ [error.response.data.field]: error.response.data.message });
        } else {
          console.error(error);
          setErrors({ server: 'Registration failed' });
        }
      }
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 6) {
      setPasswordStrength('weak');
    } else if (newPassword.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  return (
    <div className="register-container">
      
      <div className="register-box">
        <h2>Create Your Account!</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Ex: john_doe123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              placeholder="Ex: john.doe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              placeholder="Ex: 1234567890"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            {errors.mobile && <p className="error">{errors.mobile}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Ex: MyPassword123!"
              value={password}
              onChange={handlePasswordChange}
            />
            <div className="password-strength">
              Password strength: {passwordStrength}
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit">Sign Up</button>
          {errors.server && <p className="error">{errors.server}</p>}
        </form>
        <div className="already">Already have an account? <Link to='/login'> Sign-In</Link></div>
        <div className="already">Are you an admin?<Link to='/adminlogin' > Admin Login</Link></div>
      </div>
    </div>
  );
};

export default Register;
