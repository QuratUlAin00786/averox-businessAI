import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealsStart, fetchDealsSuccess, fetchDealsFailure, selectDeal } from '../salesSlice';
import { Link } from 'wouter';
import './DealList.css';

/**
 * DealList Component
 * Displays a list of all active deals in the system
 */
const DealList = () => {
  const dispatch = useDispatch();
  const deals = useSelector(state => state.sales.deals);
  const loading = useSelector(state => state.sales.loading);
  const error = useSelector(state => state.sales.error);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        dispatch(fetchDealsStart());
        // Mock data for demo purposes
        const mockDeals = [
          {
            id: 1,
            name: 'Enterprise License Agreement',
            customer: 'Acme Corp',
            amount: 120000,
            stage: 'Negotiation',
            probability: 75,
            expectedCloseDate: '2023-06-30',
            createdAt: '2023-03-15',
            assignedTo: 'Jane Smith'
          },
          {
            id: 2,
            name: 'Annual Support Contract',
            customer: 'Tech Solutions Inc',
            amount: 48000,
            stage: 'Proposal',
            probability: 60,
            expectedCloseDate: '2023-05-15',
            createdAt: '2023-02-28',
            assignedTo: 'John Doe'
          },
          {
            id: 3,
            name: 'Platform Migration Services',
            customer: 'GlobalTech',
            amount: 85000,
            stage: 'Lead Generation',
            probability: 30,
            expectedCloseDate: '2023-08-01',
            createdAt: '2023-04-01',
            assignedTo: 'Robert Johnson'
          },
          {
            id: 4,
            name: 'Software Customization',
            customer: 'Innovative Systems',
            amount: 35000,
            stage: 'Closing',
            probability: 90,
            expectedCloseDate: '2023-04-30',
            createdAt: '2023-03-10',
            assignedTo: 'Jane Smith'
          }
        ];
        dispatch(fetchDealsSuccess(mockDeals));
      } catch (error) {
        dispatch(fetchDealsFailure(error.message));
      }
    };

    fetchDeals();
  }, [dispatch]);

  // Handle deal selection
  const handleDealClick = (id) => {
    dispatch(selectDeal(id));
  };

  // Filter deals by status
  const filterDeals = (deals) => {
    if (filterStatus === 'All') {
      return deals;
    }
    return deals.filter(deal => deal.stage === filterStatus);
  };

  // Sort deals
  const sortDeals = (deals) => {
    return [...deals].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle string and number sorting
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };
  
  // Toggle sort direction
  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted deals
  const filteredDeals = filterDeals(deals);
  const sortedDeals = sortDeals(filteredDeals);

  // Calculate total value of deals
  const totalDealValue = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);

  if (loading) {
    return <div className="loading">Loading deals...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="deal-list-container">
      <div className="deal-list-header">
        <h2 className="deal-list-title">Deals</h2>
        <div className="deal-list-actions">
          <Link to="/deals/new" className="button-primary">New Deal</Link>
        </div>
      </div>
      
      <div className="deal-list-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Stages</option>
            <option value="Lead Generation">Lead Generation</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closing">Closing</option>
          </select>
        </div>
        <div className="deal-summary">
          <span className="summary-label">Total Value:</span>
          <span className="summary-value">${totalDealValue.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="deal-list-table-container">
        <table className="deal-list-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange('name')}>
                Deal Name
                {sortBy === 'name' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('customer')}>
                Customer
                {sortBy === 'customer' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('amount')}>
                Amount
                {sortBy === 'amount' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('stage')}>
                Stage
                {sortBy === 'stage' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('probability')}>
                Probability
                {sortBy === 'probability' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('expectedCloseDate')}>
                Expected Close
                {sortBy === 'expectedCloseDate' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('assignedTo')}>
                Assigned To
                {sortBy === 'assignedTo' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDeals.map(deal => (
              <tr 
                key={deal.id} 
                onClick={() => handleDealClick(deal.id)}
                className="deal-row"
              >
                <td>
                  <Link to={`/deals/${deal.id}`} className="deal-name-link">
                    {deal.name}
                  </Link>
                </td>
                <td>{deal.customer}</td>
                <td className="deal-amount">${deal.amount.toLocaleString()}</td>
                <td>
                  <span className={`deal-stage deal-stage-${deal.stage.toLowerCase().replace(/ /g, '-')}`}>
                    {deal.stage}
                  </span>
                </td>
                <td>
                  <div className="probability-container">
                    <div 
                      className="probability-bar" 
                      style={{ width: `${deal.probability}%` }}
                    ></div>
                    <span className="probability-text">{deal.probability}%</span>
                  </div>
                </td>
                <td>{new Date(deal.expectedCloseDate).toLocaleDateString()}</td>
                <td>{deal.assignedTo}</td>
              </tr>
            ))}
            {sortedDeals.length === 0 && (
              <tr>
                <td colSpan="7" className="no-deals-message">
                  No deals found. Create a new deal to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealList;