import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions for API calls
const apiUrl = process.env.API_URL || '';

/**
 * Fetch all deals async thunk
 * @returns {Promise<Array>} List of deals
 */
export const fetchDeals = createAsyncThunk(
  'sales/fetchDeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/opportunities`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return rejectWithValue('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch deals');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Fetch a single deal by ID async thunk
 * @param {number} id - Deal ID
 * @returns {Promise<Object>} Deal data
 */
export const fetchDealById = createAsyncThunk(
  'sales/fetchDealById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/opportunities/${id}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return rejectWithValue('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch deal');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Create a new deal async thunk
 * @param {Object} dealData - Deal data
 * @returns {Promise<Object>} Created deal data
 */
export const createDeal = createAsyncThunk(
  'sales/createDeal',
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to create deal');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Update an existing deal async thunk
 * @param {Object} param0 - Object containing id and dealData
 * @param {number} param0.id - Deal ID
 * @param {Object} param0.dealData - Updated deal data
 * @returns {Promise<Object>} Updated deal data
 */
export const updateDeal = createAsyncThunk(
  'sales/updateDeal',
  async ({ id, dealData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/opportunities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update deal');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Delete a deal async thunk
 * @param {number} id - Deal ID
 * @returns {Promise<number>} Deleted deal ID
 */
export const deleteDeal = createAsyncThunk(
  'sales/deleteDeal',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/opportunities/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Failed to delete deal');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Fetch sales analytics async thunk
 * @param {Object} params - Query parameters for analytics
 * @returns {Promise<Object>} Sales analytics data
 */
export const fetchSalesAnalytics = createAsyncThunk(
  'sales/fetchSalesAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${apiUrl}/api/analytics/sales${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return rejectWithValue('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch sales analytics');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

// Initial state
const initialState = {
  deals: [],
  currentDeal: null,
  analytics: null,
  loading: false,
  error: null,
};

// Sales slice
const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Deals
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch Deal By ID
    builder
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeal = action.payload;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Create Deal
    builder
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals.push(action.payload);
        state.currentDeal = action.payload;
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Update Deal
    builder
      .addCase(updateDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        state.loading = false;
        // Update in the deals array
        const index = state.deals.findIndex(
          (deal) => deal.id === action.payload.id
        );
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        // Update current deal if it's the same one
        if (state.currentDeal && state.currentDeal.id === action.payload.id) {
          state.currentDeal = action.payload;
        }
      })
      .addCase(updateDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Delete Deal
    builder
      .addCase(deleteDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from deals array
        state.deals = state.deals.filter(
          (deal) => deal.id !== action.payload
        );
        // Clear current deal if it's the same one
        if (state.currentDeal && state.currentDeal.id === action.payload) {
          state.currentDeal = null;
        }
      })
      .addCase(deleteDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch Sales Analytics
    builder
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentDeal } = salesSlice.actions;

export default salesSlice.reducer;