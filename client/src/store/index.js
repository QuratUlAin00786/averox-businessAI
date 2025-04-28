import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Authentication/authSlice';
import customerReducer from '../features/Customers/customerSlice';
import salesReducer from '../features/Sales/salesSlice';

/**
 * Configure Redux store with all reducers
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    sales: salesReducer,
    // Add more reducers here as needed
  },
  // Enable Redux DevTools in development
  devTools: import.meta.env.MODE !== 'production',
});

export default store;