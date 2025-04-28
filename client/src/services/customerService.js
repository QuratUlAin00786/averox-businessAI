/**
 * Service for customer related API calls
 */
import { apiRequest } from '../utils/api';

export const customerService = {
  /**
   * Get all customers
   * @returns {Promise<Array>} - list of customers
   */
  async getCustomers() {
    return await apiRequest('/api/customers');
  },

  /**
   * Get customer by ID
   * @param {number} id - customer ID
   * @returns {Promise<Object>} - customer data
   */
  async getCustomerById(id) {
    return await apiRequest(`/api/customers/${id}`);
  },

  /**
   * Create a new customer
   * @param {Object} customerData - customer data
   * @returns {Promise<Object>} - created customer data
   */
  async createCustomer(customerData) {
    return await apiRequest('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  /**
   * Update customer
   * @param {number} id - customer ID
   * @param {Object} customerData - customer data to update
   * @returns {Promise<Object>} - updated customer data
   */
  async updateCustomer(id, customerData) {
    return await apiRequest(`/api/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    });
  },

  /**
   * Delete customer
   * @param {number} id - customer ID
   * @returns {Promise<Object>} - deletion result
   */
  async deleteCustomer(id) {
    return await apiRequest(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get customer notes
   * @param {number} customerId - customer ID
   * @returns {Promise<Array>} - list of customer notes
   */
  async getCustomerNotes(customerId) {
    return await apiRequest(`/api/customers/${customerId}/notes`);
  },

  /**
   * Add customer note
   * @param {number} customerId - customer ID
   * @param {Object} noteData - note data
   * @returns {Promise<Object>} - created note
   */
  async addCustomerNote(customerId, noteData) {
    return await apiRequest(`/api/customers/${customerId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }
};