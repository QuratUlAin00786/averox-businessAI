import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/Authentication/authSlice';
import './MainLayout.css';

/**
 * MainLayout component
 * Provides the main application layout with sidebar navigation and header
 */
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };

  // Define navigation items
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/',
      icon: '📊'
    },
    { 
      id: 'customers', 
      label: 'Customers', 
      path: '/customers',
      icon: '👥'
    },
    { 
      id: 'sales', 
      label: 'Sales', 
      path: '/sales',
      icon: '💰'
    },
    { 
      id: 'leads', 
      label: 'Leads', 
      path: '/leads',
      icon: '🎯'
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      path: '/tasks',
      icon: '✓'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      path: '/reports',
      icon: '📈'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      path: '/settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="app-title">CRM Pro</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link 
                  to={item.path}
                  className={`nav-item ${location === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="main-content">
        {/* Top header */}
        <header className="header">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>
          
          <div className="header-actions">
            <div className="notifications">
              <button className="icon-button">
                🔔
                <span className="notification-badge">3</span>
              </button>
            </div>
            
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.firstName || 'User'} {user?.lastName || ''}</span>
                <span className="user-role">{user?.role || 'User'}</span>
              </div>
              
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.firstName} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <div className="user-menu">
                <button className="dropdown-button">▼</button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/preferences" className="dropdown-item">Preferences</Link>
                  <button onClick={handleLogout} className="dropdown-item">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;