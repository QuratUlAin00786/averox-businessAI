// Customer state management slice
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};

export const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    fetchCustomersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCustomersSuccess: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchCustomersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    addCustomerSuccess: (state, action) => {
      state.customers.push(action.payload);
    },
    updateCustomerSuccess: (state, action) => {
      const index = state.customers.findIndex(customer => customer.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload.id) {
        state.selectedCustomer = action.payload;
      }
    },
    deleteCustomerSuccess: (state, action) => {
      state.customers = state.customers.filter(customer => customer.id !== action.payload);
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
        state.selectedCustomer = null;
      }
    }
  },
});

export const { 
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  selectCustomer,
  addCustomerSuccess,
  updateCustomerSuccess,
  deleteCustomerSuccess
} = customerSlice.actions;

export default customerSlice.reducer;