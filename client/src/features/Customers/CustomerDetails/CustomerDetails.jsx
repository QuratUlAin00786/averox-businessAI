import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomerSuccess } from '../customerSlice';
import MainLayout from '../../../layouts/MainLayout';
import './CustomerDetails.css';

/**
 * CustomerDetails Component
 * Displays and allows editing of a customer's information
 */
const CustomerDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.customers);
  const loading = useSelector(state => state.customers.loading);
  const error = useSelector(state => state.customers.error);
  
  // Find customer from store based on URL param
  const customerId = parseInt(id, 10);
  const customer = customers.find(c => c.id === customerId);
  
  // Local state for form editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    industry: '',
    website: '',
    notes: ''
  });
  
  // Initialize form data when customer data is available
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country || '',
        industry: customer.industry || '',
        website: customer.website || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create updated customer object
    const updatedCustomer = {
      ...customer,
      ...formData
    };
    
    // In a real app, this would dispatch an API call
    // For demo purposes, directly update the Redux store
    dispatch(updateCustomerSuccess(updatedCustomer));
    setIsEditing(false);
  };
  
  if (loading) {
    return <div className="loading">Loading customer details...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!customer) {
    return <div className="customer-not-found">Customer not found</div>;
  }
  
  return (
    <MainLayout>
      <div className="customer-details-container">
        <header className="customer-details-header">
          <div className="customer-header-info">
            <h1 className="customer-name">{customer.name}</h1>
            <span className="customer-company">{customer.company}</span>
          </div>
          <div className="customer-actions">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="button-primary"
                  onClick={handleSubmit}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="button-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Customer
              </button>
            )}
          </div>
        </header>
        
        <div className="customer-details-content">
          {isEditing ? (
            <form className="customer-edit-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="section-title">Basic Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h2 className="section-title">Address</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h2 className="section-title">Additional Information</h2>
                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </form>
          ) : (
            <div className="customer-info">
              <div className="info-section">
                <h2 className="section-title">Contact Information</h2>
                <div className="info-grid">
                  <div className="info-group">
                    <span className="info-label">Email</span>
                    <span className="info-value">
                      <a href={`mailto:${customer.email}`} className="info-link">{customer.email}</a>
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      <a href={`tel:${customer.phone}`} className="info-link">{customer.phone}</a>
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Industry</span>
                    <span className="info-value">{customer.industry || '-'}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Website</span>
                    <span className="info-value">
                      {customer.website ? (
                        <a href={customer.website} target="_blank" rel="noopener noreferrer" className="info-link">
                          {customer.website}
                        </a>
                      ) : '-'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="info-section">
                <h2 className="section-title">Address</h2>
                <div className="info-grid">
                  <div className="info-group full-width">
                    <span className="info-label">Street Address</span>
                    <span className="info-value">{customer.address || '-'}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">City</span>
                    <span className="info-value">{customer.city || '-'}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">State/Province</span>
                    <span className="info-value">{customer.state || '-'}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Zip/Postal Code</span>
                    <span className="info-value">{customer.zipCode || '-'}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Country</span>
                    <span className="info-value">{customer.country || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div className="info-section">
                <h2 className="section-title">Additional Information</h2>
                <div className="info-notes">
                  <span className="info-label">Notes</span>
                  <p className="info-value notes-text">{customer.notes || 'No notes available.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerDetails;