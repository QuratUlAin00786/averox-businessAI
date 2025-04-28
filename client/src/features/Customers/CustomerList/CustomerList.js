import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomersStart, fetchCustomersSuccess, fetchCustomersFailure, selectCustomer } from '../customerSlice';
import { customerService } from '../../../services/customerService';

const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        dispatch(fetchCustomersStart());
        const data = await customerService.getCustomers();
        dispatch(fetchCustomersSuccess(data));
      } catch (error) {
        dispatch(fetchCustomersFailure(error.message));
      }
    };

    fetchCustomers();
  }, [dispatch]);

  const handleSelectCustomer = (customer) => {
    dispatch(selectCustomer(customer));
  };

  if (loading) {
    return <div>Loading customers...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="customer-list">
      <h2>Customers</h2>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <ul>
          {customers.map((customer) => (
            <li 
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className="customer-list-item"
            >
              <div className="customer-name">{customer.name}</div>
              <div className="customer-email">{customer.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;