// API Key Routes for CryptoKindOnly
const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');

// Add a new API key
router.post('/add', apiKeyController.addNewApiKey);

// Remove an API key
router.post('/remove', apiKeyController.removeExistingApiKey);

// List all API keys
router.get('/list', apiKeyController.getAllApiKeys);

// Reset API key usage counts
router.post('/reset-usage', apiKeyController.resetApiKeyUsageCounts);

module.exports = router;