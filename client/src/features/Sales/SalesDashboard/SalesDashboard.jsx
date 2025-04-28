import React, { useState } from 'react';
import './SalesDashboard.css';

/**
 * SalesDashboard component
 * Displays sales metrics, charts, and pipeline overview
 */
const SalesDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Mock data for sales metrics and charts
  const salesData = {
    month: {
      total: 142500,
      deals: 28,
      average: 5089,
      conversion: 32,
      byStage: [
        { stage: 'Lead Generation', value: 45000, percent: 31.6 },
        { stage: 'Qualification', value: 32500, percent: 22.8 },
        { stage: 'Proposal', value: 38000, percent: 26.7 },
        { stage: 'Negotiation', value: 15000, percent: 10.5 },
        { stage: 'Closing', value: 12000, percent: 8.4 }
      ],
      topProducts: [
        { name: 'Product A', value: 52000, percent: 36.5 },
        { name: 'Product B', value: 38500, percent: 27.0 },
        { name: 'Product C', value: 28000, percent: 19.6 },
        { name: 'Product D', value: 24000, percent: 16.9 }
      ],
      topSalespeople: [
        { name: 'John Smith', value: 48500, deals: 9 },
        { name: 'Maria Garcia', value: 36000, deals: 7 },
        { name: 'David Wong', value: 31500, deals: 6 },
        { name: 'Sarah Johnson', value: 26500, deals: 6 }
      ]
    },
    quarter: {
      total: 385000,
      deals: 72,
      average: 5347,
      conversion: 28,
      byStage: [
        { stage: 'Lead Generation', value: 115000, percent: 29.9 },
        { stage: 'Qualification', value: 95000, percent: 24.7 },
        { stage: 'Proposal', value: 92000, percent: 23.9 },
        { stage: 'Negotiation', value: 45000, percent: 11.7 },
        { stage: 'Closing', value: 38000, percent: 9.8 }
      ],
      topProducts: [
        { name: 'Product A', value: 142000, percent: 36.9 },
        { name: 'Product B', value: 112500, percent: 29.2 },
        { name: 'Product C', value: 78000, percent: 20.3 },
        { name: 'Product D', value: 52500, percent: 13.6 }
      ],
      topSalespeople: [
        { name: 'John Smith', value: 124500, deals: 23 },
        { name: 'Maria Garcia', value: 98000, deals: 19 },
        { name: 'David Wong', value: 87500, deals: 16 },
        { name: 'Sarah Johnson', value: 75000, deals: 14 }
      ]
    },
    year: {
      total: 1250000,
      deals: 245,
      average: 5102,
      conversion: 24,
      byStage: [
        { stage: 'Lead Generation', value: 375000, percent: 30.0 },
        { stage: 'Qualification', value: 287500, percent: 23.0 },
        { stage: 'Proposal', value: 312500, percent: 25.0 },
        { stage: 'Negotiation', value: 175000, percent: 14.0 },
        { stage: 'Closing', value: 100000, percent: 8.0 }
      ],
      topProducts: [
        { name: 'Product A', value: 462500, percent: 37.0 },
        { name: 'Product B', value: 337500, percent: 27.0 },
        { name: 'Product C', value: 275000, percent: 22.0 },
        { name: 'Product D', value: 175000, percent: 14.0 }
      ],
      topSalespeople: [
        { name: 'John Smith', value: 412500, deals: 78 },
        { name: 'Maria Garcia', value: 325000, deals: 65 },
        { name: 'David Wong', value: 287500, deals: 57 },
        { name: 'Sarah Johnson', value: 225000, deals: 45 }
      ]
    }
  };
  
  const currentData = salesData[timeRange];
  
  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="sales-dashboard">
      {/* Time range filters */}
      <div className="sales-filters">
        <div className="filter-label">Time Range:</div>
        <div className="filter-options">
          <button 
            className={`filter-option ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button 
            className={`filter-option ${timeRange === 'quarter' ? 'active' : ''}`}
            onClick={() => setTimeRange('quarter')}
          >
            This Quarter
          </button>
          <button 
            className={`filter-option ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            This Year
          </button>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="sales-metrics">
        <div className="metric-box">
          <div className="metric-title">Total Sales</div>
          <div className="metric-value">{formatCurrency(currentData.total)}</div>
        </div>
        <div className="metric-box">
          <div className="metric-title">Deals Closed</div>
          <div className="metric-value">{currentData.deals}</div>
        </div>
        <div className="metric-box">
          <div className="metric-title">Average Deal Size</div>
          <div className="metric-value">{formatCurrency(currentData.average)}</div>
        </div>
        <div className="metric-box">
          <div className="metric-title">Conversion Rate</div>
          <div className="metric-value">{currentData.conversion}%</div>
        </div>
      </div>
      
      {/* Charts and data tables */}
      <div className="sales-charts">
        {/* Sales by Stage */}
        <div className="chart-container">
          <h3 className="chart-title">Sales by Stage</h3>
          <div className="stage-chart">
            {currentData.byStage.map((stage, index) => (
              <div key={index} className="stage-row">
                <div className="stage-label">{stage.stage}</div>
                <div className="stage-bar-container">
                  <div 
                    className="stage-bar"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
                <div className="stage-value">{formatCurrency(stage.value)}</div>
                <div className="stage-percent">{stage.percent}%</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Products */}
        <div className="chart-container">
          <h3 className="chart-title">Top Products</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {currentData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td className="table-value">{formatCurrency(product.value)}</td>
                    <td className="table-percent">{product.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Salespeople */}
        <div className="chart-container">
          <h3 className="chart-title">Top Salespeople</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Salesperson</th>
                  <th>Revenue</th>
                  <th>Deals</th>
                </tr>
              </thead>
              <tbody>
                {currentData.topSalespeople.map((person, index) => (
                  <tr key={index}>
                    <td>{person.name}</td>
                    <td className="table-value">{formatCurrency(person.value)}</td>
                    <td className="table-deals">{person.deals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;