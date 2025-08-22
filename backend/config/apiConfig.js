// API Configuration for CryptoKindOnly
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Create logger for API operations
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/api.log' })
  ]
});

// Create axios instance for CoinMarketCap API
const coinMarketCapApi = axios.create({
  baseURL: process.env.COINMARKETCAP_API_URL,
  headers: {
    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
    'Accept': 'application/json',
    'Accept-Encoding': 'deflate, gzip'
  },
  timeout: 10000 // 10 seconds timeout
});

// API Key management
const API_KEYS_DIR = path.join(__dirname, 'apiKeys');

// Ensure the apiKeys directory exists
if (!fs.existsSync(API_KEYS_DIR)) {
  fs.mkdirSync(API_KEYS_DIR, { recursive: true });
}

// Function to load API keys from file
function loadApiKeys() {
  try {
    const keysPath = path.join(API_KEYS_DIR, 'coinmarketcap.json');
    
    if (!fs.existsSync(keysPath)) {
      // Create default file with the key from .env
      const defaultKeys = {
        keys: [{ key: process.env.COINMARKETCAP_API_KEY, rateLimit: 30, used: 0 }],
        lastRotation: new Date().toISOString()
      };
      
      fs.writeFileSync(keysPath, JSON.stringify(defaultKeys, null, 2));
      logger.info('Created default API keys file');
      return defaultKeys;
    }
    
    const keysData = fs.readFileSync(keysPath, 'utf8');
    return JSON.parse(keysData);
  } catch (error) {
    logger.error(`Error loading API keys: ${error.message}`);
    return { keys: [], lastRotation: new Date().toISOString() };
  }
}

// Function to save API keys to file
function saveApiKeys(keysData) {
  try {
    const keysPath = path.join(API_KEYS_DIR, 'coinmarketcap.json');
    fs.writeFileSync(keysPath, JSON.stringify(keysData, null, 2));
    logger.info('Updated API keys file');
  } catch (error) {
    logger.error(`Error saving API keys: ${error.message}`);
  }
}

// Function to get the next available API key
function getNextApiKey() {
  const keysData = loadApiKeys();
  
  if (keysData.keys.length === 0) {
    logger.error('No API keys available');
    throw new Error('No API keys available');
  }
  
  // Find the key with the least usage
  const sortedKeys = [...keysData.keys].sort((a, b) => a.used - b.used);
  const selectedKey = sortedKeys[0];
  
  // Update usage count
  selectedKey.used += 1;
  saveApiKeys(keysData);
  
  return selectedKey.key;
}

// Function to reset API key usage counts (can be called daily)
function resetApiKeyUsage() {
  const keysData = loadApiKeys();
  
  keysData.keys.forEach(key => {
    key.used = 0;
  });
  
  keysData.lastRotation = new Date().toISOString();
  saveApiKeys(keysData);
  logger.info('Reset API key usage counts');
}

// Function to make API requests with automatic key rotation
async function makeApiRequest(endpoint, params = {}) {
  try {
    // Get the next available API key
    const apiKey = getNextApiKey();
    
    // Update the API key in the headers
    coinMarketCapApi.defaults.headers['X-CMC_PRO_API_KEY'] = apiKey;
    
    // Make the request
    const response = await coinMarketCapApi.get(endpoint, { params });
    logger.info(`API request successful: ${endpoint}`);
    
    return response.data;
  } catch (error) {
    logger.error(`API request failed: ${error.message}`);
    
    if (error.response) {
      logger.error(`Status: ${error.response.status}`);
      logger.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
}

// Function to add a new API key
function addApiKey(key, rateLimit = 30) {
  try {
    const keysData = loadApiKeys();
    
    // Check if key already exists
    const keyExists = keysData.keys.some(k => k.key === key);
    
    if (keyExists) {
      logger.warn(`API key ${key.substring(0, 5)}... already exists`);
      return false;
    }
    
    // Add new key
    keysData.keys.push({
      key,
      rateLimit,
      used: 0
    });
    
    saveApiKeys(keysData);
    logger.info(`Added new API key ${key.substring(0, 5)}...`);
    return true;
  } catch (error) {
    logger.error(`Error adding API key: ${error.message}`);
    return false;
  }
}

// Function to remove an API key
function removeApiKey(key) {
  try {
    const keysData = loadApiKeys();
    
    // Check if key exists
    const initialLength = keysData.keys.length;
    keysData.keys = keysData.keys.filter(k => k.key !== key);
    
    if (keysData.keys.length === initialLength) {
      logger.warn(`API key ${key.substring(0, 5)}... not found`);
      return false;
    }
    
    saveApiKeys(keysData);
    logger.info(`Removed API key ${key.substring(0, 5)}...`);
    return true;
  } catch (error) {
    logger.error(`Error removing API key: ${error.message}`);
    return false;
  }
}

// Function to list all API keys (without showing full keys for security)
function listApiKeys() {
  try {
    const keysData = loadApiKeys();
    
    return keysData.keys.map(k => ({
      key: `${k.key.substring(0, 5)}...${k.key.substring(k.key.length - 5)}`,
      rateLimit: k.rateLimit,
      used: k.used
    }));
  } catch (error) {
    logger.error(`Error listing API keys: ${error.message}`);
    return [];
  }
}

module.exports = {
  coinMarketCapApi,
  makeApiRequest,
  loadApiKeys,
  saveApiKeys,
  getNextApiKey,
  resetApiKeyUsage,
  addApiKey,
  removeApiKey,
  listApiKeys
};