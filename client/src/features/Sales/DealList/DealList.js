import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealsStart, fetchDealsSuccess, fetchDealsFailure, selectDeal } from '../salesSlice';
import { salesService } from '../../../services/salesService';

const DealList = () => {
  const dispatch = useDispatch();
  const { deals, loading, error } = useSelector((state) => state.sales);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        dispatch(fetchDealsStart());
        const data = await salesService.getDeals();
        dispatch(fetchDealsSuccess(data));
      } catch (error) {
        dispatch(fetchDealsFailure(error.message));
      }
    };

    fetchDeals();
  }, [dispatch]);

  const handleSelectDeal = (deal) => {
    dispatch(selectDeal(deal));
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'won':
        return 'status-won';
      case 'lost':
        return 'status-lost';
      case 'negotiation':
        return 'status-negotiation';
      case 'proposal':
        return 'status-proposal';
      case 'qualified':
        return 'status-qualified';
      default:
        return 'status-new';
    }
  };

  if (loading) {
    return <div>Loading deals...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="deal-list">
      <h2>Deals Pipeline</h2>
      
      <div className="deal-filter">
        {/* Filter options would go here */}
        <select className="filter-dropdown">
          <option value="all">All Deals</option>
          <option value="won">Won</option>
          <option value="active">Active</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      
      {deals.length === 0 ? (
        <p>No deals found.</p>
      ) : (
        <div className="deals-table">
          <div className="table-header">
            <div className="col-name">Deal Name</div>
            <div className="col-customer">Customer</div>
            <div className="col-amount">Amount</div>
            <div className="col-stage">Stage</div>
            <div className="col-status">Status</div>
          </div>
          
          {deals.map((deal) => (
            <div 
              key={deal.id}
              onClick={() => handleSelectDeal(deal)}
              className="deal-row"
            >
              <div className="col-name">{deal.name}</div>
              <div className="col-customer">{deal.customerName}</div>
              <div className="col-amount">${deal.amount.toLocaleString()}</div>
              <div className="col-stage">{deal.stage}</div>
              <div className={`col-status ${getStatusClass(deal.status)}`}>
                {deal.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealList;