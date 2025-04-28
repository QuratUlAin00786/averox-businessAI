/**
 * Utility functions for API requests
 */

/**
 * Make an API request with fetch
 * @param {string} url - API endpoint
 * @param {Object} options - fetch options
 * @returns {Promise<any>} - response data
 * @throws {Error} - API error
 */
export const apiRequest = async (url, options = {}) => {
  try {
    // Set default headers if not provided
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Include credentials for session cookies
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include'
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`, fetchOptions.body);

    const response = await fetch(url, fetchOptions);
    
    // Parse response data
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`API Response: ${options.method || 'GET'} ${url} - Status: ${response.status}`, data);

    // Handle non-2xx responses
    if (!response.ok) {
      console.error(`API Error: ${options.method || 'GET'} ${url}`, data);
      throw data;
    }

    return data;
  } catch (error) {
    console.error(`API Request Failed: ${url}`, error);
    throw error;
  }
};

/**
 * Format an error message from API response
 * @param {Object|string} error - error object or message
 * @returns {string} - formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return error.error;
  }
  
  return 'An unknown error occurred';
};