import React from 'react';
import { Link } from 'wouter';
import './AuthLayout.css';

/**
 * Authentication layout for login and registration pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @returns {JSX.Element} AuthLayout component
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="brand-link">
            <h1 className="brand-name">AVEROX CRM</h1>
          </Link>
        </div>
        
        <div className="auth-content">
          <div className="auth-header">
            {title && <h2 className="auth-title">{title}</h2>}
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          
          {children}
        </div>
        
        <div className="auth-footer">
          <p>&copy; {new Date().getFullYear()} AVEROX CRM. All rights reserved.</p>
        </div>
      </div>
      
      <div className="auth-background">
        <div className="auth-background-content">
          <h2>Streamline Your Business Operations</h2>
          <p>A comprehensive AI-powered business solution platform that provides modular, scalable infrastructure for enterprise management with intelligent insights.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;