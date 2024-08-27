import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/login">Sign In</Link></li>
          <li className="nav-item"><Link to="/register">Sign Up</Link></li>
          <li className="nav-item"><Link to="/adminlogin">Admin</Link></li>
        </ul>
      </nav>
      <div className="background-image">
        <h2 className="title">Welcome to the Blogging Platform</h2>
      </div>
    </div>
  );
};

export default Home;
