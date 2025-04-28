import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import salesService from '../../services/salesService';

// Initial state
const initialState = {
  deals: [],
  currentDeal: null,
  metrics: {
    totalSales: 0,
    averageDealSize: 0,
    conversionRate: 0,
    salesByStage: {},
    topProducts: [],
    topSalespeople: []
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchDeals = createAsyncThunk(
  'sales/fetchDeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await salesService.getDeals();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDealById = createAsyncThunk(
  'sales/fetchDealById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await salesService.getDealById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSalesMetrics = createAsyncThunk(
  'sales/fetchSalesMetrics',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await salesService.getSalesMetrics(timeRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDeal = createAsyncThunk(
  'sales/createDeal',
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await salesService.createDeal(dealData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDeal = createAsyncThunk(
  'sales/updateDeal',
  async ({ id, dealData }, { rejectWithValue }) => {
    try {
      const response = await salesService.updateDeal(id, dealData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDeal = createAsyncThunk(
  'sales/deleteDeal',
  async (id, { rejectWithValue }) => {
    try {
      await salesService.deleteDeal(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    // Synchronous actions
    setCurrentDeal: (state, action) => {
      state.currentDeal = action.payload;
    },
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
    fetchDealsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDealsSuccess: (state, action) => {
      state.deals = action.payload;
      state.loading = false;
    },
    fetchDealsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectDeal: (state, action) => {
      state.currentDeal = state.deals.find(deal => deal.id === action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch deals
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.deals = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch deal by id
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.currentDeal = action.payload;
        state.loading = false;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch sales metrics
      .addCase(fetchSalesMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
        state.loading = false;
      })
      .addCase(fetchSalesMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create deal
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.deals.push(action.payload);
        state.loading = false;
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update deal
      .addCase(updateDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        if (state.currentDeal && state.currentDeal.id === action.payload.id) {
          state.currentDeal = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete deal
      .addCase(deleteDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter(d => d.id !== action.payload);
        if (state.currentDeal && state.currentDeal.id === action.payload) {
          state.currentDeal = null;
        }
        state.loading = false;
      })
      .addCase(deleteDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  setCurrentDeal, 
  clearCurrentDeal, 
  fetchDealsStart, 
  fetchDealsSuccess, 
  fetchDealsFailure, 
  selectDeal 
} = salesSlice.actions;

export default salesSlice.reducer;

// Selectors
export const selectAllDeals = (state) => state.sales.deals;
export const selectCurrentDeal = (state) => state.sales.currentDeal;
export const selectSalesMetrics = (state) => state.sales.metrics;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;