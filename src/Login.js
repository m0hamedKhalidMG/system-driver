// src/pages/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
const axiosInstance = axios.create();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://musifuk-be.vercel.app/api/login', {
        email,
        password,
        role: 'Driver'
      });

      if (response.data ) {
        console.log(response.data)
        localStorage.setItem('token', response.data.result.token);
        axios.defaults.headers.common['x-auth-token'] = response.data.result.token;
        axiosInstance.defaults.headers.common['x-auth-token'] = response.data.result.token;

        navigate('/driver-map'); // Redirect to home or desired route
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="title">Login</h1>
        <form className="form" onSubmit={handleLogin}>
          <div>
            <label className="label">Email:</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password:</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
