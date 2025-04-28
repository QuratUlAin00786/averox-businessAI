import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../../layouts/MainLayout';
import SalesDashboard from '../../features/Sales/SalesDashboard/SalesDashboard';
import './Dashboard.css';

/**
 * Main dashboard page
 * Displays overview of CRM data, recent activities, and key metrics
 */
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good Morning';
    } else if (hour < 18) {
      newGreeting = 'Good Afternoon';
    } else {
      newGreeting = 'Good Evening';
    }
    
    setGreeting(newGreeting);
  }, []);

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {greeting}, {user?.firstName || 'User'}!
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your business today
            </p>
          </div>
          
          <div className="dashboard-actions">
            <button className="action-button">New Lead</button>
            <button className="action-button primary">New Deal</button>
          </div>
        </div>
        
        {/* Dashboard Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon leads">👥</div>
            <div className="metric-content">
              <div className="metric-value">28</div>
              <div className="metric-label">Total Leads</div>
            </div>
            <div className="metric-change positive">+12%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon deals">💰</div>
            <div className="metric-content">
              <div className="metric-value">16</div>
              <div className="metric-label">Active Deals</div>
            </div>
            <div className="metric-change positive">+8%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon revenue">📈</div>
            <div className="metric-content">
              <div className="metric-value">$42,500</div>
              <div className="metric-label">Monthly Revenue</div>
            </div>
            <div className="metric-change positive">+15%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon tasks">✓</div>
            <div className="metric-content">
              <div className="metric-value">9</div>
              <div className="metric-label">Tasks Due Today</div>
            </div>
            <div className="metric-change negative">+3</div>
          </div>
        </div>
        
        {/* Sales Dashboard */}
        <div className="dashboard-section">
          <h2 className="section-title">Sales Overview</h2>
          <SalesDashboard />
        </div>
        
        {/* Recent Activity */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <button className="section-action">View All</button>
            </div>
            
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon deals">💰</div>
                <div className="activity-content">
                  <div className="activity-title">New deal created</div>
                  <div className="activity-description">
                    Acme Corp - Website Redesign ($12,000)
                  </div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon leads">👥</div>
                <div className="activity-content">
                  <div className="activity-title">New lead assigned</div>
                  <div className="activity-description">
                    Jane Smith from XYZ Industries
                  </div>
                  <div className="activity-time">3 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon tasks">✓</div>
                <div className="activity-content">
                  <div className="activity-title">Task completed</div>
                  <div className="activity-description">
                    Follow up with Global Tech about proposal
                  </div>
                  <div className="activity-time">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Upcoming Tasks</h2>
              <button className="section-action">View All</button>
            </div>
            
            <div className="task-list">
              <div className="task-item">
                <div className="task-checkbox">
                  <input type="checkbox" id="task-1" />
                  <label htmlFor="task-1"></label>
                </div>
                <div className="task-content">
                  <div className="task-title">Call Tim about new proposal</div>
                  <div className="task-due">Today, 2:00 PM</div>
                </div>
                <div className="task-priority high">High</div>
              </div>
              
              <div className="task-item">
                <div className="task-checkbox">
                  <input type="checkbox" id="task-2" />
                  <label htmlFor="task-2"></label>
                </div>
                <div className="task-content">
                  <div className="task-title">Prepare slides for client presentation</div>
                  <div className="task-due">Tomorrow, 10:00 AM</div>
                </div>
                <div className="task-priority medium">Medium</div>
              </div>
              
              <div className="task-item">
                <div className="task-checkbox">
                  <input type="checkbox" id="task-3" />
                  <label htmlFor="task-3"></label>
                </div>
                <div className="task-content">
                  <div className="task-title">Review marketing campaign results</div>
                  <div className="task-due">Tomorrow, 4:00 PM</div>
                </div>
                <div className="task-priority normal">Normal</div>
              </div>
              
              <div className="task-item">
                <div className="task-checkbox">
                  <input type="checkbox" id="task-4" />
                  <label htmlFor="task-4"></label>
                </div>
                <div className="task-content">
                  <div className="task-title">Follow up with vendors about pricing</div>
                  <div className="task-due">Friday, 11:00 AM</div>
                </div>
                <div className="task-priority medium">Medium</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;