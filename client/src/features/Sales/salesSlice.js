// Sales state management slice
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deals: [],
  selectedDeal: null,
  salesStats: {
    totalRevenue: 0,
    openDeals: 0,
    closedDeals: 0,
    conversionRate: 0
  },
  loading: false,
  error: null,
};

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    fetchDealsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDealsSuccess: (state, action) => {
      state.deals = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchDealsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    updateStatsSuccess: (state, action) => {
      state.salesStats = action.payload;
    },
    addDealSuccess: (state, action) => {
      state.deals.push(action.payload);
    },
    updateDealSuccess: (state, action) => {
      const index = state.deals.findIndex(deal => deal.id === action.payload.id);
      if (index !== -1) {
        state.deals[index] = action.payload;
      }
      if (state.selectedDeal && state.selectedDeal.id === action.payload.id) {
        state.selectedDeal = action.payload;
      }
    },
    deleteDealSuccess: (state, action) => {
      state.deals = state.deals.filter(deal => deal.id !== action.payload);
      if (state.selectedDeal && state.selectedDeal.id === action.payload) {
        state.selectedDeal = null;
      }
    }
  },
});

export const { 
  fetchDealsStart,
  fetchDealsSuccess,
  fetchDealsFailure,
  selectDeal,
  updateStatsSuccess,
  addDealSuccess,
  updateDealSuccess,
  deleteDealSuccess
} = salesSlice.actions;

export default salesSlice.reducer;