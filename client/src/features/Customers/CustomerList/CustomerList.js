import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'wouter';
import MainLayout from '../../../layouts/MainLayout';
import { fetchCustomers } from '../customerSlice';
import './CustomerList.css';

/**
 * Customer list page component
 * Displays a list of all customers with filtering and sorting options
 * 
 * @returns {JSX.Element} CustomerList component
 */
const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for a new sort field
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  // Filter customers based on search term and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.industry && customer.industry.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Apply active/inactive filter
    if (filter === 'active') {
      return matchesSearch && customer.isActive;
    } else if (filter === 'inactive') {
      return matchesSearch && !customer.isActive;
    }
    
    return matchesSearch;
  });
  
  // Sort filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle null values for sorting
    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';
    
    // Sort strings properly
    if (typeof aValue === 'string') {
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else {
      // Sort numbers
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
  });
  
  return (
    <MainLayout>
      <div className="customer-list-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-description">
              Manage your customer accounts and contacts
            </p>
          </div>
          
          <div className="page-actions">
            <Link to="/customers/new" className="add-customer-button">
              Add Customer
            </Link>
          </div>
        </div>
        
        <div className="list-controls">
          <div className="search-filter">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-container">
              <select
                value={filter}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Customers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
          
          <div className="results-info">
            Showing {sortedCustomers.length} of {customers.length} customers
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            Error loading customers: {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-indicator">
            <span className="loading-spinner"></span>
            <span>Loading customers...</span>
          </div>
        ) : (
          <div className="customers-table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className={sortField === 'name' ? `sorted ${sortDirection}` : ''}>
                    Customer Name
                    {sortField === 'name' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('industry')} className={sortField === 'industry' ? `sorted ${sortDirection}` : ''}>
                    Industry
                    {sortField === 'industry' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('email')} className={sortField === 'email' ? `sorted ${sortDirection}` : ''}>
                    Email
                    {sortField === 'email' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('phone')} className={sortField === 'phone' ? `sorted ${sortDirection}` : ''}>
                    Phone
                    {sortField === 'phone' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('isActive')} className={sortField === 'isActive' ? `sorted ${sortDirection}` : ''}>
                    Status
                    {sortField === 'isActive' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.length > 0 ? (
                  sortedCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <Link to={`/customers/${customer.id}`} className="customer-name-link">
                          {customer.name}
                        </Link>
                      </td>
                      <td>{customer.industry || '—'}</td>
                      <td>{customer.email || '—'}</td>
                      <td>{customer.phone || '—'}</td>
                      <td>
                        <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/customers/${customer.id}/edit`} className="action-button edit">
                            Edit
                          </Link>
                          <Link to={`/customers/${customer.id}`} className="action-button view">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No customers found. {searchTerm && 'Try adjusting your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CustomerList;