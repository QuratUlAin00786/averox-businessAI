/**
 * Sales Service
 * Handles API communication for sales-related operations
 */

// Base API URL
const API_URL = '/api';

/**
 * Fetch all deals
 * @returns {Promise<Array>} List of deals
 */
const getDeals = async () => {
  try {
    // In a real app, this would be a fetch call
    // return await fetch(`${API_URL}/deals`).then(res => res.json());
    
    // For demo purposes, returning mock data
    return [
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
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

/**
 * Fetch a specific deal by ID
 * @param {number} id Deal ID
 * @returns {Promise<Object>} Deal details
 */
const getDealById = async (id) => {
  try {
    // In a real app, this would be a fetch call
    // return await fetch(`${API_URL}/deals/${id}`).then(res => res.json());
    
    // For demo purposes, filter from mock data
    const deals = await getDeals();
    const deal = deals.find(d => d.id === parseInt(id, 10));
    
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    return deal;
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch sales metrics (possibly filtered by time range)
 * @param {string} timeRange Time range for metrics (e.g., 'day', 'week', 'month', 'year')
 * @returns {Promise<Object>} Sales metrics data
 */
const getSalesMetrics = async (timeRange = 'month') => {
  try {
    // In a real app, this would be a fetch call with query params
    // return await fetch(`${API_URL}/sales/metrics?timeRange=${timeRange}`).then(res => res.json());
    
    // For demo purposes, returning mock metrics data
    return {
      totalSales: 288000,
      averageDealSize: 72000,
      conversionRate: 35,
      salesByStage: {
        'Lead Generation': 85000,
        'Qualification': 0,
        'Proposal': 48000,
        'Negotiation': 120000,
        'Closing': 35000
      },
      topProducts: [
        { name: 'Enterprise License', amount: 150000 },
        { name: 'Support Contract', amount: 85000 },
        { name: 'Custom Development', amount: 53000 }
      ],
      topSalespeople: [
        { name: 'Jane Smith', amount: 155000, deals: 2 },
        { name: 'John Doe', amount: 48000, deals: 1 },
        { name: 'Robert Johnson', amount: 85000, deals: 1 }
      ]
    };
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    throw error;
  }
};

/**
 * Create a new deal
 * @param {Object} dealData Deal data
 * @returns {Promise<Object>} Created deal
 */
const createDeal = async (dealData) => {
  try {
    // In a real app, this would be a POST request
    /* 
    return await fetch(`${API_URL}/deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    }).then(res => res.json());
    */
    
    // For demo purposes, simulate creating a deal
    const deals = await getDeals();
    const newDeal = {
      id: deals.length + 1,
      ...dealData,
      createdAt: new Date().toISOString()
    };
    
    return newDeal;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

/**
 * Update an existing deal
 * @param {number} id Deal ID
 * @param {Object} dealData Updated deal data
 * @returns {Promise<Object>} Updated deal
 */
const updateDeal = async (id, dealData) => {
  try {
    // In a real app, this would be a PUT request
    /*
    return await fetch(`${API_URL}/deals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    }).then(res => res.json());
    */
    
    // For demo purposes, simulate updating a deal
    const deal = await getDealById(id);
    
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    const updatedDeal = {
      ...deal,
      ...dealData,
      id: parseInt(id, 10),
      updatedAt: new Date().toISOString()
    };
    
    return updatedDeal;
  } catch (error) {
    console.error(`Error updating deal ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a deal
 * @param {number} id Deal ID
 * @returns {Promise<boolean>} Success indicator
 */
const deleteDeal = async (id) => {
  try {
    // In a real app, this would be a DELETE request
    /*
    return await fetch(`${API_URL}/deals/${id}`, {
      method: 'DELETE',
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to delete deal');
      }
      return true;
    });
    */
    
    // For demo purposes, simulate deleting a deal
    const deal = await getDealById(id);
    
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting deal ${id}:`, error);
    throw error;
  }
};

// Export all service methods
const salesService = {
  getDeals,
  getDealById,
  getSalesMetrics,
  createDeal,
  updateDeal,
  deleteDeal
};

export default salesService;