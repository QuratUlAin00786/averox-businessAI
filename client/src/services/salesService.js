/**
 * Service for sales related API calls
 */
import { apiRequest } from '../utils/api';

export const salesService = {
  /**
   * Get all deals
   * @returns {Promise<Array>} - list of deals
   */
  async getDeals() {
    return await apiRequest('/api/deals');
  },

  /**
   * Get deal by ID
   * @param {number} id - deal ID
   * @returns {Promise<Object>} - deal data
   */
  async getDealById(id) {
    return await apiRequest(`/api/deals/${id}`);
  },

  /**
   * Create a new deal
   * @param {Object} dealData - deal data
   * @returns {Promise<Object>} - created deal data
   */
  async createDeal(dealData) {
    return await apiRequest('/api/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
  },

  /**
   * Update deal
   * @param {number} id - deal ID
   * @param {Object} dealData - deal data to update
   * @returns {Promise<Object>} - updated deal data
   */
  async updateDeal(id, dealData) {
    return await apiRequest(`/api/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dealData),
    });
  },

  /**
   * Delete deal
   * @param {number} id - deal ID
   * @returns {Promise<Object>} - deletion result
   */
  async deleteDeal(id) {
    return await apiRequest(`/api/deals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get sales statistics
   * @returns {Promise<Object>} - sales statistics
   */
  async getSalesStats() {
    return await apiRequest('/api/sales/stats');
  },

  /**
   * Get sales forecast
   * @param {string} timeframe - timeframe for forecast (month, quarter, year)
   * @returns {Promise<Object>} - sales forecast data
   */
  async getSalesForecast(timeframe = 'month') {
    return await apiRequest(`/api/sales/forecast?timeframe=${timeframe}`);
  },

  /**
   * Get deal activities
   * @param {number} dealId - deal ID
   * @returns {Promise<Array>} - list of deal activities
   */
  async getDealActivities(dealId) {
    return await apiRequest(`/api/deals/${dealId}/activities`);
  }
};