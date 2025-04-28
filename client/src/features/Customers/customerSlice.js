import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions for API calls
const apiUrl = process.env.API_URL || '';

/**
 * Fetch all customers async thunk
 * @returns {Promise<Array>} List of customers
 */
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return rejectWithValue('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch customers');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Fetch a single customer by ID async thunk
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} Customer data
 */
export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/${id}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return rejectWithValue('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch customer');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Create a new customer async thunk
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Created customer data
 */
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to create customer');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Update an existing customer async thunk
 * @param {Object} param0 - Object containing id and customerData
 * @param {number} param0.id - Customer ID
 * @param {Object} param0.customerData - Updated customer data
 * @returns {Promise<Object>} Updated customer data
 */
export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update customer');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Delete a customer async thunk
 * @param {number} id - Customer ID
 * @returns {Promise<number>} Deleted customer ID
 */
export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Failed to delete customer');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
};

// Customers slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch Customer By ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Create Customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
        state.currentCustomer = action.payload;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Update Customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        // Update in the customers array
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        // Update current customer if it's the same one
        if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
          state.currentCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Delete Customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from customers array
        state.customers = state.customers.filter(
          (customer) => customer.id !== action.payload
        );
        // Clear current customer if it's the same one
        if (state.currentCustomer && state.currentCustomer.id === action.payload) {
          state.currentCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCustomer } = customersSlice.actions;

export default customersSlice.reducer;