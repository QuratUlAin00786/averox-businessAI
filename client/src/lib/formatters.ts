/**
 * Utility functions for formatting data consistently throughout the app
 */

/**
 * Format a date string to a localized date format
 * @param dateStr Date string to format
 * @param options Intl.DateTimeFormatOptions to customize the output
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | null | undefined, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  if (!dateStr) return '—';
  
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr.toString();
  }
}

/**
 * Format a datetime string to a localized date and time format
 * @param dateTimeStr DateTime string to format
 * @returns Formatted datetime string
 */
export function formatDateTime(
  dateTimeStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  return formatDate(dateTimeStr, options);
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency Currency code (e.g., USD, EUR)
 * @param options Intl.NumberFormatOptions to customize the output
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  if (amount === null || amount === undefined) return '—';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '—';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }).format(numAmount);
  } catch (e) {
    console.error('Error formatting currency:', e);
    return numAmount.toString();
  }
}

/**
 * Format a number with appropriate decimal places
 * @param num Number to format
 * @param decimalPlaces Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(
  num: number | string | null | undefined,
  decimalPlaces: number = 2
): string {
  if (num === null || num === undefined) return '—';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '—';
  
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces
    }).format(numValue);
  } catch (e) {
    console.error('Error formatting number:', e);
    return numValue.toString();
  }
}

/**
 * Format a percentage
 * @param value Percentage value (0-100 or 0-1)
 * @param decimalPlaces Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimalPlaces: number = 1
): string {
  if (value === null || value === undefined) return '—';
  
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '—';
  
  // If value is a fraction between 0-1, convert to percentage
  if (numValue > 0 && numValue < 1) {
    numValue = numValue * 100;
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces
    }).format(numValue / 100);
  } catch (e) {
    console.error('Error formatting percentage:', e);
    return `${numValue}%`;
  }
}

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes Size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number | null | undefined, decimals: number = 2): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a phone number to a standard format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  
  // Strip all non-numeric characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
  }
  
  // If we can't format it, return original
  return phone;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length (default: 50)
 * @returns Truncated string
 */
export function truncateString(str: string | null | undefined, maxLength: number = 50): string {
  if (!str) return '—';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength - 3) + '...';
}