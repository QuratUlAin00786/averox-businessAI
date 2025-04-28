import React from 'react';
import { Link } from 'wouter';
import MainLayout from '../../layouts/MainLayout';
import SalesDashboard from '../../features/Sales/SalesDashboard/SalesDashboard';
import './Dashboard.css';

/**
 * Dashboard page component
 * Serves as the main landing page after authentication
 */
const Dashboard = () => {
  return (
    <MainLayout>
      <div className="dashboard-page">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="dashboard-actions">
            <Link to="/customers/new" className="button-primary">
              New Customer
            </Link>
            <Link to="/deals/new" className="button-secondary">
              New Deal
            </Link>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Sales Overview</h2>
              <Link to="/sales" className="section-link">View All</Link>
            </div>
            <SalesDashboard />
          </div>
          
          <div className="dashboard-widgets">
            <div className="widget">
              <div className="widget-header">
                <h3 className="widget-title">Recent Activity</h3>
                <Link to="/activities" className="widget-link">View All</Link>
              </div>
              <div className="widget-content">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon customer"></div>
                    <div className="activity-details">
                      <p className="activity-text">New customer: <span className="activity-highlight">Acme Corp</span></p>
                      <p className="activity-time">2 hours ago</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon deal"></div>
                    <div className="activity-details">
                      <p className="activity-text">Deal updated: <span className="activity-highlight">Enterprise License</span></p>
                      <p className="activity-time">Yesterday</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon task"></div>
                    <div className="activity-details">
                      <p className="activity-text">Task completed: <span className="activity-highlight">Follow-up call</span></p>
                      <p className="activity-time">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="widget">
              <div className="widget-header">
                <h3 className="widget-title">Tasks</h3>
                <Link to="/tasks" className="widget-link">View All</Link>
              </div>
              <div className="widget-content">
                <div className="tasks-list">
                  <div className="task-item">
                    <input type="checkbox" className="task-checkbox" id="task1" />
                    <label htmlFor="task1" className="task-label">Call back John from Acme Corp</label>
                    <span className="task-due">Today</span>
                  </div>
                  <div className="task-item">
                    <input type="checkbox" className="task-checkbox" id="task2" />
                    <label htmlFor="task2" className="task-label">Prepare presentation for Tech Solutions</label>
                    <span className="task-due">Tomorrow</span>
                  </div>
                  <div className="task-item">
                    <input type="checkbox" className="task-checkbox" id="task3" />
                    <label htmlFor="task3" className="task-label">Review proposal for GlobalTech</label>
                    <span className="task-due">Apr 30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;