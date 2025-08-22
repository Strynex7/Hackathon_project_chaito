// Feedback Routes for CryptoKindOnly
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit user feedback
router.post('/submit', feedbackController.submitFeedback);

// Get all feedback (admin only)
router.get('/', feedbackController.getAllFeedback);

// Update feedback status (admin only)
router.patch('/:id/status', feedbackController.updateFeedbackStatus);

// Delete feedback (admin only)
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;