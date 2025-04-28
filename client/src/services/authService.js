/**
 * Service for authentication related API calls
 */
import { apiRequest } from '../utils/api';

export const authService = {
  /**
   * Login user with credentials
   * @param {Object} credentials - username and password
   * @returns {Promise<Object>} - user data
   */
  async login(credentials) {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user
   * @param {Object} userData - user registration data
   * @returns {Promise<Object>} - created user data
   */
  async register(userData) {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Log out current user
   * @returns {Promise<Object>} - logout result
   */
  async logout() {
    return await apiRequest('/api/auth/logout', {
      method: 'POST'
    });
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} - user profile data
   */
  async getCurrentUser() {
    return await apiRequest('/api/user');
  },

  /**
   * Update user profile
   * @param {Object} profileData - profile data to update
   * @returns {Promise<Object>} - updated user profile
   */
  async updateProfile(profileData) {
    return await apiRequest('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Change user password
   * @param {Object} passwordData - old and new password
   * @returns {Promise<Object>} - password change result
   */
  async changePassword(passwordData) {
    return await apiRequest('/api/user/password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }
};