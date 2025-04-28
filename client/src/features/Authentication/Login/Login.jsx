import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'wouter';
import AuthLayout from '../../../layouts/AuthLayout';
import { login } from '../authSlice';
import './Login.css';

/**
 * Login page component
 * 
 * @returns {JSX.Element} Login component
 */
const Login = () => {
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(login(formData)).unwrap();
      setLocation('/');
    } catch (err) {
      // Error is handled by the redux state
      console.error('Login failed:', err);
    }
  };
  
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to access your account"
    >
      <div className="login-form-container">
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <div className="form-group checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-text">Remember me</span>
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="login-footer">
          Don't have an account?{' '}
          <Link to="/register" className="register-link">
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;