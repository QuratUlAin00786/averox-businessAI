/**
 * Customer Service
 * Handles API communication for customer-related operations
 */

// Base API URL
const API_URL = '/api';

/**
 * Fetch all customers
 * @returns {Promise<Array>} List of customers
 */
const getCustomers = async () => {
  try {
    // In a real app, this would be a fetch call
    // return await fetch(`${API_URL}/customers`).then(res => res.json());
    
    // For demo purposes, returning mock data
    return [
      {
        id: 1,
        name: 'John Smith',
        company: 'Acme Corp',
        email: 'john.smith@acmecorp.com',
        phone: '(555) 123-4567',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        industry: 'Technology',
        website: 'https://www.acmecorp.com',
        notes: 'Key decision maker. Prefers email communication.'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        company: 'Tech Solutions Inc',
        email: 'sarah.j@techsolutions.com',
        phone: '(555) 987-6543',
        address: '456 Market St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        industry: 'Software',
        website: 'https://www.techsolutions.com',
        notes: 'Interested in enterprise solutions. Follow up quarterly.'
      },
      {
        id: 3,
        name: 'Michael Chen',
        company: 'GlobalTech',
        email: 'mchen@globaltech.io',
        phone: '(555) 456-7890',
        address: '789 Innovation Way',
        city: 'Boston',
        state: 'MA',
        zipCode: '02110',
        country: 'USA',
        industry: 'Financial Services',
        website: 'https://www.globaltech.io',
        notes: 'Recently upgraded to premium plan. Schedule check-in next month.'
      }
    ];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Fetch a specific customer by ID
 * @param {number} id Customer ID
 * @returns {Promise<Object>} Customer details
 */
const getCustomerById = async (id) => {
  try {
    // In a real app, this would be a fetch call
    // return await fetch(`${API_URL}/customers/${id}`).then(res => res.json());
    
    // For demo purposes, filter from mock data
    const customers = await getCustomers();
    const customer = customers.find(c => c.id === parseInt(id, 10));
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new customer
 * @param {Object} customerData Customer data
 * @returns {Promise<Object>} Created customer
 */
const createCustomer = async (customerData) => {
  try {
    // In a real app, this would be a POST request
    /* 
    return await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    }).then(res => res.json());
    */
    
    // For demo purposes, simulate creating a customer
    const customers = await getCustomers();
    const newCustomer = {
      id: customers.length + 1,
      ...customerData,
      createdAt: new Date().toISOString()
    };
    
    return newCustomer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update an existing customer
 * @param {number} id Customer ID
 * @param {Object} customerData Updated customer data
 * @returns {Promise<Object>} Updated customer
 */
const updateCustomer = async (id, customerData) => {
  try {
    // In a real app, this would be a PUT request
    /*
    return await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    }).then(res => res.json());
    */
    
    // For demo purposes, simulate updating a customer
    const customer = await getCustomerById(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    const updatedCustomer = {
      ...customer,
      ...customerData,
      id: parseInt(id, 10),
      updatedAt: new Date().toISOString()
    };
    
    return updatedCustomer;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param {number} id Customer ID
 * @returns {Promise<void>}
 */
const deleteCustomer = async (id) => {
  try {
    // In a real app, this would be a DELETE request
    /*
    return await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to delete customer');
      }
      return true;
    });
    */
    
    // For demo purposes, simulate deleting a customer
    const customer = await getCustomerById(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};

// Export all service methods
const customerService = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export default customerService;