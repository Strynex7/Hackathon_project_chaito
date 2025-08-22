// API Key Controller for CryptoKindOnly
const { addApiKey, removeApiKey, listApiKeys, resetApiKeyUsage } = require('../config/apiConfig');
const { createLogger, format, transports } = require('winston');

// Create logger
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
    new transports.File({ filename: 'logs/apiKeys.log' })
  ]
});

// Add a new API key
async function addNewApiKey(req, res) {
  try {
    const { key, rateLimit } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    const result = addApiKey(key, rateLimit || 30);
    
    if (result) {
      res.json({
        success: true,
        message: 'API key added successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add API key, it may already exist'
      });
    }
  } catch (error) {
    logger.error(`Error in addNewApiKey: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add API key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Remove an API key
async function removeExistingApiKey(req, res) {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    const result = removeApiKey(key);
    
    if (result) {
      res.json({
        success: true,
        message: 'API key removed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to remove API key, it may not exist'
      });
    }
  } catch (error) {
    logger.error(`Error in removeExistingApiKey: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to remove API key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// List all API keys
async function getAllApiKeys(req, res) {
  try {
    const keys = listApiKeys();
    
    res.json({
      success: true,
      data: keys
    });
  } catch (error) {
    logger.error(`Error in getAllApiKeys: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to list API keys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Reset API key usage counts
async function resetApiKeyUsageCounts(req, res) {
  try {
    resetApiKeyUsage();
    
    res.json({
      success: true,
      message: 'API key usage counts reset successfully'
    });
  } catch (error) {
    logger.error(`Error in resetApiKeyUsageCounts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to reset API key usage counts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  addNewApiKey,
  removeExistingApiKey,
  getAllApiKeys,
  resetApiKeyUsageCounts
};