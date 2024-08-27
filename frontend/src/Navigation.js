import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const Navigation = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav>
      <Link to="/">Home</Link>
      {categories.map(category => (
        <Link key={category} to={`/category/${category}`}>{category}</Link>
      ))}
      <Link to="/search">Search</Link>
    </nav>
  );
};

export default Navigation;
