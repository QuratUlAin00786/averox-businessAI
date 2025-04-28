import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealsStart, fetchDealsSuccess, fetchDealsFailure, updateStatsSuccess } from '../salesSlice';
import { salesService } from '../../../services/salesService';

const SalesDashboard = () => {
  const dispatch = useDispatch();
  const { salesStats, loading, error } = useSelector((state) => state.sales);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        dispatch(fetchDealsStart());
        
        // Fetch deals
        const dealsData = await salesService.getDeals();
        dispatch(fetchDealsSuccess(dealsData));
        
        // Fetch sales statistics
        const statsData = await salesService.getSalesStats();
        dispatch(updateStatsSuccess(statsData));
      } catch (error) {
        dispatch(fetchDealsFailure(error.message));
      }
    };

    fetchSalesData();
  }, [dispatch]);

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="sales-dashboard">
      <h2>Sales Dashboard</h2>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">${salesStats.totalRevenue.toLocaleString()}</div>
        </div>
        
        <div className="stat-card">
          <h3>Open Deals</h3>
          <div className="stat-value">{salesStats.openDeals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Closed Deals</h3>
          <div className="stat-value">{salesStats.closedDeals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <div className="stat-value">{salesStats.conversionRate}%</div>
        </div>
      </div>
      
      {/* Sales chart would go here */}
      <div className="sales-chart">
        <h3>Sales Trend</h3>
        <p>Chart visualization will be implemented here</p>
      </div>
      
      {/* Top deals summary */}
      <div className="top-deals">
        <h3>Top Deals</h3>
        <p>Recent high-value opportunities</p>
        {/* Deal list would go here */}
      </div>
    </div>
  );
};

export default SalesDashboard;