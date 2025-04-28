import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions for API calls
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Login async thunk
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Authenticated user data
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Login failed');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Register async thunk
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Logout async thunk
 * @returns {Promise<void>}
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Logout failed');
      }
      
      return null;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

/**
 * Fetch current user async thunk
 * @returns {Promise<Object>} Current user data
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/user`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return null; // Not authenticated, but not an error
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch user data');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;