import React from 'react';
import { Link } from 'wouter';
import './AuthLayout.css';

/**
 * AuthLayout component
 * Provides a layout for authentication pages like login and register
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <Link to="/" className="logo">
              <h1 className="logo-text">AVEROX Business AI</h1>
            </Link>
            
            {title && <h2 className="auth-title">{title}</h2>}
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          
          <div className="auth-body">
            {children}
          </div>
          
          <div className="auth-footer">
            <p className="copyright">
              &copy; {new Date().getFullYear()} AVEROX Business AI. All rights reserved.
            </p>
          </div>
        </div>
        
        <div className="auth-backdrop">
          <div className="auth-features">
            <h2 className="features-title">Transform Your Business with AVEROX Business AI</h2>
            <ul className="features-list">
              <li className="feature-item">
                <span className="feature-icon">📊</span>
                <div className="feature-content">
                  <h3 className="feature-title">Comprehensive Dashboard</h3>
                  <p className="feature-description">
                    Get a bird's eye view of your business with real-time metrics and analytics.
                  </p>
                </div>
              </li>
              
              <li className="feature-item">
                <span className="feature-icon">👥</span>
                <div className="feature-content">
                  <h3 className="feature-title">Customer Management</h3>
                  <p className="feature-description">
                    Organize contacts, track interactions, and build stronger customer relationships.
                  </p>
                </div>
              </li>
              
              <li className="feature-item">
                <span className="feature-icon">💰</span>
                <div className="feature-content">
                  <h3 className="feature-title">Sales Pipeline</h3>
                  <p className="feature-description">
                    Monitor deals from lead to close and optimize your sales process.
                  </p>
                </div>
              </li>
              
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <div className="feature-content">
                  <h3 className="feature-title">Task Management</h3>
                  <p className="feature-description">
                    Stay organized with task assignments, due dates, and reminders.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;