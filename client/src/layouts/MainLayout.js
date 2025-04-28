import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'wouter';
import './MainLayout.css';

/**
 * Main application layout with sidebar navigation and header
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render
 * @returns {JSX.Element} MainLayout component
 */
const MainLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/leads', label: 'Leads', icon: '🎯' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/invoices', label: 'Invoices', icon: '📃' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="main-layout">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-logo">AVEROX CRM</h1>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`nav-link ${location === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="version">v1.0.0</div>
        </div>
      </aside>
      
      {/* Main content area */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>
          
          <div className="header-actions">
            <button className="header-button">
              <span role="img" aria-label="Notifications">🔔</span>
            </button>
            
            <div className="user-profile">
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</div>
                <div className="user-role">{user?.role || 'Not logged in'}</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;