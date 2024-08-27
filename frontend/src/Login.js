import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email id';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (!password.trim()) {
      errors.password = 'Please enter your password';
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
        const response = await axios.post('http://localhost:5000/login', { emailid: email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        setEmail('');
        setPassword('');
        setErrors({});
        navigate('/blogging'); // Redirect to home page after login
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 401)) {
          setErrors({ server: error.response.data.message });
        } else {
          console.error(error);
          setErrors({ server: 'Login failed' });
        }
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Your Account</h2>
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
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <button type="submit">Login</button>
          {errors.server && <p className="error">{errors.server}</p>}
        </form>
        
          <div className="already">
            Don't have an account? <Link to='/register'>Sign-Up</Link>
          </div>
          <div className="already">
            Are you an admin? <Link to='/adminlogin'>Admin Login</Link>
          </div>
          
      </div>
    </div>
  );
};

export default Login;
