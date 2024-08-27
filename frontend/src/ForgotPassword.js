import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/forgot-password', { email });
      setMessage(response.data.message);
      setEmail('');
      setError('');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              placeholder="Ex: john.doe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit">Send Reset Link</button>
          {message && <p className="message">{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
        <div className="options">
          <div className="login-link">
            Remembered your password? <Link to='/login'>Login</Link>
          </div>
          <div className="register-link">
            Don't have an account? <Link to='/register'>Sign-Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
