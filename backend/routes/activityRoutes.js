// Activity Routes for CryptoKindOnly
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Get activity logs with pagination and filtering
router.get('/logs', activityController.getActivityLogs);

// Get activity statistics
router.get('/stats', activityController.getActivityStats);

// Clear old activity logs
router.delete('/logs/clear', activityController.clearOldLogs);

module.exports = router;