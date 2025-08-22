// Helper utilities for CryptoKindOnly

/**
 * Format currency value with proper symbol and decimals
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (e.g., 'INR', 'USD')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'INR', decimals = 2) {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    BTC: '₿',
    ETH: 'Ξ'
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  // For large numbers, use compact notation
  if (Math.abs(value) >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(decimals)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${symbol}${(value / 1000).toFixed(decimals)}K`;
  }
  
  return `${symbol}${value.toFixed(decimals)}`;
}

/**
 * Format percentage value with proper sign and decimals
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatLargeNumber(value, decimals = 2) {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(decimals)}T`;
  } else if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(decimals)}B`;
  } else if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  } else if (absValue >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  
  return value.toFixed(decimals);
}

/**
 * Validate API key
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} Whether the API key is valid
 */
function validateApiKey(apiKey) {
  // In a real application, this would check against a database or other source
  // For now, we'll just check if it's a non-empty string
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

/**
 * Sanitize user input to prevent SQL injection and XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Generate a random API key
 * @returns {string} Random API key
 */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return key;
}

/**
 * Calculate time ago from date
 * @param {Date|string} date - The date to calculate from
 * @returns {string} Time ago string (e.g., '2 hours ago')
 */
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);
  
  if (isNaN(seconds)) {
    return 'Invalid date';
  }
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

module.exports = {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  validateApiKey,
  sanitizeInput,
  generateApiKey,
  timeAgo
};